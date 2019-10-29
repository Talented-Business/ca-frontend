// Angular
import { Component, OnInit, Inject, ChangeDetectionStrategy, ViewEncapsulation, OnDestroy,ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
// Material
import { MatDialog,MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
// RxJS
import { Observable,BehaviorSubject,Subscription, of } from 'rxjs';
import { delay } from 'rxjs/operators';
// Translate Module
import { TranslateService } from '@ngx-translate/core';
// NGRX
import { Update } from '@ngrx/entity';
import { Store, select } from '@ngrx/store';
// State
import { AppState } from '../../../../../core/reducers';
// CRUD
import { LayoutUtilsService,MessageType,TypesUtilsService } from '../../../../../core/_base/crud';
// Services and Models
import { 
	selectEmployeeById,
	EmployeeModel, 
	EmployeeUpdated,
	EmployeesService 
} from '../../../../../core/humanresource';
import { environment } from '../../../../../../environments/environment';
import { ImagePopupComponent } from '../recruit/image-modal/image-popup.component';

@Component({
	// tslint:disable-next-line:component-selector
	selector: 'kt-company-employee-view',
	templateUrl: './employee-view.component.html',
	styleUrls:['./employee-view.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
	encapsulation: ViewEncapsulation.None
})
export class CompanyEmployeeView implements OnInit, OnDestroy {
	// Public properties
	employee: EmployeeModel;
	employeeId$: Observable<number>;
	loadingSubject = new BehaviorSubject<boolean>(true);
	loading$: Observable<boolean>;
	// Private properties
	private componentSubscriptions: Subscription;
	private viewStatus:any;
	private employeeStatus:String;
	private hostingUrl:string;
	/**
	 * Component constructor
	 *
	 * @param dialogRef: MatDialogRef<CompanyEmployeeView>
	 * @param fb: FormBuilder
	 * @param store: Store<AppState>
	 * @param typesUtilsService: TypesUtilsService
	 */
	constructor(
		private fb: FormBuilder,
		private store: Store<AppState>,
		private activatedRoute: ActivatedRoute,
		private router: Router,
		public dialog: MatDialog,
		private employeeService: EmployeesService,
		private layoutUtilsService: LayoutUtilsService,
		private translate: TranslateService,
		private typesUtilsService: TypesUtilsService,
		private cdr: ChangeDetectorRef) {
	}

	/**
	 * @ Lifecycle sequences => https://angular.io/guide/lifecycle-hooks
	 */

	/**
	 * On init
	 */
	ngOnInit() {
		//this.store.pipe(select(selectEmployeesActionLoading)).subscribe(res => this.viewLoading = res);
		this.loading$ = this.loadingSubject.asObservable();
		this.loadingSubject.next(true);
		this.viewStatus = false;
		this.hostingUrl = environment.host_url;
		this.activatedRoute.params.subscribe(params => {
			const id = params['id'];
			if (id && id > 0) {

				this.store.pipe(
					select(selectEmployeeById(id))
				).subscribe(result => {
					if (!result) {
						this.loadEmployeeFromService(id);
						return;
					}

					this.loadEmployee(result);
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
		if (this.componentSubscriptions) {
			this.componentSubscriptions.unsubscribe();
		}
	}

	/**
	 * Returns page title
	 */
	getTitle(): string {
		if (this.employee.id > 0) {
			return `'${this.employee.first_name} ${this.employee.last_name}'`;
		}

		return 'view employee';
	}

	loadEmployee(_employee, fromService: boolean = false) {
		if (!_employee) {
			this.goBack('');
		}
		this.employee = _employee;
		this.employeeId$ = of(_employee.id);
		this.loadingSubject.next(false);
		if (fromService) {
			this.cdr.detectChanges();
		}
	}

	// If employee didn't find in store
	loadEmployeeFromService(employeeId) {
		this.employeeService.getEmployeeById(employeeId).subscribe(res => {
			this.loadEmployee(res, true);
		});
	}
	/**
	 * Returns component title
	 */
	getComponentTitle(employee) {
		let result;
		if(employee)result= employee.first_name + ' ' + employee.last_name + '    ' + employee.created_at;
		return result;
	}
	showBolean(status:boolean){
		if(status){
			return "YES";
		}else{
			return "NO";
		}
	}
	showAvailableWorks(status:string){
		let label;
		switch(status){
			case 'Less_20':
				label = 'Less than 20 hours per week';
				break;
			case '40':
				label = '40 hours per week';
				break;
			case 'over_40':
				label = 'more than 40 hours per week';
				break;
		}
		return label;
	}	
	/**
	 * Go back to the list
	 *
	 * @param id: any
	 */
	goBack(id) {
		this.loadingSubject.next(false);
		const url = `../companyEmployees`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}
	goBackWithoutId	() {
		this.router.navigateByUrl('/employee-management/companyEmployees', { relativeTo: this.activatedRoute });
	}
	/** ACTIONS */

	openImage(path:string){
		let url:string = this.hostingUrl + 'storage/' + path;
		let config = {
			height: 'auto',
			width: 'auto',
			hasBackdrop:true,
			backdropClass:'modal-black-background',
			'margin-right':'auto',
			'margin-left':'auto',
			panelClass: 'full-screen-modal',
			data:{image:url}
		  };		
		const dialogRef = this.dialog.open(ImagePopupComponent, config);
    }

	checkImage(url:string){
		return(url && url.match(/\.(jpeg|jpg|gif|png)$/) != null);
	}
	checkPdf(url:string){
		return (url && url.match(/\.(pdf)$/) != null);
	}
	checkZip(url:string){
		return (url && url.match(/\.(zip)$/) != null);
	}    
	/** Alect Close event */
	onAlertClose($event) {
	}
}