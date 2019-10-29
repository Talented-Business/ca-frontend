// Angular
import { Component, OnInit, Inject, ChangeDetectionStrategy, ViewEncapsulation, OnDestroy,ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators,FormControl } from '@angular/forms';
// Material
import { MatDialog,MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
// RxJS
import { Observable,BehaviorSubject,Subscription, of } from 'rxjs';
import { delay,startWith,map } from 'rxjs/operators';
// NGRX
import { Update } from '@ngrx/entity';
import { Store, select } from '@ngrx/store';
// State
import { AppState } from '../../../../../core/reducers';

// Services and Models
import { 
	AssetModel, 
	selectAssetsActionLoading,
	AssetOnServerCreated,
	selectLastCreatedAssetId,
	AssetOnServerUpdated,
	selectAssetsBackProcessingSuccess,
	selectAssetsBackProcessingFailed,
	AssetBackProcessFailed,
} from '../../../../../core/asset';
@Component({
	// tslint:disable-next-line:component-selector
	selector: 'kt-asset-edit',
	templateUrl: './asset-edit.dialog.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
	encapsulation: ViewEncapsulation.None
})
export class AssetEditDialogComponent implements OnInit, OnDestroy {
	// Public properties
	asset: AssetModel;
	assetForm: FormGroup;
	hasFormErrors: boolean = false;
	viewLoading: boolean = false;

	// Private properties
	private componentSubscriptions: Subscription[]=[];
	private company_id:number;

	/**
	 * Component constructor
	 *
	 * @param dialogRef: MatDialogRef<AssetEditDialogComponent>
	 * @param fb: FormBuilder
	 * @param store: Store<AppState>
	 * @param typesUtilsService: TypesUtilsService
	 */
	constructor(
		@Inject(MAT_DIALOG_DATA) public data: any,
		public dialogRef:MatDialogRef<AssetEditDialogComponent>,
		private store: Store<AppState>,
		private assetFB: FormBuilder,
		private cdr: ChangeDetectorRef
		) {
	}

	/**
	 * @ Lifecycle sequences => https://angular.io/guide/lifecycle-hooks
	 */

	/**
	 * On init
	 */
	ngOnInit() {
		this.store.pipe(select(selectAssetsActionLoading)).subscribe(res => this.viewLoading = res);
		this.asset = this.data.asset;
		this.company_id = this.data.company_id;
		const updateSuccessSubscription = this.store.pipe(
			select(selectAssetsBackProcessingSuccess),
			delay(1000), // Remove this line
		).subscribe(res => {
			if (!res) {
				return;
			}
			if(res)this.dialogRef.close({ isEdit: true });
		});
		this.componentSubscriptions.push(updateSuccessSubscription);
		const updateFailedSubscription = this.store.pipe(
			select(selectAssetsBackProcessingFailed),
			delay(1000), // Remove this line
		).subscribe(res => {
			if (!res) {
				return;
			}
			if(res){
				this.hasFormErrors=true;
				if(res.email!=undefined)this.assetForm.controls['email'].setErrors({'incorrect': true,'unique':true});
			}
			this.viewLoading = false;
			this.cdr.detectChanges();
		});
		this.componentSubscriptions.push(updateFailedSubscription);
		this.createForm();
	}
	/**
	 * On destroy
	 */
	ngOnDestroy() {
		this.store.dispatch(new AssetBackProcessFailed({ isFailed: false,errors:null }));
		this.componentSubscriptions.forEach(el => el.unsubscribe());
	}

	/**
	 * Returns page title
	 */
	getTitle(): string {
		if (this.asset.id > 0) {
			return `Edit asset '${this.asset.name}'`;
		}

		return 'New asset';
	}
	
	/**
	 * Create form
	 */
	createForm() {
		this.assetForm = this.assetFB.group({
			name: [this.asset.name, Validators.required],
			imei: [this.asset.imei, [Validators.required]],
			sold:[this.asset.status=="Sold"],
		});
	}

	/**
	 * Save data
	 *
	 */
	onSubmit() {
		this.hasFormErrors = false;
		const controls = this.assetForm.controls;
		/** check form */
		if (this.assetForm.invalid) {
			Object.keys(controls).forEach(controlName =>
				controls[controlName].markAsTouched()
			);

			this.hasFormErrors = true;
			return;
		}
		// tslint:disable-next-line:prefer-const
		let editedAsset = this.prepareAsset();
		if (editedAsset.id >0) {
			this.updateAsset(editedAsset);
		} else {
			this.createAsset(editedAsset);
		}

		this.dialogRef.close(editedAsset);
	}

	/**
	 * Returns object for saving
	 */
	prepareAsset(): AssetModel {
		const controls = this.assetForm.controls;
		const _asset = new AssetModel();
		_asset.id = this.asset.id;
		_asset.name = controls['name'].value;
		_asset.imei = controls['imei'].value;
		if(this.asset.status)_asset.status = this.asset.status;
		if(controls['sold'].value){ 
			_asset.status = 'Sold';
		}
		else if (this.asset.status == 'Sold')_asset.status = 'Pending';
		return _asset;
	}

	/**
	 * Update asset
	 *
	 * @param _asset: AssetModel
	 */
	updateAsset(_asset: AssetModel) {
		const updateAsset: Update<AssetModel> = {
			id: _asset.id,
			changes: _asset
		};
		this.store.dispatch(new AssetOnServerUpdated({
			partialAsset: updateAsset,
			asset: _asset
		}));

		// Uncomment this line
		// this.dialogRef.close({ _asset, isEdit: true }
	}
	/**
	 * Checking control validation
	 *
	 * @param controlName: string => Equals to formControlName
	 * @param validationType: string => Equals to valitors name
	 */
	isControlHasError(controlName: string, validationType: string): boolean {
		const control = this.assetForm.controls[controlName];
		if (!control) {
			return false;
		}
		const result = control.hasError(validationType) && (control.dirty || control.touched);
		return result;
	}
	onSelectionChanged($event){
		console.log($event);
	}
	/**
	 * Create asset
	 *
	 * @param _asset: AssetModel
	 */
	createAsset(_asset: AssetModel) {
		this.store.dispatch(new AssetOnServerCreated({ asset: _asset }));
		const createSubscription = this.store.pipe(
			select(selectLastCreatedAssetId),
			delay(1000), // Remove this line
		).subscribe(res => {
			if (!res) {
				return;
			}
		});
		this.componentSubscriptions.push(createSubscription);
	}

	/** Alect Close event */
	onAlertClose($event) {
	}
}