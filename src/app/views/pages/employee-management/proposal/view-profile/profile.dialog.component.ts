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
import { environment } from '../../../../../../environments/environment';
// Services and Models
import { 
	ProposalModel, 
	CompanyModel,
	selectProposalsActionLoading,
	ProposalOnServerUpdated,
	ProposalService,
} from '../../../../../core/humanresource';
@Component({
	// tslint:disable-next-line:component-selector
	selector: 'kt-employee-profile',
	templateUrl: './profile.dialog.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
	encapsulation: ViewEncapsulation.None
})
export class ProfileDialogComponent implements OnInit, OnDestroy {
	// Public properties
	proposal: ProposalModel;
	viewLoading: boolean = false;
	statuses:any;
	home_url:string;
	// Private properties
	private componentSubscriptions: Subscription[]=[];
	private company_id:number;

	/**
	 * Component constructor
	 *
	 * @param dialogRef: MatDialogRef<ProfileDialogComponent>
	 * @param fb: FormBuilder
	 * @param store: Store<AppState>
	 * @param typesUtilsService: TypesUtilsService
	 */
	constructor(
		@Inject(MAT_DIALOG_DATA) public data: any,
		public dialogRef:MatDialogRef<ProfileDialogComponent>,
		private store: Store<AppState>,
		private proposalService:ProposalService,
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
		this.home_url = environment.host_url;
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
		return this.proposal.employee.first_name + ' ' + this.proposal.employee.last_name;
	}
	

	/**
	 *  approve
	 *
	 */
	updateStatus(status:string) {
		let proposal:ProposalModel = new ProposalModel;
		proposal.id = this.proposal.id;
		proposal.status = status;
		this.proposalService.updateProposal(proposal).pipe().subscribe();
		this.dialogRef.close(status);
	}

	/** Alect Close event */
	onAlertClose($event) {
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
	
}