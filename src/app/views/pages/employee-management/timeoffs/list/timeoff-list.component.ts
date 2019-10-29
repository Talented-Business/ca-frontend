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
    TimeoffModel,ContractModel,EmployeeModel,
    TimeoffsDataSource, TimeoffsPageRequested,
	TimeoffService,EmployeesService,selectTimeoffsInStore,
} from '../../../../../core/humanresource';
import { currentUser } from '../../../../../core/auth';
// Components
import { TimeoffEditDialogComponent } from '../edit/timeoff-edit.dialog.component';
import { TimeoffReadDialogComponent } from '../read/timeoff-read.dialog.component';

// Table with EDIT item in MODAL
// ARTICLE for table with sort/filter/paginator
// https://blog.angular-university.io/angular-material-data-table/
// https://v5.material.angular.io/components/table/overview
// https://v5.material.angular.io/components/sort/overview
// https://v5.material.angular.io/components/table/overview#sorting
// https://www.youtube.com/watch?v=NSt9CI3BXv4
@Component({
	selector: 'kt-timeoff-list',
	templateUrl: './timeoff-list.component.html',
	styleUrls:['./timeoff-list.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class TimeoffListComponent implements OnInit, OnDestroy {
	// Table fields
	// Incoming data
	@Input() employeeId$: Observable<number>;
	employeeId: number;
	dataSource: TimeoffsDataSource;
	displayedColumns = ['name', 'reason', 'policy','start_date','end_date','days','status', 'actions'];
	@ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
	@ViewChild('sort1', {static: true}) sort: MatSort;
	@ViewChild('searchInput', {static: true}) searchInput: ElementRef;
	@ViewChild('status', {static: true}) status: ElementRef;
	// Selection
	selection = new SelectionModel<TimeoffModel>(true, []);
	timeoffsResult: TimeoffModel[] = [];
	members:EmployeeModel[]=[];
	loginedUser:any;
	timeoffTotal:number;

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
				this.loadTimeoffsList();
			})
		)
		.subscribe();
		this.subscriptions.push(paginatorSubscriptions);

		this.store.select(currentUser).subscribe(user=>{
			if(user !=undefined){
				this.loginedUser = user;
				switch(user.type){
					case 'admin':
						this.displayedColumns = ['reason', 'policy','start_date','end_date','days','status'];
						break;
					case 'company':
						this.displayedColumns = ['name', 'reason', 'policy','start_date','end_date','days','status', 'actions'];
						break;
					case 'member': case 'employee':
						this.displayedColumns = ['reason', 'policy','start_date','end_date','days','status', 'actions'];
							
				}
			}
		})


		// Init DataSource
		this.dataSource = new TimeoffsDataSource(this.store);
		const entitiesSubscription = this.dataSource.entitySubject.pipe(
			skip(1),
			distinctUntilChanged()
		).subscribe(res => {
			this.timeoffsResult = res;
		});
		this.subscriptions.push(entitiesSubscription);
		this.store.pipe(
			select(selectTimeoffsInStore),
		).subscribe((response: any) => {
			this.timeoffTotal = response.total;
		});

		// Filtration, bind to searchInput
		const searchSubscription = fromEvent(this.searchInput.nativeElement, 'keyup').pipe(
			// tslint:disable-next-line:max-line-length
			debounceTime(50), // The user can type quite quickly in the input box, and that could trigger a lot of server requests. With this operator, we are limiting the amount of server requests emitted to a maximum of one every 150ms
			distinctUntilChanged(), // This operator will eliminate duplicate values
			tap(() => {
				this.paginator.pageIndex = 0;
				this.loadTimeoffsList();
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
				this.loadTimeoffsList();
			})
		)
		.subscribe();
		this.subscriptions.push(statusSubscription);
		if(this.employeeId$){
			this.employeeId$.subscribe(res => {
				if (!res) {
					return;
				}
	
				this.employeeId = res;
				of(undefined).pipe(delay(1000)).subscribe(() => { // Remove this line, just loading imitation
					this.loadTimeoffsList();
				}); // Remove this line, just loading imitation
			});
		}else{
			of(undefined).pipe(delay(1000)).subscribe(() => { // Remove this line, just loading imitation
				this.loadTimeoffsList();
			}); // Remove this line, just loading imitation
		}
		this.employeesService.findUnhiredEmployees().pipe().subscribe(res=>this.members = res);		
	
	}
	searchshow(){// admin and member has no filter only company user can have filter
		if(this.loginedUser&&this.loginedUser.type == 'company')return false;
		return true;
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
	loadTimeoffsList() {
		this.selection.clear();
		const queryParams = new QueryParamsModel(
			this.filterConfiguration(),
			this.sort.direction,
			this.sort.active,
			this.paginator.pageIndex,
			this.paginator.pageSize
		);
		this.store.dispatch(new TimeoffsPageRequested({ page: queryParams }));
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
		if(this.employeeId)filter.employee_id = this.employeeId;
		if(this.loginedUser){
			switch(this.loginedUser.type){
				case 'company':
					filter.company_id = this.loginedUser.company.id;
					break;
				case 'employee':
					filter.employee_id = this.loginedUser.member.id;
					break;
			}
		}
		return filter;
	}
	/**
	 * edit
	 *
	 * @param id
	 */
	edit(timeoff:TimeoffModel) {
		let _saveMessage;
		const _messageType = timeoff.id > 0 ? MessageType.Update : MessageType.Create;
		if(timeoff.id > 0){
			_saveMessage='The timeoff has been updated successfully';
		}else{
			_saveMessage='New time off has been created successfully';
			timeoff = new TimeoffModel;
			timeoff.end_date = new Date;
			timeoff.start_date = new Date;
		}
		let config = {
			panelClass: 'full-screen-modal',
			data:{timeoff}
		  };		
		const dialogRef = this.dialog.open(TimeoffEditDialogComponent, config);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}

			this.layoutUtilsService.showActionNotification(_saveMessage, _messageType,500,true,false);
			this.loadTimeoffsList();
		});
	}
	/**
	 * view
	 *
	 * @param id
	 */
	view(timeoff:TimeoffModel) {
		let config = {
			panelClass: 'full-screen-modal',
			data:{timeoff}
		  };		
		const dialogRef = this.dialog.open(TimeoffReadDialogComponent, config);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}
			of(undefined).pipe(delay(1000)).subscribe(() => { // Remove this line, just loading imitation
				let _saveMessage;
				const _messageType = MessageType.Update;
				if(res=="approved"){
					_saveMessage = 'You approved the Time off request successfully';
				}else{
					_saveMessage = 'You rejected the Time off request successfully';
				}
				this.layoutUtilsService.showActionNotification(_saveMessage, _messageType,2000,true,false);
				this.loadTimeoffsList();
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
}
