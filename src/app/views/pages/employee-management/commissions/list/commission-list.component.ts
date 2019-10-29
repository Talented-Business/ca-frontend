// Angular
import { Component, OnInit, ElementRef, ViewChild, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef,Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
// Material
import { SelectionModel } from '@angular/cdk/collections';
import { MatPaginator, MatSort, MatSnackBar,MatDialog } from '@angular/material';
// RXJS
import { debounceTime, distinctUntilChanged, tap, skip, take, delay } from 'rxjs/operators';
import { fromEvent, merge, Observable, BehaviorSubject,of, Subscription } from 'rxjs';
import {  Update } from '@ngrx/entity';
// LODASH
import { each, find } from 'lodash';
// NGRX
import { Store, select } from '@ngrx/store';
import { AppState } from '../../../../../core/reducers';

// Services
import { LayoutUtilsService, MessageType, QueryParamsModel } from '../../../../../core/_base/crud';
import { currentUser } from '../../../../../core/auth';
// Models
import {
    CommissionGroupModel,CommissionModel,
    CommissionGroupsDataSource, CommissionGroupsPageRequested,
	CommissionGroupService,selectCommissionGroupsInStore,
	OneCommissionGroupDeleted,
} from '../../../../../core/humanresource';
// Components
import { CommissionEditDialogComponent } from '../edit/commission-edit.dialog.component';


// Table with EDIT item in MODAL
// ARTICLE for table with sort/filter/paginator
// https://blog.angular-university.io/angular-material-data-table/
// https://v5.material.angular.io/components/table/overview
// https://v5.material.angular.io/components/sort/overview
// https://v5.material.angular.io/components/table/overview#sorting
// https://www.youtube.com/watch?v=NSt9CI3BXv4
@Component({
	selector: 'kt-commission-group-list',
	templateUrl: './commission-list.component.html',
	styleUrls:['./commission-list.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class CommissionListComponent implements OnInit, OnDestroy {
	// Table fields
	// Incoming data
	@Input() employeeId$: Observable<number>;
	employeeId: number;
	dataSource: CommissionGroupsDataSource;
	displayedColumns = ['id','period','total','status'];
	@ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
	@ViewChild('sort1', {static: true}) sort: MatSort;
	loginedUser:any;
	// Selection
	selection = new SelectionModel<CommissionGroupModel>(true, []);
	commissionGroupsResult: CommissionGroupModel[] = [];
	commissionGroupTotal:number;
	canCreateCommission$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
	selectedCommissonGroup:CommissionGroupModel;

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
		private cdr: ChangeDetectorRef
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
				this.loadCommissionGroupsList();
			})
		)
		.subscribe();
		this.subscriptions.push(paginatorSubscriptions);
		this.store.select(currentUser).subscribe(user=>{
			if(user){
				if(user.type!="employee")this.canCreateCommission$.next(false);
			}
		});

		const loginSubscriptions = this.store.select(currentUser).subscribe(user=>{
			if(user !=undefined){
				this.loginedUser = user;
			}
		})
		this.subscriptions.push(loginSubscriptions);

		// Init DataSource
		this.dataSource = new CommissionGroupsDataSource(this.store);
		const entitiesSubscription = this.dataSource.entitySubject.pipe(
			skip(1),
			distinctUntilChanged()
		).subscribe(res => {
			this.commissionGroupsResult = res;
			if(this.commissionGroupsResult.length>0)this.selectedCommissonGroup = this.commissionGroupsResult[0];
		});
		this.subscriptions.push(entitiesSubscription);
		if(this.employeeId$){
			this.employeeId$.subscribe(res => {
				if (!res) {
					return;
				}
	
				this.employeeId = res;
				this.loadCommissionGroupsList();
			});
		}else{
			this.loadCommissionGroupsList();
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
	loadCommissionGroupsList() {
		this.selection.clear();
		const queryParams = new QueryParamsModel(
			this.filterConfiguration(),
			this.sort.direction,
			this.sort.active,
			this.paginator.pageIndex,
			this.paginator.pageSize
		);
		this.store.dispatch(new CommissionGroupsPageRequested({ page: queryParams }));
		this.selection.clear();
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
	selectRow(row){
		this.selectedCommissonGroup = row;
	}
	/**
	 * Redirect to edit page
	 *
	 * @param id
	 */
	editCommission(commission:CommissionModel) {
		let _saveMessage;
		const _messageType = commission.id > 0 ? MessageType.Update : MessageType.Create;
		if(commission.id > 0){
			_saveMessage='The commission has been updated successfully';
		}else{
			_saveMessage='New commission has been created successfully';
		}
		let config = {
			width: '68vw',
			'margin-right':'auto',
			'margin-left':'auto',
			panelClass: 'full-screen-modal',
			data:{commission}
		  };		
		const dialogRef = this.dialog.open(CommissionEditDialogComponent, config);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}

			this.layoutUtilsService.showActionNotification(_saveMessage, _messageType,500,true,false);
			this.loadCommissionGroupsList();
		});

	}
	deleteCommission(_item:CommissionModel){
		const _title: string = 'Commission';
		const _description: string = 'Are you sure to permanently delete this commission?';
		const _waitDesciption: string = 'Commission is deleting...';
		const _deleteMessage = `Commission has been deleted`;

		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}

			//this.store.dispatch(new OneCommissionGroupDeleted({ id: _item.id }));
			//this.layoutUtilsService.showActionNotification(_deleteMessage, MessageType.Delete);
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
	 * Redirect to add page
	 *
	 */
	addCommission() {
		const newCommission = new CommissionModel();
		//newCommission.clear(); // Set all defaults fields
		this.editCommission(newCommission);
	}

	/**
	 * Show Commissions 
	 */
	viewCommissionGroup(id:number) {
	}	
}
