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
	JobModel, 
	AttributeModel,
	selectJobsActionLoading,
	JobOnServerCreated,
	selectLastCreatedJobId,
	JobOnServerUpdated,
	selectJobsBackProcessingSuccess,
	selectJobsBackProcessingFailed,
	JobBackProcessFailed,
} from '../../../../../core/humanresource';
@Component({
	// tslint:disable-next-line:component-selector
	selector: 'kt-job-edit',
	templateUrl: './job-edit.dialog.component.html',
	styleUrls:['./job-edit.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
	encapsulation: ViewEncapsulation.None
})
export class JobEditDialogComponent implements OnInit, OnDestroy {
	// Public properties
	job: JobModel;
	jobForm: FormGroup;
	hasFormErrors: boolean = false;
	viewLoading: boolean = false;
    attributes:AttributeModel[];
	addAttribute:AttributeModel;
	tags:AttributeModel[];

	// Private properties
	private componentSubscriptions: Subscription[]=[];
	private company_id:number;

	/**
	 * Component constructor
	 *
	 * @param dialogRef: MatDialogRef<JobEditDialogComponent>
	 * @param fb: FormBuilder
	 * @param store: Store<AppState>
	 * @param typesUtilsService: TypesUtilsService
	 */
	constructor(
		@Inject(MAT_DIALOG_DATA) public data: any,
		public dialogRef:MatDialogRef<JobEditDialogComponent>,
		private store: Store<AppState>,
		private jobFB: FormBuilder,
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
		this.store.pipe(select(selectJobsActionLoading)).subscribe(res => this.viewLoading = res);
		this.job = this.data.job;
		this.company_id = this.data.company_id;
		const updateSuccessSubscription = this.store.pipe(
			select(selectJobsBackProcessingSuccess),
			delay(1000), // Remove this line
		).subscribe(res => {
			if (!res) {
				return;
			}
			if(res)this.dialogRef.close({ isEdit: true });
		});
		this.componentSubscriptions.push(updateSuccessSubscription);
		const updateFailedSubscription = this.store.pipe(
			select(selectJobsBackProcessingFailed),
			delay(1000), // Remove this line
		).subscribe(res => {
			if (!res) {
				return;
			}
			if(res){
				this.hasFormErrors=true;
				if(res.email!=undefined)this.jobForm.controls['email'].setErrors({'incorrect': true,'unique':true});
			}
			this.viewLoading = false;
			this.cdr.detectChanges();
		});
		this.componentSubscriptions.push(updateFailedSubscription);
		this.attributes = [];
        this.store.subscribe((state:any)=>{
			let attributes:AttributeModel[] = Object.values(state.attributes.entities);
			this.attributes = attributes.filter(attribute=>attribute.status);
			if(this.job!=null)this.updateAttributes(this.job.skills);
        });		
		this.createForm();
	}
	updateAttributes(skills){
        this.tags = [];
		skills.forEach(skill=>{
			let key:number;
			this.tags.push(skill);
			this.attributes.forEach((attribute,index)=>{
				if(attribute.id == skill.id){
					key = index;
				}
			});
			this.attributes.splice(key,1);		
		});
	}
	/**
	 * On destroy
	 */
	ngOnDestroy() {
		this.store.dispatch(new JobBackProcessFailed({ isFailed: false,errors:null }));
		this.componentSubscriptions.forEach(el => el.unsubscribe());
	}

	/**
	 * Returns page title
	 */
	getTitle(): string {
		if (this.job.id > 0) {
			return `Edit job '${this.job.title}'`;
		}

		return 'New job';
	}
	
	/**
	 * Create form
	 */
	createForm() {
		this.jobForm = this.jobFB.group({
			title: [this.job.title, Validators.required],
			position: [this.job.position, [Validators.required]],
			description:[this.job.description, [Validators.required]],
		});
	}

	/**
	 * Save data
	 *
	 */
	onSubmit() {
		this.hasFormErrors = false;
		const controls = this.jobForm.controls;
		/** check form */
		if (this.jobForm.invalid) {
			Object.keys(controls).forEach(controlName =>
				controls[controlName].markAsTouched()
			);

			this.hasFormErrors = true;
			return;
		}
		// tslint:disable-next-line:prefer-const
		let editedJob = this.prepareJob();
		if (editedJob.id >0) {
			this.updateJob(editedJob);
		} else {
			this.createJob(editedJob);
		}

		this.dialogRef.close(editedJob);
	}

	/**
	 * Returns object for saving
	 */
	prepareJob(): JobModel {
		const controls = this.jobForm.controls;
		const _job = new JobModel();
		_job.id = this.job.id;
		_job.title = controls['title'].value;
		_job.position = controls['position'].value;
		_job.description = controls['description'].value;
		let attributes:number[] = [];
		this.tags.forEach((tag)=>{
			attributes.push(tag.id)
		});
		_job.skills = attributes;
		return _job;
	}

	/**
	 * Update job
	 *
	 * @param _job: JobModel
	 */
	updateJob(_job: JobModel) {
		const updateJob: Update<JobModel> = {
			id: _job.id,
			changes: _job
		};
		this.store.dispatch(new JobOnServerUpdated({
			partialJob: updateJob,
			job: _job
		}));

		// Uncomment this line
		// this.dialogRef.close({ _job, isEdit: true }
	}
	/**
	 * Checking control validation
	 *
	 * @param controlName: string => Equals to formControlName
	 * @param validationType: string => Equals to valitors name
	 */
	isControlHasError(controlName: string, validationType: string): boolean {
		const control = this.jobForm.controls[controlName];
		if (!control) {
			return false;
		}
		const result = control.hasError(validationType) && (control.dirty || control.touched);
		return result;
	}
	onSelectionChanged($event){
		console.log($event);
	}
	/**
	 * Create job
	 *
	 * @param _job: JobModel
	 */
	createJob(_job: JobModel) {
		this.store.dispatch(new JobOnServerCreated({ job: _job }));
		const createSubscription = this.store.pipe(
			select(selectLastCreatedJobId),
			delay(1000), // Remove this line
		).subscribe(res => {
			if (!res) {
				return;
			}
			/*if(res.status == 0){
				var response = res;
				if(response.errors.email!=undefined)this.jobForm.controls['email'].setErrors({'incorrect': true,'unique':true});
			}else if(res.status ==1){
				this.dialogRef.close({ _job, isEdit: false });
			}*/
		});
		this.componentSubscriptions.push(createSubscription);
	}

	/** Alect Close event */
	onAlertClose($event) {
	}
    contain(attribute:any){
        return attribute.id != this;
    }
    onAddAttribute(){
        if(this.tags.length == 0 || this.tags.every(this.contain,this.addAttribute.id)){
            this.tags.push(this.addAttribute);
            var index = this.attributes.indexOf(this.addAttribute);
            this.attributes.splice(index,1);
        }
	}
	remove(attribute:any){
		var index = this.tags.indexOf(attribute);
		var tag:any = this.tags.splice(index,1);
		this.attributes.push(tag[0]);
	}
}