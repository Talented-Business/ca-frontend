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
    AssetAssignModel,AssetModel,
    AssetAssignsDataSource, AssetAssignsPageRequested,
	AssetAssignService,selectAssetAssignsInStore,
	AssetAssignOnServerDeleted,
} from '../../../../../core/asset';
// Components
import { AssetAssignEditDialogComponent } from '../edit/assign-edit.dialog.component';


// Table with EDIT item in MODAL
// ARTICLE for table with sort/filter/paginator
// https://blog.angular-university.io/angular-material-data-table/
// https://v5.material.angular.io/components/table/overview
// https://v5.material.angular.io/components/sort/overview
// https://v5.material.angular.io/components/table/overview#sorting
// https://www.youtube.com/watch?v=NSt9CI3BXv4
@Component({
	selector: 'kt-asset-assign-list',
	templateUrl: './assign-list.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class AssetAssignListComponent implements OnInit, OnDestroy {
	// Table fields
	// Incoming data
	@Input() asset$: Observable<AssetModel>;
	asset: any=false;
	dataSource: AssetAssignsDataSource;
	displayedColumns = ['employee','start_date','end_date','comment','actions'];
	@ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
	@ViewChild('sort1', {static: true}) sort: MatSort;
	// Selection
	selection = new SelectionModel<AssetAssignModel>(true, []);
	assetAssignsResult: AssetAssignModel[] = [];
	assetStatus:String = 'Pending';

	// Subscriptions
	private subscriptions: Subscription[] = [];
	private assetAssignTotal:number;

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
		private assetAssignService:AssetAssignService,
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
				this.loadAssetAssignsList();
			})
		)
		.subscribe();
		this.subscriptions.push(paginatorSubscriptions);



		// Init DataSource
		this.dataSource = new AssetAssignsDataSource(this.store);
		const entitiesSubscription = this.dataSource.entitySubject.pipe(
			skip(1),
			distinctUntilChanged()
		).subscribe(res => {
			this.assetAssignsResult = res;
		});
		this.subscriptions.push(entitiesSubscription);

		this.loadAssetObservable();
	}
	loadAssetObservable(){
		if(this.asset$==undefined){
			console.log('asset$')
			setTimeout(()=>{
				this.loadAssetObservable();
			},1000);
		}else{
			this.asset$.subscribe(res => {
				if (!res) {
					return;
				}
				this.asset = res;
				this.assetStatus = this.asset.status;
				this.loadAssetAssignsList();
			});
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
	loadAssetAssignsList() {
		this.selection.clear();
		const queryParams = new QueryParamsModel(
			this.filterConfiguration(),
			this.sort.direction,
			this.sort.active,
			this.paginator.pageIndex,
			this.paginator.pageSize
		);
		this.store.dispatch(new AssetAssignsPageRequested({ page: queryParams }));
		this.selection.clear();
	}

	/** FILTRATION */
	filterConfiguration(): any {
		const filter: any = {};
		if(this.asset)filter.asset_id = this.asset.id;
		return filter;
	}
	assign(){
		let assetAssign = new AssetAssignModel;
		assetAssign.start_date = new Date();
		assetAssign.end_date = new Date();
		assetAssign.asset_id = this.asset.id;
		this.editAssetAssign(assetAssign);
	}
	unassign(){
		if(confirm('Are you sure to unassign this asset?')){
			this.assetAssignService.unassign(this.asset.id).pipe().subscribe(
				res=>{
					this.loadAssetAssignsList();
					if(this.assetStatus=="Pending")this.assetStatus="Assigned";
					else this.assetStatus="Pending";
				}
			);
		}
	}
	/**
	 * Redirect to edit page
	 *
	 * @param id
	 */
	editAssetAssign(assetAssign:AssetAssignModel) {
		let _saveMessage;
		const _messageType = assetAssign.id > 0 ? MessageType.Update : MessageType.Create;
		if(assetAssign.id > 0){
			_saveMessage='The assetAssign has been updated successfully';
		}else{
			_saveMessage='New assetAssign has been created successfully';
		}
		let config = {
			width: '68vw',
			'margin-right':'auto',
			'margin-left':'auto',
			panelClass: 'full-screen-modal',
			data:{assetAssign}
		  };		
		const dialogRef = this.dialog.open(AssetAssignEditDialogComponent, config);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}

			this.layoutUtilsService.showActionNotification(_saveMessage, _messageType,500,true,false);
			this.loadAssetAssignsList();
			if(assetAssign.id ==undefined){
				if(this.assetStatus=="Pending")this.assetStatus="Assigned";
				else this.assetStatus="Pending";
			}
		});

	}
	deleteAssetAssign(_item:AssetAssignModel){
		const _title: string = 'Product AssetAssign';
		const _description: string = 'Are you sure to permanently delete this assetAssign?';
		const _waitDesciption: string = 'AssetAssign is deleting...';
		const _deleteMessage = `AssetAssign has been deleted`;

		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}

			this.store.dispatch(new AssetAssignOnServerDeleted({ id: _item.id }));
			this.layoutUtilsService.showActionNotification(_deleteMessage, MessageType.Delete);
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
	addAssetAssign() {
		const newAssetAssign = new AssetAssignModel();
		newAssetAssign.clear(); // Set all defaults fields
		this.editAssetAssign(newAssetAssign);
	}

	/**
	 * Show recruit 
	 * @param recruit: EmployeeModel
	 */
	viewAssetAssign(id:number) {
		const queryParams = new QueryParamsModel(
			this.filterConfiguration(),
			this.sort.direction,
			this.sort.active,
			this.paginator.pageIndex,
			this.paginator.pageSize
		);
		localStorage.setItem('assetAssignsPageStatus',  JSON.stringify(queryParams));
		this.router.navigate(['../assetAssigns/view', id], { relativeTo: this.activatedRoute });
	}	
}
