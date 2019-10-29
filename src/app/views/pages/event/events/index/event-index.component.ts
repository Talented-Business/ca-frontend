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
    EventModel,
    EventsDataSource, EventsPageRequested,
	EventService,selectEventsInStore,
} from '../../../../../core/event';


// Table with EDIT item in MODAL
// ARTICLE for table with sort/filter/paginator
// https://blog.angular-university.io/angular-material-data-table/
// https://v5.material.angular.io/components/table/overview
// https://v5.material.angular.io/components/sort/overview
// https://v5.material.angular.io/components/table/overview#sorting
// https://www.youtube.com/watch?v=NSt9CI3BXv4
@Component({
	selector: 'kt-event-index',
	templateUrl: './event-index.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class EventIndexComponent implements OnInit, OnDestroy {
	// Table fields
	// Incoming data
	dataSource: EventsDataSource;
	@ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
	// Selection
	selection = new SelectionModel<EventModel>(true, []);
	eventsResult: EventModel[] = [];
	eventTotal:number;

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
		private layoutUtilsService: LayoutUtilsService,
		private store: Store<AppState>,
		private eventService:EventService
	) {}

	/**
	 * @ Lifecycle sequences => https://angular.io/guide/lifecycle-hooks
	 */

	/**
	 * On init
	 */
	ngOnInit() {
		// If the user changes the sort order, reset back to the first page.
		/* Data load will be triggered in two cases:
		- when a pagination event occurs => this.paginator.page
		- when a sort event occurs => this.sort.sortChange
		**/
		const paginatorSubscriptions = merge( this.paginator.page).pipe(
			tap(() => {
				this.loadEventsList();
			})
		)
		.subscribe();
		this.subscriptions.push(paginatorSubscriptions);



		// Init DataSource
		this.dataSource = new EventsDataSource(this.store);
		const entitiesSubscription = this.dataSource.entitySubject.pipe(
			skip(1),
			distinctUntilChanged()
		).subscribe(res => {
			console.log(res)
			this.eventsResult = res;
		});
		this.subscriptions.push(entitiesSubscription);
		this.store.pipe(
			select(selectEventsInStore),
		).subscribe((response: any) => {
			this.eventTotal = response.total;
		});


		// First Load
		of(undefined).pipe(take(1), delay(1000)).subscribe(() => { // Remove this line, just loading imitation
			this.loadEventsList();
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
	loadEventsList() {
		this.selection.clear();
		const queryParams = new QueryParamsModel(
			this.filterConfiguration(),
			null,
			null,
			this.paginator.pageIndex,
			this.paginator.pageSize
		);
		this.store.dispatch(new EventsPageRequested({ page: queryParams }));
		this.selection.clear();
	}

	/** FILTRATION */
	filterConfiguration(): any {
		const filter: any = {};
		filter.status = "Publish";
		return filter;
	}

	/**
	 * Show recruit 
	 * @param recruit: EmployeeModel
	 */
	viewEvent(id:number) {
		const queryParams = new QueryParamsModel(
			this.filterConfiguration(),
			null,
			null,
			this.paginator.pageIndex,
			this.paginator.pageSize
		);
		localStorage.setItem('eventsPageStatus',  JSON.stringify(queryParams));
		this.router.navigate(['../events/view', id], { relativeTo: this.activatedRoute });
	}	
}
