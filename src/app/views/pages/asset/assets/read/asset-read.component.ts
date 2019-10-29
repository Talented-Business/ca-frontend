// Angular
import { Component, OnInit, Inject, ChangeDetectionStrategy, ViewEncapsulation, OnDestroy,ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
// Material
import { MatDialog,MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
// RxJS
import { Observable,BehaviorSubject,Subscription, of } from 'rxjs';
import { delay } from 'rxjs/operators';
// Translate Module
import { TranslateService } from '@ngx-translate/core';
// NGRX
import { Update } from '@ngrx/entity';
import { Store, select } from '@ngrx/store';
// State
import { AppState } from '../../../../../core/reducers';
// CRUD
import { LayoutUtilsService,MessageType,TypesUtilsService } from '../../../../../core/_base/crud';
// Services and Models
import { 
	selectAssetById,
	AssetModel, 
	AssetUpdated,
	AssetService,
	selectAssetAssignsInStore 
} from '../../../../../core/asset';
import { AssetEditDialogComponent } from '../edit/asset-edit.dialog.component';

@Component({
	// tslint:disable-next-line:component-selector
	selector: 'kt-asset-read',
	templateUrl: './asset-read.component.html',
	styleUrls:['./asset-read.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
	encapsulation: ViewEncapsulation.None
})
export class AssetReadComponent implements OnInit, OnDestroy {
	// Public properties
	asset: AssetModel;
	asset$: Observable<AssetModel>;
	loadingSubject = new BehaviorSubject<boolean>(true);
	loading$: Observable<boolean>;
	// Private properties
	private componentSubscriptions: Subscription;
	private assetStatus:String;
	private view:boolean=true;

	/**
	 * Component constructor
	 *
	 * @param dialogRef: MatDialogRef<AssetEditDialogComponent>
	 * @param fb: FormBuilder
	 * @param store: Store<AppState>
	 * @param typesUtilsService: TypesUtilsService
	 */
	constructor(
		private fb: FormBuilder,
		private store: Store<AppState>,
		private activatedRoute: ActivatedRoute,
		private router: Router,
		public dialog: MatDialog,
		private assetService: AssetService,
		private layoutUtilsService: LayoutUtilsService,
		private translate: TranslateService,
		private typesUtilsService: TypesUtilsService,
		private cdr: ChangeDetectorRef) {
	}

	/**
	 * @ Lifecycle sequences => https://angular.io/guide/lifecycle-hooks
	 */

	/**
	 * On init
	 */
	ngOnInit() {
		//this.store.pipe(select(selectAssetsActionLoading)).subscribe(res => this.viewLoading = res);
		this.loading$ = this.loadingSubject.asObservable();
		this.loadingSubject.next(true);
		this.activatedRoute.params.subscribe(params => {
			const id = params['id'];
			if (id && id > 0) {

				this.store.pipe(
					select(selectAssetById(id))
				).subscribe(result => {
					if (!result) {
						this.loadAssetFromService(id);
						return;
					}

					this.loadAsset(result);
				});
			} else {
				const newAsset = new AssetModel();
				newAsset.clear();
				this.loadAsset(newAsset);
			}
		});
	}

	/**
	 * On destroy
	 */
	ngOnDestroy() {
		if (this.componentSubscriptions) {
			this.componentSubscriptions.unsubscribe();
		}
	}


	loadAsset(_asset, fromService: boolean = false) {
		if (!_asset) {
			this.goBack('');
		}
		this.asset = _asset;
		this.assetStatus = 'Active';//_asset.status;
		this.asset$ = of(_asset);
		this.loadingSubject.next(false);
		if (fromService) {
			this.cdr.detectChanges();
		}
	}
	toggleView(){
		this.view = !this.view;
	}
	// If asset didn't find in store
	loadAssetFromService(assetId) {
		this.assetService.getAssetById(assetId).subscribe(res => {
			this.loadAsset(res, true);
		});
	}
	/**
	 * Go back to the list
	 *
	 * @param id: any
	 */
	goBack(id) {
		this.loadingSubject.next(false);
		const url = `../assets`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}
	goBackWithoutId	() {
		this.router.navigateByUrl('/asset/assets', { relativeTo: this.activatedRoute });
	}
	/** ACTIONS */

	/** Alect Close event */
	onAlertClose($event) {
	}
}