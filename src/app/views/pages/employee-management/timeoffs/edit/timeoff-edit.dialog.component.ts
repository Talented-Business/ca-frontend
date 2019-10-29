// Angular
import { Component, OnInit, Inject, ChangeDetectionStrategy, ViewEncapsulation, OnDestroy,ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators,FormControl } from '@angular/forms';
// Material
import { MatDialog,MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
// RxJS
import { Observable,BehaviorSubject,Subscription, of } from 'rxjs';
import { delay,startWith,map } from 'rxjs/operators';
// NGRX
import { Update } from '@ngrx/entity';
import { Store, select } from '@ngrx/store';
// State
import { AppState } from '../../../../../core/reducers';

// Services and Models
import { 
	TimeoffModel, 
	CompanyModel,
	selectTimeoffsActionLoading,
	TimeoffOnServerCreated,
	selectLastCreatedTimeoffId,
	TimeoffOnServerUpdated,
	selectTimeoffsBackProcessingSuccess,
	selectTimeoffsBackProcessingFailed,
	TimeoffBackProcessFailed,
	CompanyService,
} from '../../../../../core/humanresource';
@Component({
	// tslint:disable-next-line:component-selector
	selector: 'kt-timeoff-edit',
	templateUrl: './timeoff-edit.dialog.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
	encapsulation: ViewEncapsulation.None
})
export class TimeoffEditDialogComponent implements OnInit, OnDestroy {
	// Public properties
	timeoff: TimeoffModel;
	timeoffForm: FormGroup;
	hasFormErrors: boolean = false;
	viewLoading: boolean = false;
	companies:CompanyModel[];
	statuses:any;

	// Private properties
	private componentSubscriptions: Subscription[]=[];
	private company_id:number;

	/**
	 * Component constructor
	 *
	 * @param dialogRef: MatDialogRef<TimeoffEditDialogComponent>
	 * @param fb: FormBuilder
	 * @param store: Store<AppState>
	 * @param typesUtilsService: TypesUtilsService
	 */
	constructor(
		@Inject(MAT_DIALOG_DATA) public data: any,
		public dialogRef:MatDialogRef<TimeoffEditDialogComponent>,
		private store: Store<AppState>,
		private timeoffFB: FormBuilder,
		private companyService:CompanyService,
		private cdr: ChangeDetectorRef
		) {
	}

	/**
	 * @ Lifecycle sequences => https://angular.io/guide/lifecycle-hooks
	 */

	/**
	 * On init
	 */
	ngOnInit() {
		this.store.pipe(select(selectTimeoffsActionLoading)).subscribe(res => this.viewLoading = res);
		this.timeoff = this.data.timeoff;
		this.companyService.getAllCompanies().subscribe(
			res=>{
				this.companies = res;
			}
		);
		this.createForm();
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
		if (this.timeoff.id > 0) {
			return `Update Time Off Request`;
		}

		return 'New Time Off Request';
	}
	
	/**
	 * Create form
	 */
	createForm() {
		this.timeoffForm = this.timeoffFB.group({
			reason: [this.timeoff.reason, Validators.required],
			policy: [this.timeoff.policy, Validators.required],
			start_date: [this.timeoff.start_date, Validators.required],
			end_date: [this.timeoff.end_date, Validators.required],
		});
	}

	/**
	 * Save data
	 *
	 */
	onSubmit() {
		this.hasFormErrors = false;
		const controls = this.timeoffForm.controls;
		/** check form */
		if (this.timeoffForm.invalid) {
			Object.keys(controls).forEach(controlName =>
				controls[controlName].markAsTouched()
			);

			this.hasFormErrors = true;
			return;
		}
		if(controls['start_date'].value>controls['end_date'].value){
			controls['end_date'].setErrors({'incorrect': true,'required':true});
			controls['end_date'].markAsTouched()
			this.hasFormErrors = true;
			return;
		}
		// tslint:disable-next-line:prefer-const
		let editedTimeoff = this.prepareTimeoff();
		if(editedTimeoff.id>0)this.updateTimeoff(editedTimeoff);
		else this.createTimeoff(editedTimeoff);

		this.dialogRef.close(editedTimeoff);
	}

	/**
	 * Returns object for saving
	 */
	prepareTimeoff(): TimeoffModel {
		const controls = this.timeoffForm.controls;
		const _timeoff = new TimeoffModel();
		_timeoff.id = this.timeoff.id;
		_timeoff.reason = controls['reason'].value;
		_timeoff.policy = controls['policy'].value;
		if(controls['start_date'].value.toDateString == undefined){
			_timeoff.start_date = controls['start_date'].value;
		}else{
			_timeoff.start_date = controls['start_date'].value.toDateString();
		}
		if(controls['end_date'].value.toDateString == undefined){
			_timeoff.end_date = controls['end_date'].value;
		}else{
			_timeoff.end_date = controls['end_date'].value.toDateString();
		}
		return _timeoff;
	}

	/**
	 * Update timeoff
	 *
	 * @param _timeoff: TimeoffModel
	 */
	updateTimeoff(_timeoff: TimeoffModel) {
		const updateTimeoff: Update<TimeoffModel> = {
			id: _timeoff.id,
			changes: _timeoff
		};
		this.store.dispatch(new TimeoffOnServerUpdated({
			partialTimeoff: updateTimeoff,
			timeoff: _timeoff
		}));

		// Uncomment this line
		// this.dialogRef.close({ _timeoff, isEdit: true }
	}
	/**
	 * Create timeoff
	 *
	 * @param _timeoff: TimeoffModel
	 */
	createTimeoff(_timeoff: TimeoffModel) {
		this.store.dispatch(new TimeoffOnServerCreated({ timeoff: _timeoff }));
		const createSubscription = this.store.pipe(
			select(selectLastCreatedTimeoffId),
			delay(1000), // Remove this line
		).subscribe(res => {
			if (!res) {
				return;
			}
		});
		this.componentSubscriptions.push(createSubscription);
	}

	/** Alect Close event */
	onAlertClose($event) {
	}
}