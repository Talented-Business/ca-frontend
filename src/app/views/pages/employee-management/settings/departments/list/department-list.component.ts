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
    DepartmentModel,
    DepartmentsDataSource, AllDepartmentsRequested,
	DepartmentService,DepartmentListingChanged,
} from '../../../../../../core/humanresource';
// Components
import { DepartmentEditDialogComponent } from '../edit/department-edit.dialog.component';


// Table with EDIT item in MODAL
// ARTICLE for table with sort/filter/paginator
// https://blog.angular-university.io/angular-material-data-table/
// https://v5.material.angular.io/components/table/overview
// https://v5.material.angular.io/components/sort/overview
// https://v5.material.angular.io/components/table/overview#sorting
// https://www.youtube.com/watch?v=NSt9CI3BXv4
@Component({
	selector: 'kt-department-list',
	templateUrl: './department-list.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class DepartmentListComponent implements OnInit, OnDestroy {
	// Table fields
	// Incoming data
	dataSource: DepartmentsDataSource;
	displayedColumns = ['name', 'status','actions'];
	// Selection
	selection = new SelectionModel<DepartmentModel>(true, []);
	departmentsResult: DepartmentModel[] = [];
	departmentTotal:number;

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
		private departmentService:DepartmentService
	) {}

	/**
	 * @ Lifecycle sequences => https://angular.io/guide/lifecycle-hooks
	 */

	/**
	 * On init
	 */
	ngOnInit() {

		// Init DataSource
		this.dataSource = new DepartmentsDataSource(this.store);
		const entitiesSubscription = this.dataSource.entitySubject.pipe(
			skip(1),
			distinctUntilChanged()
		).subscribe(res => {
			this.departmentsResult = res;
			this.departmentTotal = this.departmentsResult.length;
		});
		this.subscriptions.push(entitiesSubscription);

		// First Load
		of(undefined).pipe(take(1), delay(1000)).subscribe(() => { // Remove this line, just loading imitation
			//this.loadDepartmentsList();
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
	loadDepartmentsList() {
		this.store.dispatch(new AllDepartmentsRequested());
	}
	/**
	 * Redirect to edit page
	 *
	 * @param id
	 */
	editDepartment(department:DepartmentModel) {
		let _saveMessage;
		const _messageType = department.id > 0 ? MessageType.Update : MessageType.Create;
		if(department.id > 0){
			_saveMessage='The department has been updated successfully';
		}else{
			_saveMessage='New department has been created successfully';
		}
		let config = {
			data:{department}
		  };		
		const dialogRef = this.dialog.open(DepartmentEditDialogComponent, config);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}

			this.layoutUtilsService.showActionNotification(_saveMessage, _messageType,500,true,false);
			this.loadDepartmentsList();
		});

	}
	toggleStatus(department:DepartmentModel){
		if(department.status){
			if(confirm('Do you confirm to terminate the department?')==false)return;
		}
		this.store.dispatch(new DepartmentListingChanged());
		this.departmentService.toggleStatus(department.id).pipe(
		).subscribe(res=>{
			this.store.dispatch(new AllDepartmentsRequested());
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
	addDepartment() {
		const newDepartment = new DepartmentModel();
		newDepartment.clear(); // Set all defaults fields
		this.editDepartment(newDepartment);
	}

}
