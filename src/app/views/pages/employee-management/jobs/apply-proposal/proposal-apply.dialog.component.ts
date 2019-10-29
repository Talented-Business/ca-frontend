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
} from '../../../../../core/humanresource';
@Component({
	// tslint:disable-next-line:component-selector
	selector: 'kt-propsal-apply',
	templateUrl: './proposal-apply.dialog.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
	encapsulation: ViewEncapsulation.None
})
export class ProposalApplyDialogComponent implements OnInit, OnDestroy {
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
	 * @param dialogRef: MatDialogRef<ProposalApplyDialogComponent>
	 * @param fb: FormBuilder
	 * @param store: Store<AppState>
	 * @param typesUtilsService: TypesUtilsService
	 */
	constructor(
		@Inject(MAT_DIALOG_DATA) public data: any,
		public dialogRef:MatDialogRef<ProposalApplyDialogComponent>,
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
		this.attributes = [];
        this.store.subscribe((state:any)=>{
			let attributes:AttributeModel[] = Object.values(state.attributes.entities);
			this.attributes = attributes.filter(attribute=>attribute.status);
        });		
	}
	/**
	 * On destroy
	 */
	ngOnDestroy() {
		this.componentSubscriptions.forEach(el => el.unsubscribe());
	}

	
	/**
	 * Save data
	 *
	 */
	onApply() {
		this.dialogRef.close(this.job);
	}

	/** Alect Close event */
}