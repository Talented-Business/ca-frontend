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
import { UserLoaded } from '../../../../../../core/auth/_actions/auth.actions';
import { currentUser } from '../../../../../../core/auth/_selectors/auth.selectors';

import { environment } from '../../../../../../../environments/environment';
// Components
import { HoursEditDialogComponent } from '../edit/hours-edit.dialog.component';
import { CompanyModel, CompanyService,DepartmentModel } from '../../../../../../core/humanresource';
import { ImagePopupComponent } from '../../../employees/recruit/image-modal/image-popup.component';

// Table with EDIT item in MODAL
// ARTICLE for table with sort/filter/paginator
// https://blog.angular-university.io/angular-material-data-table/
// https://v5.material.angular.io/components/table/overview
// https://v5.material.angular.io/components/sort/overview
// https://v5.material.angular.io/components/table/overview#sorting
// https://www.youtube.com/watch?v=NSt9CI3BXv4
@Component({
	selector: 'kt-hours-list',
	templateUrl: './hours-list.component.html',
	styleUrls:['./hours-list.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class HoursListComponent implements OnInit, OnDestroy {
	// Table fields
	// Incoming data
	company:CompanyModel;
	hostingUrl:string;

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
		public dialog: MatDialog,
		private store: Store<AppState>,
		private layoutUtilsService: LayoutUtilsService,
		private companyService:CompanyService,
		private cdr: ChangeDetectorRef
	) {

		this.hostingUrl = environment.host_url;		
	}

	/**
	 * @ Lifecycle sequences => https://angular.io/guide/lifecycle-hooks
	 */

	/**
	 * On init
	 */
	ngOnInit() {
		this.store.pipe(
			select(currentUser),
		).subscribe(user=>{
			if(user){
				this.company = user.company;
				console.log(this.company.departments.length);
				this.cdr.detectChanges();
			}
		});		

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
	editHours(department:DepartmentModel) {
		let _saveMessage;
		const _messageType = MessageType.Update;
		_saveMessage='The Hours has been updated successfully';
		let config = {
			width: '68vw',
			'margin-right':'auto',
			'margin-left':'auto',
			panelClass: 'full-screen-modal',
			data:{company_id:this.company.id,department_id:department.id}
		  };		
		const dialogRef = this.dialog.open(HoursEditDialogComponent, config);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}
			this.store.dispatch(new UserLoaded({ user: res.user }));
			this.cdr.detectChanges();
			this.layoutUtilsService.showActionNotification(_saveMessage, _messageType, 10000, true, true);
		});
	}
	deleteHours(department:DepartmentModel){
		if(confirm("Are you sure to delete this Hours?")){
			this.companyService.deleteHours(this.company.id,department.id).pipe().subscribe(
				res=>{
					this.store.dispatch(new UserLoaded({ user: res.user }));
					this.cdr.detectChanges();
					const message = `The Hours has been deleted successfully`;
					this.layoutUtilsService.showActionNotification(message, MessageType.Update, 10000, true, true);		
				}
			);
		}
	}
	openImage(path:number){
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
