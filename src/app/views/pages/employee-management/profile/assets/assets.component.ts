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
	ProposalModel, 
	CompanyModel,
	selectProposalsActionLoading,
	ProposalOnServerUpdated,
	ProposalService,
} from '../../../../../core/humanresource';
import {
    AssetAssignService,AssetAssignModel
} from '../../../../../core/asset';

@Component({
	// tslint:disable-next-line:component-selector
	selector: 'kt-employee-assets',
	templateUrl: './assets.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
	encapsulation: ViewEncapsulation.None
})
export class AssetsUserProfileComponent implements OnInit, OnDestroy {
	// Public properties
	viewLoading: boolean = false;
	assets:AssetAssignModel[] = [];
	menus$: Observable<any>;
	// Private properties
	private componentSubscriptions: Subscription[]=[];

	/**
	 * Component constructor
	 *
	 * @param fb: FormBuilder
	 * @param store: Store<AppState>
	 * @param typesUtilsService: TypesUtilsService
	 */
	constructor(
		private assetAssignService:AssetAssignService,
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
		//this.store.pipe(select(selectProposalsActionLoading)).subscribe(res => this.viewLoading = res);
		let menus = {
			slug:'assets',
		}
		this.menus$ = of(menus);
		this.viewLoading = true;
		this.assetAssignService.assignLoginUser().pipe().subscribe(
			res=>{
				this.assets = res;
				this.viewLoading = false;
				this.cdr.detectChanges();
			}
		)
	}
	/**
	 * On destroy
	 */
	ngOnDestroy() {
		this.componentSubscriptions.forEach(el => el.unsubscribe());
	}


	/** Alect Close event */
	onAlertClose($event) {
	}	
}