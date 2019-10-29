// Angular
import { Component, OnInit, ElementRef, ViewChild, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef,Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
// Material
import { SelectionModel } from '@angular/cdk/collections';
import { MatPaginator, MatSort, MatSnackBar,MatDialog } from '@angular/material';
// RXJS
import { debounceTime, distinctUntilChanged, tap, skip, take, delay } from 'rxjs/operators';
import { fromEvent, merge, Observable, of, Subscription } from 'rxjs';
import {  Update } from '@ngrx/entity';
// LODASH
import { each, find } from 'lodash';
// NGRX
import { Store, select } from '@ngrx/store';
import { AppState } from '../../../../../core/reducers';

// Services
import { LayoutUtilsService, MessageType, QueryParamsModel } from '../../../../../core/_base/crud';
// Models
import {
    ProposalModel,ContractModel,EmployeeModel,
    ProposalsDataSource, ProposalsPageRequested,
	ProposalService,EmployeesService,selectProposalsInStore,
} from '../../../../../core/humanresource';
// Components
import { ProposalStatusDialogComponent } from '../update-status/proposal-status.dialog.component';
import { ProfileDialogComponent } from '../view-profile/profile.dialog.component';
import { ContractEditDialogComponent } from '../../contracts/edit/contract-edit.dialog.component';

// Table with EDIT item in MODAL
// ARTICLE for table with sort/filter/paginator
// https://blog.angular-university.io/angular-material-data-table/
// https://v5.material.angular.io/components/table/overview
// https://v5.material.angular.io/components/sort/overview
// https://v5.material.angular.io/components/table/overview#sorting
// https://www.youtube.com/watch?v=NSt9CI3BXv4
@Component({
	selector: 'kt-proposal-list',
	templateUrl: './proposal-list.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProposalListComponent implements OnInit, OnDestroy {
	// Table fields
	// Incoming data
	@Input() jobId$: Observable<number>;
	jobId: number;
	dataSource: ProposalsDataSource;
	displayedColumns = ['first_name', 'last_name', 'id_number','age','applied_date','company','status', 'actions'];
	@ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
	@ViewChild('sort1', {static: true}) sort: MatSort;
	@ViewChild('searchInput', {static: true}) searchInput: ElementRef;
	@ViewChild('status', {static: true}) status: ElementRef;
	// Selection
	selection = new SelectionModel<ProposalModel>(true, []);
	proposalsResult: ProposalModel[] = [];
	members:EmployeeModel[]=[];
	proposalTotal:number;

	// Subscriptions
	private subscriptions: Subscription[] = [];

	/**
	 *
	 * @param activatedRoute: ActivatedRoute
	 * @param store: Store<AppState>
	 * @param router: Router
	 * @param layoutUtilsService: LayoutUtilsService
	 * @param subheaderService: SubheaderService
	 */
	constructor(
		private activatedRoute: ActivatedRoute,
		private router: Router,
		public snackBar: MatSnackBar,
		public dialog: MatDialog,
		private layoutUtilsService: LayoutUtilsService,
		private store: Store<AppState>,
		private employeesService:EmployeesService,
	) {}

	/**
	 * @ Lifecycle sequences => https://angular.io/guide/lifecycle-hooks
	 */

	/**
	 * On init
	 */
	ngOnInit() {
		// If the user changes the sort order, reset back to the first page.
		const sortSubscription = this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));
		this.subscriptions.push(sortSubscription);

		/* Data load will be triggered in two cases:
		- when a pagination event occurs => this.paginator.page
		- when a sort event occurs => this.sort.sortChange
		**/
		const paginatorSubscriptions = merge(this.sort.sortChange, this.paginator.page).pipe(
			tap(() => {
				this.loadProposalsList();
			})
		)
		.subscribe();
		this.subscriptions.push(paginatorSubscriptions);



		// Init DataSource
		this.dataSource = new ProposalsDataSource(this.store);
		const entitiesSubscription = this.dataSource.entitySubject.pipe(
			skip(1),
			distinctUntilChanged()
		).subscribe(res => {
			this.proposalsResult = res;
		});
		this.subscriptions.push(entitiesSubscription);
		this.store.pipe(
			select(selectProposalsInStore),
		).subscribe((response: any) => {
			this.proposalTotal = response.total;
		});

		// Filtration, bind to searchInput
		const searchSubscription = fromEvent(this.searchInput.nativeElement, 'keyup').pipe(
			// tslint:disable-next-line:max-line-length
			debounceTime(50), // The user can type quite quickly in the input box, and that could trigger a lot of server requests. With this operator, we are limiting the amount of server requests emitted to a maximum of one every 150ms
			distinctUntilChanged(), // This operator will eliminate duplicate values
			tap(() => {
				this.paginator.pageIndex = 0;
				this.loadProposalsList();
			})
		)
		.subscribe();
		this.subscriptions.push(searchSubscription);

        // status changed
		const statusSubscription = fromEvent(this.status.nativeElement, 'change').pipe(
			// tslint:disable-next-line:max-line-length
			debounceTime(50), // The user can type quite quickly in the input box, and that could trigger a lot of server requests. With this operator, we are limiting the amount of server requests emitted to a maximum of one every 150ms
			tap(() => {
				this.paginator.pageIndex = 0;
				this.loadProposalsList();
			})
		)
		.subscribe();
		this.subscriptions.push(statusSubscription);
		if(this.jobId$){
			this.jobId$.subscribe(res => {
				if (!res) {
					return;
				}
	
				this.jobId = res;
				of(undefined).pipe(delay(1000)).subscribe(() => { // Remove this line, just loading imitation
					this.loadProposalsList();
				}); // Remove this line, just loading imitation
			});
		}else{
			of(undefined).pipe(delay(1000)).subscribe(() => { // Remove this line, just loading imitation
				this.loadProposalsList();
			}); // Remove this line, just loading imitation
		}
		this.employeesService.findUnhiredEmployees().pipe().subscribe(res=>this.members = res);		
	
	}

	/**
	 * On Destroy
	 */
	ngOnDestroy() {
		this.subscriptions.forEach(el => el.unsubscribe());
	}

	/**
	 * Load users list
	 */
	loadProposalsList() {
		this.selection.clear();
		const queryParams = new QueryParamsModel(
			this.filterConfiguration(),
			this.sort.direction,
			this.sort.active,
			this.paginator.pageIndex,
			this.paginator.pageSize
		);
		this.store.dispatch(new ProposalsPageRequested({ page: queryParams }));
		this.selection.clear();
	}

	/** FILTRATION */
	filterConfiguration(): any {
		const filter: any = {};
		const searchText: string = this.searchInput.nativeElement.value;


		if (searchText) {
            filter.name = searchText;
		}
		filter.status = this.status.nativeElement.value;
		if(this.jobId)filter.job_id = this.jobId;
		return filter;
	}
	/**
	 * Change Status
	 *
	 * @param id
	 */
	changeStatus(proposal:ProposalModel) {
		let _saveMessage;
		const _messageType = proposal.id > 0 ? MessageType.Update : MessageType.Create;
		if(proposal.id > 0){
			_saveMessage='The profile status has been updated successfully';
		}else{
			_saveMessage='New company user has been created successfully';
		}
		let config = {
			panelClass: 'full-screen-modal',
			data:{proposal}
		  };		
		const dialogRef = this.dialog.open(ProposalStatusDialogComponent, config);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}

			this.layoutUtilsService.showActionNotification(_saveMessage, _messageType,500,true,false);
			this.loadProposalsList();
		});
	}
	viewProfile(proposal:ProposalModel){
		this.router.navigate(['employee-management/employees/edit/', proposal.employee_id]);	
	}
	viewProfileDialog(proposal:ProposalModel) {
		let config = {
			height: '98%',
			width: '85vw',
			'margin-right':'auto',
			'margin-left':'auto',
			panelClass: 'full-screen-modal',
			data:{proposal}
		  };		
		const dialogRef = this.dialog.open(ProfileDialogComponent, config);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}
			of(undefined).pipe(delay(1000)).subscribe(() => { // Remove this line, just loading imitation
				let _saveMessage;
				const _messageType = MessageType.Update;
				if(res=="approved"){
					_saveMessage = 'You approved the profile successfully';
				}else{
					_saveMessage = 'You rejected the profile successfully';
				}
				this.layoutUtilsService.showActionNotification(_saveMessage, _messageType,2000,true,false);
				this.loadProposalsList();
			}); 			
		});

	}
	/** UI */
	/**
	 * Retursn CSS Class Name by status
	 *
	 * @param status: string
	 */
	getItemCssClassByStatus(status: string): string {
		switch (status) {
			case 'pending':
			case 'archived':
			case 'inreview':
				return 'primary';
			case 'approved':
				return 'success';
			case 'declined':
				return 'danger';
			case 'hired':
				return 'mental';
		}
		return '';
	}

	/**
	 * Returns Item Status in string
	 * @param status: number
	 */
	getItemStatusString(status: string): string {
		switch (status) {
			case 'inreview':
				return 'In Review';
			default:
				return 	status[0].toUpperCase() +  status.slice(1)	
			}
	}
	/**
	 * Create Contract
	 */
	createContract(proposal:ProposalModel) {
		let _saveMessage='New contract has been created successfully';
		const _messageType =  MessageType.Create;
		let contract:ContractModel = new ContractModel;
		contract.employee_id = proposal.employee_id;
		contract.employee = proposal.employee;
		contract.company_id = proposal.company_id;
		contract.position = proposal.job.position;
		let config = {
			panelClass: 'full-screen-modal',
			data:{contract,company_id:proposal.company_id,proposal_id:proposal.id,proposal_status:proposal.status}
		  };		

		const dialogRef = this.dialog.open(ContractEditDialogComponent, config);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}
			this.layoutUtilsService.showActionNotification(_saveMessage, _messageType,500,true,false);
			this.loadProposalsList();
		});
		
	}	
	contain(member:any){
		return member.id == this;
	}
	unhired(proposal:ProposalModel){
		return this.members.some(this.contain,proposal.employee_id);
	}
}
