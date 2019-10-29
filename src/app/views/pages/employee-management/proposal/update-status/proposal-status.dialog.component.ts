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
	ProposalModel, 
	CompanyModel,
	selectProposalsActionLoading,
	ProposalOnServerCreated,
	selectLastCreatedProposalId,
	ProposalOnServerUpdated,
	selectProposalsBackProcessingSuccess,
	selectProposalsBackProcessingFailed,
	ProposalBackProcessFailed,
	CompanyService,
} from '../../../../../core/humanresource';
@Component({
	// tslint:disable-next-line:component-selector
	selector: 'kt-proposal-status',
	templateUrl: './proposal-status.dialog.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
	encapsulation: ViewEncapsulation.None
})
export class ProposalStatusDialogComponent implements OnInit, OnDestroy {
	// Public properties
	proposal: ProposalModel;
	proposalForm: FormGroup;
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
	 * @param dialogRef: MatDialogRef<ProposalStatusDialogComponent>
	 * @param fb: FormBuilder
	 * @param store: Store<AppState>
	 * @param typesUtilsService: TypesUtilsService
	 */
	constructor(
		@Inject(MAT_DIALOG_DATA) public data: any,
		public dialogRef:MatDialogRef<ProposalStatusDialogComponent>,
		private store: Store<AppState>,
		private proposalFB: FormBuilder,
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
		this.store.pipe(select(selectProposalsActionLoading)).subscribe(res => this.viewLoading = res);
		this.proposal = this.data.proposal;
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
		if (this.proposal.id > 0) {
			return `Update status profile of '${this.proposal.employee.first_name} ${this.proposal.employee.last_name}'`;
		}

		return '';
	}
	
	/**
	 * Create form
	 */
	createForm() {
		this.proposalForm = this.proposalFB.group({
			status: [this.proposal.status, Validators.required],
			company_id: [this.proposal.company_id],
		});
	}

	/**
	 * Save data
	 *
	 */
	onSubmit() {
		this.hasFormErrors = false;
		const controls = this.proposalForm.controls;
		if(controls['status'].value == 'declined'){
			this.hasFormErrors = true;
			controls['status'].setErrors({'incorrect': true,'required':true});
			controls['status'].markAsTouched()
			return;
		}
		/** check form */
		if (this.proposalForm.invalid) {
			Object.keys(controls).forEach(controlName =>
				controls[controlName].markAsTouched()
			);

			this.hasFormErrors = true;
			return;
		}
		if(this.proposalForm.controls['status'].value == 'inreview' && this.proposalForm.controls['company_id'].value==undefined){
			controls['company_id'].setErrors({'incorrect': true,'required':true});
			controls['company_id'].markAsTouched()
			this.hasFormErrors = true;
			return;
		}
		// tslint:disable-next-line:prefer-const
		let editedProposal = this.prepareProposal();
		this.updateProposal(editedProposal);

		this.dialogRef.close(editedProposal);
	}

	/**
	 * Returns object for saving
	 */
	prepareProposal(): ProposalModel {
		const controls = this.proposalForm.controls;
		const _proposal = new ProposalModel();
		_proposal.id = this.proposal.id;
		_proposal.status = controls['status'].value;
		_proposal.company_id = controls['company_id'].value;
		return _proposal;
	}

	/**
	 * Update proposal
	 *
	 * @param _proposal: ProposalModel
	 */
	updateProposal(_proposal: ProposalModel) {
		const updateProposal: Update<ProposalModel> = {
			id: _proposal.id,
			changes: _proposal
		};
		this.store.dispatch(new ProposalOnServerUpdated({
			partialProposal: updateProposal,
			proposal: _proposal
		}));

		// Uncomment this line
		// this.dialogRef.close({ _proposal, isEdit: true }
	}

	/** Alect Close event */
	onAlertClose($event) {
	}
}