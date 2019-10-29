// Angular
import { Component, OnInit, ElementRef, ViewChild, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
// Material
import { SelectionModel } from '@angular/cdk/collections';
import { MatPaginator, MatSort, MatSnackBar } from '@angular/material';
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
    CompanyModel,
    CompaniesDataSource, CompaniesPageRequested, RecruitsStatusUpdated,
	CompanyService,selectCompaniesInStore,
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
	selector: 'kt-company-list',
	templateUrl: './company-list.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class CompanyListComponent implements OnInit, OnDestroy {
	// Table fields
	dataSource: CompaniesDataSource;
	displayedColumns = ['name', 'industry','contact_name','status', 'actions'];
	@ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
	@ViewChild('sort1', {static: true}) sort: MatSort;
	// Filter fields
	@ViewChild('searchInput', {static: true}) searchInput: ElementRef;
	@ViewChild('status', {static: true}) status: ElementRef;
	// Selection
	selection = new SelectionModel<CompanyModel>(true, []);
	companiesResult: CompanyModel[] = [];
	companyTotal:number;

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
		private companyService:CompanyService
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
				this.loadCompaniesList();
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
				this.loadCompaniesList();
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
				this.loadCompaniesList();
			})
		)
		.subscribe();
		this.subscriptions.push(statusSubscription);


		// Init DataSource
		this.dataSource = new CompaniesDataSource(this.store);
		const entitiesSubscription = this.dataSource.entitySubject.pipe(
			skip(1),
			distinctUntilChanged()
		).subscribe(res => {
			this.companiesResult = res;
		});
		this.subscriptions.push(entitiesSubscription);
		this.store.pipe(
			select(selectCompaniesInStore),
		).subscribe((response: any) => {
			this.companyTotal = response.total;
			if(response.total == 0){
				localStorage.removeItem('companiesPageStatus');
			}
		});

		// First Load
		of(undefined).pipe(take(1), delay(1000)).subscribe(() => { // Remove this line, just loading imitation
			let companiesPageStatus = localStorage.getItem('companiesPageStatus');
			if(companiesPageStatus ){
				let pageStatus = JSON.parse(companiesPageStatus);
				this.paginator.pageIndex = pageStatus.pageNumber;
				this.paginator.pageSize = pageStatus.pageSize;
				if(Object.keys(pageStatus.filter).length>0){
					if(pageStatus.filter.status)this.status.nativeElement.value = pageStatus.filter.status;
					if(pageStatus.filter.first_name)this.searchInput.nativeElement.value = pageStatus.filter.first_name;
				}
			}
			this.loadCompaniesList();
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
	loadCompaniesList() {
		this.selection.clear();
		const queryParams = new QueryParamsModel(
			this.filterConfiguration(),
			this.sort.direction,
			this.sort.active,
			this.paginator.pageIndex,
			this.paginator.pageSize
		);
		this.store.dispatch(new CompaniesPageRequested({ page: queryParams }));
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
		return filter;
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
	 * Redirect to read page
	 *
	 * @param id
	 */
	readCompany(id:number) {
		const queryParams = new QueryParamsModel(
			this.filterConfiguration(),
			this.sort.direction,
			this.sort.active,
			this.paginator.pageIndex,
			this.paginator.pageSize
		);
		localStorage.setItem('companiesPageStatus',  JSON.stringify(queryParams));
		this.router.navigate(['../companies/view', id], { relativeTo: this.activatedRoute });
	}
	toggleStatus(company:CompanyModel){
		if(company.status){
			if(confirm('Do you confirm to make the company inactive?')==false)return;
		}
		const queryParams = new QueryParamsModel(
			this.filterConfiguration(),
			this.sort.direction,
			this.sort.active,
			this.paginator.pageIndex,
			this.paginator.pageSize
		);
		this.companyService.toggleStatus(company.id).pipe(
		).subscribe(res=>{
			this.store.dispatch(new CompaniesPageRequested({ page: queryParams }));
		});		
	}
	/**
	 * Redirect to add page
	 *
	 */
	addCompany() {
		this.router.navigate(['../companies/add'], { relativeTo: this.activatedRoute });
	}
}
