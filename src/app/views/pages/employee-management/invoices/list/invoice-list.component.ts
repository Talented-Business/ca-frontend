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
	InvoiceService,selectInvoicesInStore,
} from '../../../../../core/humanresource';
import { currentUser } from '../../../../../core/auth';
// Components
import { InvoiceEditComponent } from '../edit/invoice-edit.component';
import { InvoiceReadDialogComponent } from '../read/invoice-read.dialog.component';

// Table with EDIT item in MODAL
// ARTICLE for table with sort/filter/paginator
// https://blog.angular-university.io/angular-material-data-table/
// https://v5.material.angular.io/components/table/overview
// https://v5.material.angular.io/components/sort/overview
// https://v5.material.angular.io/components/table/overview#sorting
// https://www.youtube.com/watch?v=NSt9CI3BXv4
@Component({
	selector: 'kt-invoice-list',
	templateUrl: './invoice-list.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class InvoiceListComponent implements OnInit, OnDestroy {
	// Table fields
	// Incoming data
	dataSource: InvoicesDataSource;
	displayedColumns = ['id', 'date', 'company','amount','status', 'actions'];
	@ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
	@ViewChild('sort1', {static: true}) sort: MatSort;
	@ViewChild('searchInput', {static: true}) searchInput: ElementRef;
	// Selection
	selection = new SelectionModel<InvoiceModel>(true, []);
	invoicesResult: InvoiceModel[] = [];
	loginedUser:any;
	invoiceTotal:number;

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
		private invoiceService:InvoiceService,
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

		this.store.select(currentUser).subscribe(user=>{
			if(user !=undefined){
				this.loginedUser = user;
				switch(user.type){
					case 'admin':
						//this.displayedColumns = ['reason', 'policy','start_date','end_date','days','status'];
						break;
					case 'company':
						//this.displayedColumns = ['name', 'reason', 'policy','start_date','end_date','days','status', 'actions'];
						break;
					case 'member': case 'employee':
						//this.displayedColumns = ['reason', 'policy','start_date','end_date','days','status', 'actions'];
							
				}
			}
		})


		// Init DataSource
		this.dataSource = new InvoicesDataSource(this.store);
		const entitiesSubscription = this.dataSource.entitySubject.pipe(
			skip(1),
			distinctUntilChanged()
		).subscribe(res => {
			this.invoicesResult = res;
		});
		this.subscriptions.push(entitiesSubscription);
		this.store.pipe(
			select(selectInvoicesInStore),
		).subscribe((response: any) => {
			this.invoiceTotal = response.total;
		});

		// Filtration, bind to searchInput
		const searchSubscription = fromEvent(this.searchInput.nativeElement, 'keyup').pipe(
			// tslint:disable-next-line:max-line-length
			debounceTime(50), // The user can type quite quickly in the input box, and that could trigger a lot of server requests. With this operator, we are limiting the amount of server requests emitted to a maximum of one every 150ms
			distinctUntilChanged(), // This operator will eliminate duplicate values
			tap(() => {
				this.paginator.pageIndex = 0;
				this.loadInvoicesList();
			})
		)
		.subscribe();
		this.subscriptions.push(searchSubscription);

		of(undefined).pipe(delay(1000)).subscribe(() => { // Remove this line, just loading imitation
			this.loadInvoicesList();
		}); // Remove this line, just loading imitation
	
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

	/** FILTRATION */
	filterConfiguration(): any {
		const filter: any = {};
		const searchText: string = this.searchInput.nativeElement.value;


		if (searchText) {
            filter.name = searchText;
		}
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
	add(){
		/*let invoice = new InvoiceModel;
		this.edit(invoice);*/
		this.router.navigate(['../billings/add'], { relativeTo: this.activatedRoute });
	}
	/**
	 * edit
	 *
	 * @param id
	 */
	edit(invoice:InvoiceModel) {
		const queryParams = new QueryParamsModel(
			this.filterConfiguration(),
			this.sort.direction,
			this.sort.active,
			this.paginator.pageIndex,
			this.paginator.pageSize
		);
		localStorage.setItem('invoicesPageStatus',  JSON.stringify(queryParams));
		this.router.navigate(['../billings/edit', invoice.id], { relativeTo: this.activatedRoute });
/*
		let _saveMessage;
		const _messageType = invoice.id > 0 ? MessageType.Update : MessageType.Create;
		if(invoice.id > 0){
			_saveMessage='The invoice has been updated successfully';
		}else{
			_saveMessage='New invoice has been created successfully';
			invoice = new InvoiceModel;
		}
		let config = {
			width: '78vw',
			'margin-right':'auto',
			'margin-left':'auto',
			panelClass: 'full-screen-modal',
			data:{invoice}
		  };		
		const dialogRef = this.dialog.open(InvoiceEditComponent, config);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}

			this.layoutUtilsService.showActionNotification(_saveMessage, _messageType,500,true,false);
			this.loadInvoicesList();
		});*/
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
		const dialogRef = this.dialog.open(InvoiceReadDialogComponent, config);
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
	/**
	 *  Paid
	 *
	 */
	paid(invoice:InvoiceModel) {
		if(confirm("Are you sure this invoice is paid?")){
			this.invoiceService.paid(invoice).pipe().subscribe(
				res=>{
					this.loadInvoicesList();
				}
			);
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
			case 'Proforma':
			case 'archived':
			case 'inreview':
				return 'primary';
			case 'Invoice':
				return 'success';
			case 'Recheck':
				return 'danger';
			case 'Paid':
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
			case 'Proforma':
				return 'Proforma';
			case 'Invoice':
				return 'Approved';
			case 'Recheck':
				return 'Recheck';
			case 'Paid':
				return 'Paid';
			default:
				return 	status;	
		}
	}
}
