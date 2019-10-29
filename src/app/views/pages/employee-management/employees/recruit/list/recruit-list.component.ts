// Angular
import { Component, OnInit, ElementRef, ViewChild, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {FormControl} from '@angular/forms'
// Material
import { SelectionModel } from '@angular/cdk/collections';
import { MatPaginator, MatSort, MatSnackBar, MatDatepickerInputEvent } from '@angular/material';
// RXJS
import { debounceTime, distinctUntilChanged, tap, skip, delay, take } from 'rxjs/operators';
import { fromEvent, merge, Subscription, of } from 'rxjs';
// Translate Module
import { TranslateService } from '@ngx-translate/core';
// NGRX
import { Store, ActionsSubject,select } from '@ngrx/store';
import { AppState } from '../../../../../../core/reducers';
// CRUD
import { LayoutUtilsService, MessageType, QueryParamsModel } from '../../../../../../core/_base/crud';
// Services and Models
import {
    EmployeeModel,
    RecruitsDataSource, RecruitsPageRequested, RecruitsStatusUpdated,
	EmployeesService,selectRecruitsInStore,
} from '../../../../../../core/humanresource';
// Components
import { RecruitEditComponent } from '../edit/recruit-edit.component';

// Table with EDIT item in MODAL
// ARTICLE for table with sort/filter/paginator
// https://blog.angular-university.io/angular-material-data-table/
// https://v5.material.angular.io/compgetItemCssClassByStatusonents/table/overview
// https://v5.material.angular.io/components/sort/overview
// https://v5.material.angular.io/components/table/overview#sorting
// https://www.youtube.com/watch?v=NSt9CI3BXv4
@Component({
	// tslint:disable-next-line:component-selector
	selector: 'kt-recruits-list',
	templateUrl: './recruit-list.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,

})
export class RecruitsListComponent implements OnInit, OnDestroy {
	// Table fields
	dataSource: RecruitsDataSource;
	displayedColumns = ['name','create_date', 'id_number', 'age', 'current_location', 'status', 'actions'];
	@ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
	@ViewChild('sort1', {static: true}) sort: MatSort;
	// Filter fields
	@ViewChild('searchInput', {static: true}) searchInput: ElementRef;
    @ViewChild('status', {static: true}) status: ElementRef;
	filterStatus: string = '';
	filterType: string = '';
	// Selection
	selection = new SelectionModel<EmployeeModel>(true, []);
	recruitsResult: EmployeeModel[] = [];
	// Subscriptions
    private subscriptions: Subscription[] = [];
	private fromDate:string;
	public fromDateControl:FormControl;
	private toDate:string;
	public toDateControl:FormControl;
    public recruitTotal:number;

	/**
	 * Component constructor
	 *
	 * @param snackBar: MatSnackBar
	 * @param layoutUtilsService: LayoutUtilsService
	 * @param translate: TranslateService
	 * @param store: Store<AppState>
	 */
	constructor(
		private activatedRoute: ActivatedRoute,
		private router: Router,
		public snackBar: MatSnackBar,
		private layoutUtilsService: LayoutUtilsService,
		private translate: TranslateService,
		private store: Store<AppState>
	) { }

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
			tap(() => this.loadRecruitsList())
		)
		.subscribe();
		this.subscriptions.push(paginatorSubscriptions);

		// Filtration, bind to searchInput
		const searchSubscription = fromEvent(this.searchInput.nativeElement, 'keyup').pipe(
			// tslint:disable-next-line:max-line-length
			debounceTime(50), // The user can type quite quickly in the input box, and that could trigger a lot of server requests. With this operator, we are limiting the amount of server requests emitted to a maximum of one every 150ms
			distinctUntilChanged(), // This operator will eliminate duplicate values
			tap(() => {
				this.paginator.pageIndex = 0;
				this.loadRecruitsList();
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
				this.loadRecruitsList();
			})
		)
		.subscribe();
		this.subscriptions.push(statusSubscription);

		// Init DataSource
		this.dataSource = new RecruitsDataSource(this.store);
		const entitiesSubscription = this.dataSource.entitySubject.pipe(
			skip(1),
			distinctUntilChanged()
		).subscribe(res => {
			this.recruitsResult = res;
		});
		this.subscriptions.push(entitiesSubscription);
		this.store.pipe(
			select(selectRecruitsInStore),
		).subscribe((response: any) => {
			this.recruitTotal = response.total;
			if(response.total == 0){
				localStorage.removeItem('recruitsPageStatus');
			}
		});

		this.fromDateControl = new FormControl();
		this.toDateControl = new FormControl();
		// First load
		of(undefined).pipe(take(1), delay(1000)).subscribe(() => { // Remove this line, just loading imitation
			let recruitsPageStatus = localStorage.getItem('recruitsPageStatus');
			if(recruitsPageStatus ){
				let pageStatus = JSON.parse(recruitsPageStatus);
				this.paginator.pageIndex = pageStatus.pageNumber;
				this.paginator.pageSize = pageStatus.pageSize;
				if(Object.keys(pageStatus.filter).length>0){
					if(pageStatus.filter.status)this.status.nativeElement.value = pageStatus.filter.status;
					if(pageStatus.filter.first_name)this.searchInput.nativeElement.value = pageStatus.filter.first_name;
					if(pageStatus.filter.fromDate) {
						this.fromDateControl = new FormControl(new Date(pageStatus.filter.fromDate));
						this.fromDate = pageStatus.filter.fromDate;
					}
					if(pageStatus.filter.toDate){
						this.toDateControl = new FormControl(new Date(pageStatus.filter.toDate));
						this.toDate = pageStatus.filter.toDate;
					} 
				}
			}
			this.loadRecruitsList();
		}); // Remove this line, just loading imitation
    }
    
    addFromDateEvent(type: string, event: MatDatepickerInputEvent<Date>) {
        console.log(event.value)
        if(event.value)this.fromDate = event.value.toDateString();
        else this.fromDate = '';
		of(undefined).pipe(take(1), delay(1000)).subscribe(() => { // Remove this line, just loading imitation
			this.paginator.pageIndex = 0;
			this.loadRecruitsList();
		});        
    }
    addToDateEvent(type: string, event: MatDatepickerInputEvent<Date>) {
        if(event.value)this.toDate = event.value.toDateString();
        else this.toDate = '';
		of(undefined).pipe(take(1), delay(1000)).subscribe(() => { // Remove this line, just loading imitation
			this.paginator.pageIndex = 0;
			this.loadRecruitsList();
		});        
    }
	/**
	 * On Destroy
	 */
	ngOnDestroy() {
		this.subscriptions.forEach(el => el.unsubscribe());
	}

	/**
	 * Load Recruits List from service through data-source
	 */
	loadRecruitsList() {
		this.selection.clear();
		const queryParams = new QueryParamsModel(
			this.filterConfiguration(),
			this.sort.direction,
			this.sort.active,
			this.paginator.pageIndex,
			this.paginator.pageSize
		);
        // Call request from server
        this.store.dispatch(new RecruitsPageRequested({ page: queryParams }));
		this.selection.clear();
	}

	/**
	 * Returns object for filter
	 */
	filterConfiguration(): any {
		const filter: any = {};
		const searchText: string = this.searchInput.nativeElement.value;


		if (searchText) {
            filter.first_name = searchText;
            filter.last_name = searchText;
            filter.personal_email = searchText;
            filter.id_number = searchText;
            filter.home_phone_number = searchText;
            filter.mobile_phone_number = searchText;
        }
		filter.status = this.status.nativeElement.value;
		filter.type=false;//recruit
        if(this.fromDate)filter.fromDate = this.fromDate;
        if(this.toDate)filter.toDate = this.toDate;
		return filter;
	}


	/**
	 * Fetch selected recruits
	 */
	fetchRecruits() {
		const messages = [];
		this.selection.selected.forEach(elem => {
			messages.push({
				text: `${elem.last_name}, ${elem.first_name}`,
				id: elem.id.toString(),
				status: elem.status
			});
		});
		this.layoutUtilsService.fetchElements(messages);
	}

    _calculateAge(birthday) { // birthday is a date
        birthday = new Date(birthday);
        var ageDifMs = Date.now() - birthday.getTime();
        var ageDate = new Date(ageDifMs); // miliseconds from epoch
        return Math.abs(ageDate.getUTCFullYear() - 1970);
    }
	/**
	 * Show add recruit 
	 */
	addRecruit() {
		const newRecruit = new EmployeeModel();
		newRecruit.clear(); // Set all defaults fields
		this.editRecruit(newRecruit);
	}

	/**
	 * Show recruit 
	 * @param recruit: EmployeeModel
	 */
	editRecruit(id) {
		const queryParams = new QueryParamsModel(
			this.filterConfiguration(),
			this.sort.direction,
			this.sort.active,
			this.paginator.pageIndex,
			this.paginator.pageSize
		);
		localStorage.setItem('recruitsPageStatus',  JSON.stringify(queryParams));
		this.router.navigate(['../recruits/view', id], { relativeTo: this.activatedRoute });
	}

	/**
	 * Check all rows are selected
	 */
	isAllSelected(): boolean {
		const numSelected = this.selection.selected.length;
		const numRows = this.recruitsResult.length;
		return numSelected === numRows;
	}

	/**
	 * Toggle all selections
	 */
	masterToggle() {
		if (this.selection.selected.length === this.recruitsResult.length) {
			this.selection.clear();
		} else {
			this.recruitsResult.forEach(row => this.selection.select(row));
		}
	}

	/** UI */
	/**
	 * Retursn CSS Class Name by status
	 *
	 * @param status: string
	 */
	getItemCssClassByStatus(status: string): string {
		switch (status) {
			case 'Rejected':
				return 'danger';
			case 'Pending':
				return 'success';
		}
		return '';
	}

	/**
	 * Returns Item Status in string
	 * @param status: number
	 */
	getItemStatusString(status: string): string {
		switch (status) {
			case 'recruit':
				return 'Pending';
			case 'rejected':
				return 'Rejected';
		}
		return status;
	}

	/**
	 * Returns CSS Class Name by type
	 * @param status: number
	 */
	getItemCssClassByType(status: number = 0): string {
		switch (status) {
			case 0:
				return 'accent';
			case 1:
				return 'primary';
			case 2:
				return '';
		}
		return '';
	}

}
