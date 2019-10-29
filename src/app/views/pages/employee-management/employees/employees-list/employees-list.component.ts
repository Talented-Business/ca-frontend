// Angular
import { Component, OnInit, ElementRef, ViewChild, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {FormControl} from '@angular/forms'
// Material
import { SelectionModel } from '@angular/cdk/collections';
import { MatPaginator, MatSort, MatSnackBar, MatDatepickerInputEvent } from '@angular/material';
// RXJS
import { debounceTime, distinctUntilChanged, tap, skip, take, delay } from 'rxjs/operators';
import { fromEvent, merge, Observable, of, Subscription } from 'rxjs';
// LODASH
import { each, find } from 'lodash';
// NGRX
import { Store, select } from '@ngrx/store';
import { AppState } from '../../../../../core/reducers';

// Services
import { LayoutUtilsService, MessageType, QueryParamsModel } from '../../../../../core/_base/crud';
// Models
import {
    EmployeeModel,
    EmployeesDataSource, EmployeesPageRequested, RecruitsStatusUpdated,
	EmployeesService,selectEmployeesInStore,
} from '../../../../../core/humanresource';
import { SubheaderService } from '../../../../../core/_base/layout';

// Table with EDIT item in MODAL
// ARTICLE for table with sort/filter/paginator
// https://blog.angular-university.io/angular-material-data-table/
// https://v5.material.angular.io/components/table/overview
// https://v5.material.angular.io/components/sort/overview
// https://v5.material.angular.io/components/table/overview#sorting
// https://www.youtube.com/watch?v=NSt9CI3BXv4
@Component({
	selector: 'kt-employees-list',
	templateUrl: './employees-list.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmployeesListComponent implements OnInit, OnDestroy {
	// Table fields
	dataSource: EmployeesDataSource;
	displayedColumns = ['id','first_name','last_name', 'id_number', 'age','current_location', 'status', 'actions'];
	@ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
	@ViewChild('sort1', {static: true}) sort: MatSort;
	// Filter fields
	@ViewChild('searchInput', {static: true}) searchInput: ElementRef;
	@ViewChild('status', {static: true}) status: ElementRef;
	// Selection
	selection = new SelectionModel<EmployeeModel>(true, []);
	employeesResult: EmployeeModel[] = [];
	public employeeTotal:number;

	// Subscriptions
	private subscriptions: Subscription[] = [];

	/**
	 *
	 * @param activatedRoute: ActivatedRoute
	 * @param store: Store<AppState>
	 * @param router: Router
	 * @param subheaderService: SubheaderService
	 */
	constructor(
		private activatedRoute: ActivatedRoute,
		private router: Router,
		public snackBar: MatSnackBar,
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
				this.loadEmployeesList();
			})
		)
		.subscribe();
		this.subscriptions.push(paginatorSubscriptions);


		// Filtration, bind to searchInput
		const searchSubscription = fromEvent(this.searchInput.nativeElement, 'keyup').pipe(
			// tslint:disable-next-line:max-line-length
			debounceTime(150), // The user can type quite quickly in the input box, and that could trigger a lot of server requests. With this operator, we are limiting the amount of server requests emitted to a maximum of one every 150ms
			distinctUntilChanged(), // This operator will eliminate duplicate values
			tap(() => {
				this.paginator.pageIndex = 0;
				this.loadEmployeesList();
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
				this.loadEmployeesList();
			})
		)
		.subscribe();
		this.subscriptions.push(statusSubscription);


		// Init DataSource
		this.dataSource = new EmployeesDataSource(this.store);
		const entitiesSubscription = this.dataSource.entitySubject.pipe(
			skip(1),
			distinctUntilChanged()
		).subscribe(res => {
			this.employeesResult = res;
		});
		this.subscriptions.push(entitiesSubscription);
		this.store.pipe(
			select(selectEmployeesInStore),
		).subscribe((response: any) => {
			this.employeeTotal = response.total;
			if(response.total == 0){
				localStorage.removeItem('employeesPageStatus');
			}
		});

		// First Load
		of(undefined).pipe(take(1), delay(1000)).subscribe(() => { // Remove this line, just loading imitation
			let employeesPageStatus = localStorage.getItem('employeesPageStatus');
			if(employeesPageStatus ){
				let pageStatus = JSON.parse(employeesPageStatus);
				this.paginator.pageIndex = pageStatus.pageNumber;
				this.paginator.pageSize = pageStatus.pageSize;
				if(Object.keys(pageStatus.filter).length>0){
					if(pageStatus.filter.status)this.status.nativeElement.value = pageStatus.filter.status;
					if(pageStatus.filter.first_name)this.searchInput.nativeElement.value = pageStatus.filter.first_name;
				}
			}
			this.loadEmployeesList();
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
	loadEmployeesList() {
		this.selection.clear();
		const queryParams = new QueryParamsModel(
			this.filterConfiguration(),
			this.sort.direction,
			this.sort.active,
			this.paginator.pageIndex,
			this.paginator.pageSize
		);
		this.store.dispatch(new EmployeesPageRequested({ page: queryParams }));
		this.selection.clear();
	}

	/** FILTRATION */
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
		filter.type=true;//recruit
		return filter;
	}
    _calculateAge(birthday) { // birthday is a date
        birthday = new Date(birthday);
        var ageDifMs = Date.now() - birthday.getTime();
        var ageDate = new Date(ageDifMs); // miliseconds from epoch
        return Math.abs(ageDate.getUTCFullYear() - 1970);
    }
	/** UI */
	/**
	 * Retursn CSS Class Name by status
	 *
	 * @param status: string
	 */
	getItemCssClassByStatus(status: string): string {
		switch (status) {
			case 'disabled':
				return 'metal';
			case 'hired':
				return 'primary';
			case 'approved':
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
			case 'disabled':
				return 'disabled';
			case 'hired':
				return 'hired';
			case 'approved':
				return 'available';
		}
		return '';
	}


	/**
	 * Redirect to edit page
	 *
	 * @param id
	 */
	editEmployee(id) {
		const queryParams = new QueryParamsModel(
			this.filterConfiguration(),
			this.sort.direction,
			this.sort.active,
			this.paginator.pageIndex,
			this.paginator.pageSize
		);
		localStorage.setItem('employeesPageStatus',  JSON.stringify(queryParams));
		this.router.navigate(['../employees/edit', id], { relativeTo: this.activatedRoute });
	}
	/**
	 * Redirect to view page
	 *
	 * @param id
	 */
	readEmployee(id) {
		const queryParams = new QueryParamsModel(
			this.filterConfiguration(),
			this.sort.direction,
			this.sort.active,
			this.paginator.pageIndex,
			this.paginator.pageSize
		);
		localStorage.setItem('employeesPageStatus',  JSON.stringify(queryParams));
		this.router.navigate(['../employees/view', id], { relativeTo: this.activatedRoute });
	}
	disableEmployee(id){
		if(id){
			if(confirm('Do you confirm to disable this employee?')==false)return;
		}
		const queryParams = new QueryParamsModel(
			this.filterConfiguration(),
			this.sort.direction,
			this.sort.active,
			this.paginator.pageIndex,
			this.paginator.pageSize
		);
		this.employeesService.disableStatus(id).pipe(
		).subscribe(res=>{
			this.store.dispatch(new EmployeesPageRequested({ page: queryParams }));
		});				
	}
	restoreEmployee(id){
		const queryParams = new QueryParamsModel(
			this.filterConfiguration(),
			this.sort.direction,
			this.sort.active,
			this.paginator.pageIndex,
			this.paginator.pageSize
		);
		this.employeesService.restoreStatus(id).pipe(
		).subscribe(res=>{
			this.store.dispatch(new EmployeesPageRequested({ page: queryParams }));
		});				
	}
}
