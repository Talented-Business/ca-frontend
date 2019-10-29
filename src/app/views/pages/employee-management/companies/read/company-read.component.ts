// Angular
import { Component, OnInit, Inject, ChangeDetectionStrategy, ViewEncapsulation, OnDestroy,ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
// Material
import { MatDialog,MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
// RxJS
import { Observable,BehaviorSubject,Subscription, of } from 'rxjs';
import { delay,catchError } from 'rxjs/operators';
import {  Update } from '@ngrx/entity';
// NGRX
import { Store, select } from '@ngrx/store';
// CRUD
import { LayoutUtilsService, MessageType, QueryResultsModel } from '../../../../../core/_base/crud';
// State
import { AppState } from '../../../../../core/reducers';
// Services and Models
import { 
    selectCompanyById,
    selectCompaniesBackProcessingFailed,
    selectCompaniesBackProcessingSuccess,
	CompanyModel, 
    CompanyService,
    CompanyUpdated 
} from '../../../../../core/humanresource';
import { CompanyEditDialogComponent } from '../edit/company-edit.dialog.component';
@Component({
	// tslint:disable-next-line:component-selector
	selector: 'kt-companies-read',
	templateUrl: './company-read.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
	encapsulation: ViewEncapsulation.None
})
export class CompanyReadComponent implements OnInit, OnDestroy {
	// Public properties
	company: CompanyModel;
	companyId$: Observable<number>;
	selectedTab: number = 0;
	loadingSubject = new BehaviorSubject<boolean>(true);
	loading$: Observable<boolean>;
	companyForm: FormGroup;
	hasFormErrors: boolean = false;
	availableNationalities:string[];

	// Private properties
	private componentSubscriptions: Subscription[]=[];
	private viewStatus:any;
	private companyStatus:String;

	/**
	 * Component constructor
	 *
	 * @param dialogRef: MatDialogRef<CompanyReadComponent>
	 * @param fb: FormBuilder
	 * @param store: Store<AppState>
	 * @param typesUtilsService: TypesUtilsService
	 */
	constructor(
		private store: Store<AppState>,
		private activatedRoute: ActivatedRoute,
		private router: Router,
		public dialog: MatDialog,
        private companyService: CompanyService,
        private layoutUtilsService: LayoutUtilsService,
		private cdr: ChangeDetectorRef) {
	}

	/**
	 * @ Lifecycle sequences => https://angular.io/guide/lifecycle-hooks
	 */

	/**
	 * On init
	 */
	ngOnInit() {
		//this.store.pipe(select(selectCompaniesActionLoading)).subscribe(res => this.viewLoading = res);
		this.loading$ = this.loadingSubject.asObservable();
		this.loadingSubject.next(true);
		this.activatedRoute.params.subscribe(params => {
			const id = params['id'];
			if (id && id > 0) {
				this.store.pipe(
					select(selectCompanyById(id))
				).subscribe(result => {
					if (!result) {
						this.loadCompanyFromService(id);
						return;
					}
					this.loadCompany(result);
				});
			} else {
				alert('error');
			}
		});
	}

	/**
	 * On destroy
	 */
	ngOnDestroy() {
		this.componentSubscriptions.forEach(el => el.unsubscribe());
	}

	/**
	 * Returns page title
	 */
	getTitle(): string {
		if (this.company.id > 0) {
			return `Company '${this.company.name}'`;
		}
		return 'No company';
	}
	loadCompany(_company, fromService: boolean = false) {
		if (!_company) {
			this.goBack('');
		}
		this.company = _company;
		this.companyId$ = of(_company.id);
		this.loadingSubject.next(false);
		this.initCompany();
		if (fromService) {
			this.cdr.detectChanges();
		}
	}
	/**
	 * Init company
	 */
	initCompany() {
		this.loadingSubject.next(false);
	}



	// If company didn't find in store
	loadCompanyFromService(companyId) {
		this.companyService.getCompanyById(companyId).subscribe(res => {
			this.loadCompany(res, true);
		});
	}

	/**
	 * Returns component title
	 */
	getComponentTitle() {
		let result;
		if(this.company)result= `Company '${this.company.name}'`;
		return result;
	}
	/**
	 * Show Edit company dialog and save after success close result
	 */
	editCompany() {
        const _saveMessage = "Updating Company is successful";
        const company = this.company;
        let config = {
          height: '98%',
          width: '85vw',
          'margin-right':'auto',
          'margin-left':'auto',
          panelClass: 'full-screen-modal',
          data:{company}
        };		
        const dialogRef = this.dialog.open(CompanyEditDialogComponent, config);
		dialogRef.afterClosed().subscribe((_company: any) => {
			if (!_company) {
				return;
			}
            const updateCompany: Update<CompanyModel> = {
                id: _company.id,
                changes: _company
            };
    
            this.store.dispatch(new CompanyUpdated({
                partialCompany: updateCompany,
                company: _company
            }));
            const backProcessFailed = this.store.pipe(
                select(selectCompaniesBackProcessingFailed),
            ).subscribe(res => {
                if (res) {
                    //this.loadingSubject.next(false);
                    const message = `Updatiog Company is failed. `;
                    this.layoutUtilsService.showActionNotification(message, MessageType.Update,10000,true,false);
                    setTimeout(()=>location.reload(),4000);
                }
            });
            this.componentSubscriptions.push(backProcessFailed);
            const  backProcessSuccess = this.store.pipe(
                select(selectCompaniesBackProcessingSuccess),
            ).subscribe(res => {
                if(res){
                    const message = `Company successfully has been saved.`;
                    this.layoutUtilsService.showActionNotification(message, MessageType.Update,10000,true,false);
                    this.loadCompanyFromService(company.id);
                }
            });
            this.componentSubscriptions.push(backProcessSuccess);
		});
	}
    
	/**
	 * Go back to the list
	 *
	 * @param id: any
	 */
	goBack(id) {
		this.loadingSubject.next(false);
		const url = `../companies`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}
	goBackWithoutId	() {
		this.router.navigateByUrl('/employee-management/companies', { relativeTo: this.activatedRoute });
	}
	/** ACTIONS */

}