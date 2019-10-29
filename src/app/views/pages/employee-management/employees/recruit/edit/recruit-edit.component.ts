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
import { AppState } from '../../../../../../core/reducers';
// CRUD
import { LayoutUtilsService,MessageType,TypesUtilsService } from '../../../../../../core/_base/crud';
// Services and Models
import { 
	selectRecruitById,
	EmployeeModel, 
	RecruitUpdated,
	EmployeesService 
} from '../../../../../../core/humanresource';
import { environment } from '../../../../../../../environments/environment';
import { RecruitApproveDialogComponent } from '../approve/recruit-approve.dialog.component';
import { ImagePopupComponent } from '../image-modal/image-popup.component';

@Component({
	// tslint:disable-next-line:component-selector
	selector: 'kt-recruits-edit',
	templateUrl: './recruit-edit.component.html',
	styleUrls:['./recruit-edit.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
	encapsulation: ViewEncapsulation.None
})
export class RecruitEditComponent implements OnInit, OnDestroy {
	// Public properties
	recruit: EmployeeModel;
	recruitId$: Observable<number>;
	loadingSubject = new BehaviorSubject<boolean>(true);
	loading$: Observable<boolean>;
	recruitStatus:String;
	viewStatus:any;
	// Private properties
	private componentSubscriptions: Subscription;
	private hostingUrl:string;
	/**
	 * Component constructor
	 *
	 * @param dialogRef: MatDialogRef<RecruitEditComponent>
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
		private recruitService: EmployeesService,
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
		//this.store.pipe(select(selectRecruitsActionLoading)).subscribe(res => this.viewLoading = res);
		this.loading$ = this.loadingSubject.asObservable();
		this.loadingSubject.next(true);
		this.viewStatus = false;
		this.hostingUrl = environment.host_url;
		this.activatedRoute.params.subscribe(params => {
			const id = params['id'];
			if (id && id > 0) {

				this.store.pipe(
					select(selectRecruitById(id))
				).subscribe(result => {
					if (!result) {
						this.loadRecruitFromService(id);
						return;
					}

					this.loadRecruit(result);
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
		if (this.recruit.id > 0) {
			return `Edit recruit '${this.recruit.first_name} ${
				this.recruit.last_name
			}'`;
		}

		return 'New recruit';
	}

	loadRecruit(_recruit, fromService: boolean = false) {
		if (!_recruit) {
			this.goBack('');
		}
		this.recruit = _recruit;
		this.recruitStatus = _recruit.status;
		if(this.recruitStatus == 'Rejected')this.viewStatus = true;
		this.recruitId$ = of(_recruit.id);
		this.loadingSubject.next(false);
		if (fromService) {
			this.cdr.detectChanges();
		}
	}

	// If recruit didn't find in store
	loadRecruitFromService(recruitId) {
		this.recruitService.getEmployeeById(recruitId).subscribe(res => {
			this.loadRecruit(res, true);
		});
	}
	/**
	 * Returns component title
	 */
	getComponentTitle(recruit) {
		let result;
		if(recruit)result= recruit.first_name + ' ' + recruit.last_name + '  |  ' + recruit.created_date;
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
		const url = `../recruits`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}
	goBackWithoutId	() {
		this.router.navigateByUrl('/employee-management/recruits', { relativeTo: this.activatedRoute });
	}
	/** ACTIONS */


	/**
	 * approve
	 */
	approve(recruit:EmployeeModel) {
		const dialogRef = this.dialog.open(RecruitApproveDialogComponent, { data: { recruit } });
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}
			if(res.recruit){
		
				this.recruitService.convertEmployee(res.recruit).pipe(
				).subscribe(res=>{
					
					if(res.status == 'failed'){
						var response = res;
						alert('Your aprroving failed. Please try again');
					}else if(res.status =='ok'){
						this.viewStatus = true;
						this.recruitStatus = "Approved";
						this.cdr.detectChanges();
						const _saveMessage = `You convert this recruit into employee successfully.`;
						this.layoutUtilsService.showActionNotification(_saveMessage, MessageType.Create, 10000, true, false);
					}
				});		
			}
			//this.loadCustomersList();
		});
	}
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
	/**
	 * approve
	 */
	reject(recruit:EmployeeModel) {
		const dialogRef = this.dialog.open(RecruitRejectDialogComponent, { data: { recruit } });
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}
			if(res.status == 'ok'){
				this.recruitService.rejectEmployee(recruit).pipe(
				).subscribe(res=>{
					
					if(res.status == 'failed'){
						var response = res;
						alert('Your rejecting failed. Please try again');
					}else if(res.status =='ok'){
						this.recruitStatus = "Rejected";
						this.viewStatus = true;
						this.cdr.detectChanges();
						const _saveMessage = `Your rejecting for the recruit is successfully.`;
						this.layoutUtilsService.showActionNotification(_saveMessage, MessageType.Update, 10000, true, false,0,'top');
					}
				});		
		
			}
			//this.loadCustomersList();
		});
	}

	/**
	 * Update recruit
	 *
	 * @param _recruit: EmployeeModel
	 */
	updateRecruit(_recruit: EmployeeModel) {
		const updateRecruit: Update<EmployeeModel> = {
			id: _recruit.id,
			changes: _recruit
		};
		this.store.dispatch(new RecruitUpdated({
			partialRecruit: updateRecruit,
			recruit: _recruit
		}));

		// Remove this line
		//of(undefined).pipe(delay(1000)).subscribe(() => this.dialogRef.close({ _recruit, isEdit: true }));
		// Uncomment this line
		// this.dialogRef.close({ _recruit, isEdit: true }
	}

	checkImage(url:string){
		return (url && url.match(/\.(jpeg|jpg|gif|png)$/) != null);
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
@Component({
	selector: 'kt-recurit-reject-dialog',
	template: `
	<div class="col-xl-12">
		<div class="col-xl-12">
			<br/>
			<header>
				<h1 class='d-flex justify-content-center'>Application Reject</h1>
			</header>
			<div mat-dialog-content>
				<h2 class='d-flex justify-content-center' mat-dialog-title>Are you sure want to reject {{recruit.first_name + ' ' + recruit.last_name}}?</h2>
			</div>
			<div mat-dialog-actions class='d-flex justify-content-center'>
				<button type="button" mat-raised-button [mat-dialog-close]="data.animal" cdkFocusInitial matTooltip="Cancel">Cancel</button>
				<button type="button" mat-raised-button (click)="onSubmit()" matTooltip="Reject Recruit" class="btn-danger">Reject</button>
			</div>
			<br/>
		</div>
	</div>`,
})
export class RecruitRejectDialogComponent {
	recruit: EmployeeModel;
	constructor(
		public dialogRef: MatDialogRef<RecruitRejectDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any) {
	}
	ngOnInit() {
        this.recruit = this.data.recruit;
	}
	/**
	 * On Submit
	 */
	onSubmit() {
		this.dialogRef.close({status:'ok'});
	}
}
