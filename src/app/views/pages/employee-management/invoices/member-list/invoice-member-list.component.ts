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
    InvoiceModel,ContractModel,EmployeeModel,
    InvoicesDataSource, InvoicesPageRequested,
	InvoiceService,EmployeesService,selectInvoicesInStore,
} from '../../../../../core/humanresource';
import { currentUser } from '../../../../../core/auth';
// Components
import { InvoiceCompanyReadDialogComponent } from '../company-read/invoice-company-read.dialog.component';

// Table with EDIT item in MODAL
// ARTICLE for table with sort/filter/paginator
// https://blog.angular-university.io/angular-material-data-table/
// https://v5.material.angular.io/components/table/overview
// https://v5.material.angular.io/components/sort/overview
// https://v5.material.angular.io/components/table/overview#sorting
// https://www.youtube.com/watch?v=NSt9CI3BXv4
@Component({
	selector: 'kt-invoice-member-list',
	templateUrl: './invoice-member-list.component.html',
	styleUrls:['./invoice-member-list.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class InvoiceMemberListComponent implements OnInit, OnDestroy {
	// Table fields
	// Incoming data
	@Input() employeeId$: Observable<number>;
	employeeId: number;
	dataSource: InvoicesDataSource;
	displayedColumns = ['invoice', 'period'	, 'total','status'];
	@ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
	@ViewChild('sort1', {static: true}) sort: MatSort;
	// Selection
	selection = new SelectionModel<InvoiceModel>(true, []);
	invoicesResult: InvoiceModel[] = [];
	loginedUser:any;
	invoiceTotal:number;
	selectedPayment:InvoiceModel;

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
				this.loadInvoicesList();
			})
		)
		.subscribe();
		this.subscriptions.push(paginatorSubscriptions);

		const loginSubscriptions = this.store.select(currentUser).subscribe(user=>{
			if(user !=undefined){
				this.loginedUser = user;
			}
		})
		this.subscriptions.push(loginSubscriptions);

		// Init DataSource
		this.dataSource = new InvoicesDataSource(this.store);
		const entitiesSubscription = this.dataSource.entitySubject.pipe(
			skip(1),
			distinctUntilChanged()
		).subscribe(res => {
			this.invoicesResult = res;
			if(this.invoicesResult.length>0)this.selectedPayment = this.invoicesResult[0];
		});
		this.subscriptions.push(entitiesSubscription);
		this.store.pipe(
			select(selectInvoicesInStore),
		).subscribe((response: any) => {
			this.invoiceTotal = response.total;
		});

		if(this.employeeId$){
			this.employeeId$.subscribe(res => {
				if (!res) {
					return;
				}
	
				this.employeeId = res;
				of(undefined).pipe(delay(1000)).subscribe(() => { // Remove this line, just loading imitation
					this.loadInvoicesList();
				}); // Remove this line, just loading imitation
			});
		}else{
			of(undefined).pipe(delay(1000)).subscribe(() => { // Remove this line, just loading imitation
				this.loadInvoicesList();
			}); // Remove this line, just loading imitation
		}
	
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
	loadInvoicesList() {
		this.selection.clear();
		const queryParams = new QueryParamsModel(
			this.filterConfiguration(),
			this.sort.direction,
			this.sort.active,
			this.paginator.pageIndex,
			this.paginator.pageSize
		);
		this.store.dispatch(new InvoicesPageRequested({ page: queryParams }));
		this.selection.clear();
	}
	selectRow(row){
		this.selectedPayment = row;
	}

	/** FILTRATION */
	filterConfiguration(): any {
		const filter: any = {};
		if(this.loginedUser){
			switch(this.loginedUser.type){
				case 'super': case 'admin':
					filter.employee_id = this.employeeId;
					break;
				case 'employee':
					filter.employee_id = this.loginedUser.member.id;
					break;
			}
		}
		return filter;
	}
	
	/**
	 * view
	 *
	 * @param id
	 */
	view(invoice:InvoiceModel) {
		let config = {
			width: '78vw',
			'margin-right':'auto',
			'margin-left':'auto',
			panelClass: 'full-screen-modal',
			data:{invoice}
		  };		
		const dialogRef = this.dialog.open(InvoiceCompanyReadDialogComponent, config);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}
			of(undefined).pipe(delay(1000)).subscribe(() => { // Remove this line, just loading imitation
				let _saveMessage;
				const _messageType = MessageType.Update;
				if(res=="approved"){
					_saveMessage = 'You approved the Invoice successfully';
				}else{
					_saveMessage = 'You rejected the Invoice successfully';
				}
				this.layoutUtilsService.showActionNotification(_saveMessage, _messageType,2000,true,false);
				this.loadInvoicesList();
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
			case 'Invoice':
				return 'primary';
			case 'Proforma':
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
			case 'Proforma':
				return 'Proforma';
			case 'Invoice':
				return 'Pending';
			case 'Recheck':
				return 'Recheck';
			case 'Paid':
				return 'Paid';
			default:
				return 	'';	
			}
	}
}
