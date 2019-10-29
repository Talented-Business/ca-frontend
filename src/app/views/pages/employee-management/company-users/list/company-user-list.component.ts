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
    CompanyUserModel,
    CompanyUsersDataSource, CompanyUsersPageRequested,
	CompanyUserService,selectCompanyUsersInStore,
} from '../../../../../core/humanresource';
// Components
import { CompanyUserEditDialogComponent } from '../edit/company-user-edit.dialog.component';


// Table with EDIT item in MODAL
// ARTICLE for table with sort/filter/paginator
// https://blog.angular-university.io/angular-material-data-table/
// https://v5.material.angular.io/components/table/overview
// https://v5.material.angular.io/components/sort/overview
// https://v5.material.angular.io/components/table/overview#sorting
// https://www.youtube.com/watch?v=NSt9CI3BXv4
@Component({
	selector: 'kt-company-user-list',
	templateUrl: './company-user-list.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class CompanyUserListComponent implements OnInit, OnDestroy {
	// Table fields
	// Incoming data
	@Input() companyId$: Observable<number>;
	companyId:number;
	dataSource: CompanyUsersDataSource;
	displayedColumns = ['name', 'email','created_date','status', 'actions'];
	@ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
	@ViewChild('sort1', {static: true}) sort: MatSort;
	// Selection
	selection = new SelectionModel<CompanyUserModel>(true, []);
	companyUsersResult: CompanyUserModel[] = [];
	companyUserTotal:number;

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
		public snackBar: MatSnackBar,
		public dialog: MatDialog,
		private layoutUtilsService: LayoutUtilsService,
		private store: Store<AppState>,
		private companyUserService:CompanyUserService
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
				this.loadCompanyUsersList();
			})
		)
		.subscribe();
		this.subscriptions.push(paginatorSubscriptions);



		// Init DataSource
		this.dataSource = new CompanyUsersDataSource(this.store);
		const entitiesSubscription = this.dataSource.entitySubject.pipe(
			skip(1),
			distinctUntilChanged()
		).subscribe(res => {
			this.companyUsersResult = res;
		});
		this.subscriptions.push(entitiesSubscription);
		this.store.pipe(
			select(selectCompanyUsersInStore),
		).subscribe((response: any) => {
			this.companyUserTotal = response.total;
		});

		this.companyId$.subscribe(res => {
			if (!res) {
				return;
			}

			this.companyId = res;
			of(undefined).pipe(delay(1000)).subscribe(() => { // Remove this line, just loading imitation
				this.loadCompanyUsersList();
			}); // Remove this line, just loading imitation
		});
		// First Load
		of(undefined).pipe(take(1), delay(1000)).subscribe(() => { // Remove this line, just loading imitation
			this.loadCompanyUsersList();
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
	loadCompanyUsersList() {
		this.selection.clear();
		const queryParams = new QueryParamsModel(
			this.filterConfiguration(),
			this.sort.direction,
			this.sort.active,
			this.paginator.pageIndex,
			this.paginator.pageSize
		);
		this.store.dispatch(new CompanyUsersPageRequested({ page: queryParams }));
		this.selection.clear();
	}

	/** FILTRATION */
	filterConfiguration(): any {
		const filter: any = {};
		filter.company_id = this.companyId;
		return filter;
	}
	/**
	 * Redirect to edit page
	 *
	 * @param id
	 */
	editCompanyUser(companyUser:CompanyUserModel) {
		let _saveMessage;
		const _messageType = companyUser.id > 0 ? MessageType.Update : MessageType.Create;
		if(companyUser.id > 0){
			_saveMessage='The company user has been updated successfully';
		}else{
			_saveMessage='New company user has been created successfully';
		}
		let config = {
			width: '68vw',
			'margin-right':'auto',
			'margin-left':'auto',
			panelClass: 'full-screen-modal',
			data:{companyUser,company_id:this.companyId}
		  };		
		const dialogRef = this.dialog.open(CompanyUserEditDialogComponent, config);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}

			this.layoutUtilsService.showActionNotification(_saveMessage, _messageType,500,true,false);
			this.loadCompanyUsersList();
		});

	}
	toggleStatus(companyUser:CompanyUserModel){
		if(companyUser.status){
			if(confirm('Do you confirm to terminate the companyUser?')==false)return;
		}
		const queryParams = new QueryParamsModel(
			this.filterConfiguration(),
			this.sort.direction,
			this.sort.active,
			this.paginator.pageIndex,
			this.paginator.pageSize
		);
		this.companyUserService.toggleStatus(companyUser.id).pipe(
		).subscribe(res=>{
			this.store.dispatch(new CompanyUsersPageRequested({ page: queryParams }));
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
	addCompanyUser() {
		const newCompanyUser = new CompanyUserModel();
		newCompanyUser.clear(); // Set all defaults fields
		this.editCompanyUser(newCompanyUser);

	}
}
