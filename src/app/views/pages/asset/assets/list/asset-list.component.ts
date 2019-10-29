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
    AssetModel,
    AssetsDataSource, AssetsPageRequested,
	AssetService,selectAssetsInStore,
	AssetOnServerDeleted,
} from '../../../../../core/asset';
// Components
import { AssetEditDialogComponent } from '../edit/asset-edit.dialog.component';


// Table with EDIT item in MODAL
// ARTICLE for table with sort/filter/paginator
// https://blog.angular-university.io/angular-material-data-table/
// https://v5.material.angular.io/components/table/overview
// https://v5.material.angular.io/components/sort/overview
// https://v5.material.angular.io/components/table/overview#sorting
// https://www.youtube.com/watch?v=NSt9CI3BXv4
@Component({
	selector: 'kt-asset-list',
	templateUrl: './asset-list.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class AssetListComponent implements OnInit, OnDestroy {
	// Table fields
	// Incoming data
	dataSource: AssetsDataSource;
	displayedColumns = ['name', 'imei', 'employee','start_date','end_date','status', 'actions'];
	@ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
	@ViewChild('sort1', {static: true}) sort: MatSort;
	@ViewChild('searchInput', {static: true}) searchInput: ElementRef;
	@ViewChild('status', {static: true}) status: ElementRef;
	// Selection
	selection = new SelectionModel<AssetModel>(true, []);
	assetsResult: AssetModel[] = [];
	assetTotal:number;

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
		private assetService:AssetService
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
				this.loadAssetsList();
			})
		)
		.subscribe();
		this.subscriptions.push(paginatorSubscriptions);



		// Init DataSource
		this.dataSource = new AssetsDataSource(this.store);
		const entitiesSubscription = this.dataSource.entitySubject.pipe(
			skip(1),
			distinctUntilChanged()
		).subscribe(res => {
			this.assetsResult = res;
		});
		this.subscriptions.push(entitiesSubscription);
		this.store.pipe(
			select(selectAssetsInStore),
		).subscribe((response: any) => {
			this.assetTotal = response.total;
		});

        // status changed
		const statusSubscription = fromEvent(this.status.nativeElement, 'change').pipe(
			// tslint:disable-next-line:max-line-length
			debounceTime(50), // The user can type quite quickly in the input box, and that could trigger a lot of server requests. With this operator, we are limiting the amount of server requests emitted to a maximum of one every 150ms
			tap(() => {
				this.paginator.pageIndex = 0;
				this.loadAssetsList();
			})
		)
		.subscribe();
		this.subscriptions.push(statusSubscription);
		// Filtration, bind to searchInput
		const searchSubscription = fromEvent(this.searchInput.nativeElement, 'keyup').pipe(
			// tslint:disable-next-line:max-line-length
			debounceTime(50), // The user can type quite quickly in the input box, and that could trigger a lot of server requests. With this operator, we are limiting the amount of server requests emitted to a maximum of one every 150ms
			distinctUntilChanged(), // This operator will eliminate duplicate values
			tap(() => {
				this.paginator.pageIndex = 0;
				this.loadAssetsList();
			})
		)
		.subscribe();
        this.subscriptions.push(searchSubscription);

		// First Load
		of(undefined).pipe(take(1), delay(1000)).subscribe(() => { // Remove this line, just loading imitation
			this.loadAssetsList();
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
	loadAssetsList() {
		this.selection.clear();
		const queryParams = new QueryParamsModel(
			this.filterConfiguration(),
			this.sort.direction,
			this.sort.active,
			this.paginator.pageIndex,
			this.paginator.pageSize
		);
		this.store.dispatch(new AssetsPageRequested({ page: queryParams }));
		this.selection.clear();
	}

	/** FILTRATION */
	filterConfiguration(): any {
		const filter: any = {};
		const searchText: string = this.searchInput.nativeElement.value;


		if (searchText) {
            filter.name = searchText;
            filter.imei = searchText;
        }
		filter.status = this.status.nativeElement.value;

		return filter;
	}
	/**
	 * Redirect to edit page
	 *
	 * @param id
	 */
	editAsset(asset:AssetModel) {
		let _saveMessage;
		const _messageType = asset.id > 0 ? MessageType.Update : MessageType.Create;
		if(asset.id > 0){
			_saveMessage='The asset has been updated successfully';
		}else{
			_saveMessage='New asset has been created successfully';
		}
		let config = {
			width: '68vw',
			'margin-right':'auto',
			'margin-left':'auto',
			panelClass: 'full-screen-modal',
			data:{asset}
		  };		
		const dialogRef = this.dialog.open(AssetEditDialogComponent, config);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}

			this.layoutUtilsService.showActionNotification(_saveMessage, _messageType,500,true,false);
			this.loadAssetsList();
		});

	}
	deleteAsset(_item:AssetModel){
		const _title: string = 'Product Asset';
		const _description: string = 'Are you sure to permanently delete this asset?';
		const _waitDesciption: string = 'Asset is deleting...';
		const _deleteMessage = `Asset has been deleted`;

		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}

			this.store.dispatch(new AssetOnServerDeleted({ id: _item.id }));
			this.layoutUtilsService.showActionNotification(_deleteMessage, MessageType.Delete);
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
			case 'Pending':
				return 'primary';
			case 'Assigned':
				return 'success';
		}
		return '';
	}

	/**
	 * Redirect to add page
	 *
	 */
	addAsset() {
		const newAsset = new AssetModel();
		newAsset.clear(); // Set all defaults fields
		this.editAsset(newAsset);
	}

	/**
	 * Show recruit 
	 * @param recruit: EmployeeModel
	 */
	viewAsset(id:number) {
		const queryParams = new QueryParamsModel(
			this.filterConfiguration(),
			this.sort.direction,
			this.sort.active,
			this.paginator.pageIndex,
			this.paginator.pageSize
		);
		localStorage.setItem('assetsPageStatus',  JSON.stringify(queryParams));
		this.router.navigate(['../assets/view', id], { relativeTo: this.activatedRoute });
	}	
}
