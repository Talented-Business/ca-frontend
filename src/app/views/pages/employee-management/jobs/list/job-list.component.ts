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
    JobModel,
    JobsDataSource, JobsPageRequested,
	JobService,selectJobsInStore,
} from '../../../../../core/humanresource';
// Components
import { JobEditDialogComponent } from '../edit/job-edit.dialog.component';


// Table with EDIT item in MODAL
// ARTICLE for table with sort/filter/paginator
// https://blog.angular-university.io/angular-material-data-table/
// https://v5.material.angular.io/components/table/overview
// https://v5.material.angular.io/components/sort/overview
// https://v5.material.angular.io/components/table/overview#sorting
// https://www.youtube.com/watch?v=NSt9CI3BXv4
@Component({
	selector: 'kt-job-list',
	templateUrl: './job-list.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class JobListComponent implements OnInit, OnDestroy {
	// Table fields
	// Incoming data
	dataSource: JobsDataSource;
	displayedColumns = ['date', 'title', 'position','applicants','status', 'actions'];
	@ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
	@ViewChild('sort1', {static: true}) sort: MatSort;
	@ViewChild('searchInput', {static: true}) searchInput: ElementRef;
	// Selection
	selection = new SelectionModel<JobModel>(true, []);
	jobsResult: JobModel[] = [];
	jobTotal:number;

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
		private jobService:JobService
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

		// Filtration, bind to searchInput
		const searchSubscription = fromEvent(this.searchInput.nativeElement, 'keyup').pipe(
			// tslint:disable-next-line:max-line-length
			debounceTime(50), // The user can type quite quickly in the input box, and that could trigger a lot of server requests. With this operator, we are limiting the amount of server requests emitted to a maximum of one every 150ms
			distinctUntilChanged(), // This operator will eliminate duplicate values
			tap(() => {
				this.paginator.pageIndex = 0;
				this.loadJobsList();
			})
		)
		.subscribe();
        this.subscriptions.push(searchSubscription);

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
			this.sort.direction,
			this.sort.active,
			this.paginator.pageIndex,
			this.paginator.pageSize
		);
		this.store.dispatch(new JobsPageRequested({ page: queryParams }));
		this.selection.clear();
	}

	/** FILTRATION */
	filterConfiguration(): any {
		const filter: any = {};
		const searchText: string = this.searchInput.nativeElement.value;


		if (searchText) {
            filter.title = searchText;
            filter.position = searchText;
        }

		return filter;
	}
	/**
	 * Redirect to edit page
	 *
	 * @param id
	 */
	editJob(job:JobModel) {
		let _saveMessage;
		const _messageType = job.id > 0 ? MessageType.Update : MessageType.Create;
		if(job.id > 0){
			_saveMessage='The job has been updated successfully';
		}else{
			_saveMessage='New job has been created successfully';
		}
		let config = {
			width: '68vw',
			'margin-right':'auto',
			'margin-left':'auto',
			panelClass: 'full-screen-modal',
			data:{job}
		  };		
		const dialogRef = this.dialog.open(JobEditDialogComponent, config);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}

			this.layoutUtilsService.showActionNotification(_saveMessage, _messageType,500,true,false);
			this.loadJobsList();
		});

	}
	toggleStatus(job:JobModel){
		if(job.status){
			if(confirm('Do you confirm to terminate the job?')==false)return;
		}
		const queryParams = new QueryParamsModel(
			this.filterConfiguration(),
			this.sort.direction,
			this.sort.active,
			this.paginator.pageIndex,
			this.paginator.pageSize
		);
		this.jobService.toggleStatus(job.id).pipe(
		).subscribe(res=>{
			this.store.dispatch(new JobsPageRequested({ page: queryParams }));
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
	/**
	 * Redirect to add page
	 *
	 */
	addJob() {
		const newJob = new JobModel();
		newJob.clear(); // Set all defaults fields
		this.editJob(newJob);
	}

	/**
	 * Show recruit 
	 * @param recruit: EmployeeModel
	 */
	viewJob(id:number) {
		const queryParams = new QueryParamsModel(
			this.filterConfiguration(),
			this.sort.direction,
			this.sort.active,
			this.paginator.pageIndex,
			this.paginator.pageSize
		);
		localStorage.setItem('jobsPageStatus',  JSON.stringify(queryParams));
		this.router.navigate(['../jobs/view', id], { relativeTo: this.activatedRoute });
	}	
}
