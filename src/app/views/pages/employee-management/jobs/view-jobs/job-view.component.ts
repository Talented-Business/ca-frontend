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
    JobModel,ProposalModel,
    JobsDataSource, JobsPageRequested,
	ProposalService,selectJobsInStore,
} from '../../../../../core/humanresource';
// Components
import { ProposalApplyDialogComponent } from '../apply-proposal/proposal-apply.dialog.component';


// Table with EDIT item in MODAL
// ARTICLE for table with sort/filter/paginator
// https://blog.angular-university.io/angular-material-data-table/
// https://v5.material.angular.io/components/table/overview
// https://v5.material.angular.io/components/sort/overview
// https://v5.material.angular.io/components/table/overview#sorting
// https://www.youtube.com/watch?v=NSt9CI3BXv4
@Component({
	selector: 'kt-job-View',
	templateUrl: './job-view.component.html',
	styleUrls:['./job-view.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class JobViewComponent implements OnInit, OnDestroy {
	// Table fields
	// Incoming data
	dataSource: JobsDataSource;
	@ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
	// Selection
	selection = new SelectionModel<JobModel>(true, []);
	jobsResult: JobModel[] = [];
	jobTotal:number;

	// Subscriptions
	private subscriptions: Subscription[] = [];

	/**
	 *
	 * @param store: Store<AppState>
	 * @param layoutUtilsService: LayoutUtilsService
	 * @param subheaderService: SubheaderService
	 */
	constructor(
		public snackBar: MatSnackBar,
		public dialog: MatDialog,
		private layoutUtilsService: LayoutUtilsService,
		private store: Store<AppState>,
		private proposalService:ProposalService
	) {}

	/**
	 * @ Lifecycle sequences => https://angular.io/guide/lifecycle-hooks
	 */

	/**
	 * On init
	 */
	ngOnInit() {

		/* Data load will be triggered in two cases:
		- when a pagination event occurs => this.paginator.page
		- when a sort event occurs => this.sort.sortChange
		**/
		const paginatorSubscriptions = merge(this.paginator.page).pipe(
			tap(() => {
				this.loadJobsList();
			})
		)
		.subscribe();
		this.subscriptions.push(paginatorSubscriptions);



		// Init DataSource
		this.dataSource = new JobsDataSource(this.store);
		const entitiesSubscription = this.dataSource.entitySubject.pipe(
			skip(1),
			distinctUntilChanged()
		).subscribe(res => {
			this.jobsResult = res;
		});
		this.subscriptions.push(entitiesSubscription);
		this.store.pipe(
			select(selectJobsInStore),
		).subscribe((response: any) => {
			this.jobTotal = response.total;
		});

		// First Load
		of(undefined).pipe(take(1), delay(1000)).subscribe(() => { // Remove this line, just loading imitation
			this.loadJobsList();
		});
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
	loadJobsList() {
		this.selection.clear();
		const queryParams = new QueryParamsModel(
			this.filterConfiguration(),
			null,
			null,
			this.paginator.pageIndex,
			this.paginator.pageSize
		);
		this.store.dispatch(new JobsPageRequested({ page: queryParams }));
		this.selection.clear();
	}

	/** FILTRATION */
	filterConfiguration(): any {
		const filter: any = {};
		filter.status=1;
		return filter;
	}
	/**
	 * Redirect to apply page
	 *
	 * @param id
	 */
	applyJob(job:JobModel) {
		let _saveMessage;
		_saveMessage='You have just been applied this job successfully';
		let config = {
			panelClass: 'full-screen-modal',
			data:{job}
		  };		
		const dialogRef = this.dialog.open(ProposalApplyDialogComponent, config);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}
			let proposal = new ProposalModel;
			proposal.job_id = res.id;
			this.proposalService.createProposal(proposal).subscribe(
				res=>{
					this.layoutUtilsService.showActionNotification(_saveMessage, MessageType.Update,500,true,false);
					this.loadJobsList();
				}
			)
		});

	}
	/** UI */
	/**
	 * Retursn CSS Class Name by status
	 *
	 * @param status: string
	 */
	getItemCssClassByStatus(status: number): string {
		switch (status) {
			case 1:
				return 'primary';
		}
		return '';
	}

	/**
	 * Returns Item Status in string
	 * @param status: number
	 */
	getItemStatusString(status: number): string {
		switch (status) {
			case 1:
				return 'Active';
		}
		return 'Inactive';
	}
}
