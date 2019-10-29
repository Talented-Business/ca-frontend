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

import { environment } from '../../../../../../../environments/environment';
// Components
import { DocumentEditDialogComponent } from '../edit/document-edit.dialog.component';
import { EmployeeModel, EmployeesService } from '../../../../../../core/humanresource';
import { ImagePopupComponent } from '../../recruit/image-modal/image-popup.component';

// Table with EDIT item in MODAL
// ARTICLE for table with sort/filter/paginator
// https://blog.angular-university.io/angular-material-data-table/
// https://v5.material.angular.io/components/table/overview
// https://v5.material.angular.io/components/sort/overview
// https://v5.material.angular.io/components/table/overview#sorting
// https://www.youtube.com/watch?v=NSt9CI3BXv4
@Component({
	selector: 'kt-document-list',
	templateUrl: './document-list.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class DocumentListComponent implements OnInit, OnDestroy {
	// Table fields
	// Incoming data
	@Input() employee$: Observable<EmployeeModel>;
	employee:EmployeeModel;

	// Subscriptions
	private subscriptions: Subscription[] = [];
	private hostingUrl:string;
	/**
	 *
	 * @param activatedRoute: ActivatedRoute
	 * @param store: Store<AppState>
	 * @param router: Router
	 * @param layoutUtilsService: LayoutUtilsService
	 * @param subheaderService: SubheaderService
	 */
	constructor(
		public dialog: MatDialog,
		private employeesService:EmployeesService,
		private cdr: ChangeDetectorRef
	) {}

	/**
	 * @ Lifecycle sequences => https://angular.io/guide/lifecycle-hooks
	 */

	/**
	 * On init
	 */
	ngOnInit() {

		this.employee$.subscribe(res => {
			if (!res) {
				return;
			}

			this.employee = res;
		});
		this.hostingUrl = environment.host_url;		
	}

	/**
	 * On Destroy
	 */
	ngOnDestroy() {
		this.subscriptions.forEach(el => el.unsubscribe());
	}

	/**
	 * Redirect to edit page
	 *
	 * @param id
	 */
	editDocument(document:any) {
		let _saveMessage;
		const _messageType = MessageType.Update;
		_saveMessage='The contract has been updated successfully';
		let config = {
			width: '68vw',
			'margin-right':'auto',
			'margin-left':'auto',
			panelClass: 'full-screen-modal',
			data:{document}
		  };		
		const dialogRef = this.dialog.open(DocumentEditDialogComponent, config);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}
			this.employee.documents = res;
			this.cdr.detectChanges();
		});
	}
	deleteDocument(document:any){
		if(confirm("Are you sure to delete this document?")){
			this.employeesService.deleteDocument(document.id).pipe().subscribe(
				res=>{
					if(res.status==1)this.employee.documents = res.documents;
					this.cdr.detectChanges();
				}
			);
		}
	}
	add(){
		let document:any = {};
		document.member_id = this.employee.id;
		this.editDocument(document);
	}
	openImage(path:string){
		let url:string = this.hostingUrl + 'storage/' + path;
		let config = {
			height: 'auto',
			width: 'auto',
			hasBackdrop:true,
			backdropClass:'modal-black-background',
			'margin-right':'auto',
			'margin-left':'auto',
			panelClass: 'full-screen-modal',
			data:{image:url}
		  };		
		const dialogRef = this.dialog.open(ImagePopupComponent, config);
	}
	checkImage(url:string){
		return(url && url.match(/\.(jpeg|jpg|gif|png)$/) != null);
	}
}
