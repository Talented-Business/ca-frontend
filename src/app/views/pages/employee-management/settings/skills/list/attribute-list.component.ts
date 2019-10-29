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
import { AppState } from '../../../../../../core/reducers';

// Services
import { LayoutUtilsService, MessageType, QueryParamsModel } from '../../../../../../core/_base/crud';
// Models
import {
    AttributeModel,
    AttributesDataSource, AllAttributesRequested,
	AttributeService,AttributeListingChanged,
} from '../../../../../../core/humanresource';
// Components
import { AttributeEditDialogComponent } from '../edit/attribute-edit.dialog.component';


// Table with EDIT item in MODAL
// ARTICLE for table with sort/filter/paginator
// https://blog.angular-university.io/angular-material-data-table/
// https://v5.material.angular.io/components/table/overview
// https://v5.material.angular.io/components/sort/overview
// https://v5.material.angular.io/components/table/overview#sorting
// https://www.youtube.com/watch?v=NSt9CI3BXv4
@Component({
	selector: 'kt-attribute-list',
	templateUrl: './attribute-list.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class AttributeListComponent implements OnInit, OnDestroy {
	// Table fields
	// Incoming data
	dataSource: AttributesDataSource;
	displayedColumns = ['name', 'status','actions'];
	// Selection
	selection = new SelectionModel<AttributeModel>(true, []);
	attributesResult: AttributeModel[] = [];
	attributeTotal:number;

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
		private attributeService:AttributeService
	) {}

	/**
	 * @ Lifecycle sequences => https://angular.io/guide/lifecycle-hooks
	 */

	/**
	 * On init
	 */
	ngOnInit() {

		// Init DataSource
		this.dataSource = new AttributesDataSource(this.store);
		const entitiesSubscription = this.dataSource.entitySubject.pipe(
			skip(1),
			distinctUntilChanged()
		).subscribe(res => {
			this.attributesResult = res;
			this.attributeTotal = this.attributesResult.length;
		});
		this.subscriptions.push(entitiesSubscription);

		// First Load
		of(undefined).pipe(take(1), delay(1000)).subscribe(() => { // Remove this line, just loading imitation
			this.loadAttributesList();
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
	loadAttributesList() {
		this.store.dispatch(new AllAttributesRequested());
	}
	/**
	 * Redirect to edit page
	 *
	 * @param id
	 */
	editAttribute(attribute:AttributeModel) {
		let _saveMessage;
		const _messageType = attribute.id > 0 ? MessageType.Update : MessageType.Create;
		if(attribute.id > 0){
			_saveMessage='The attribute has been updated successfully';
		}else{
			_saveMessage='New attribute has been created successfully';
		}
		let config = {
			data:{attribute}
		  };		
		const dialogRef = this.dialog.open(AttributeEditDialogComponent, config);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}

			this.layoutUtilsService.showActionNotification(_saveMessage, _messageType,500,true,false);
			this.loadAttributesList();
		});

	}
	toggleStatus(attribute:AttributeModel){
		if(attribute.status){
			if(confirm('Do you confirm to terminate the attribute?')==false)return;
		}
		this.store.dispatch(new AttributeListingChanged());
		this.attributeService.toggleStatus(attribute.id).pipe(
		).subscribe(res=>{
			this.store.dispatch(new AllAttributesRequested());
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
	addAttribute() {
		const newAttribute = new AttributeModel();
		newAttribute.clear(); // Set all defaults fields
		this.editAttribute(newAttribute);
	}

}
