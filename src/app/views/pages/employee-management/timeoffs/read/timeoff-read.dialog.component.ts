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
	TimeoffModel, 
	CompanyModel,
	selectTimeoffsActionLoading,
	TimeoffOnServerUpdated,
	TimeoffService,
} from '../../../../../core/humanresource';
@Component({
	// tslint:disable-next-line:component-selector
	selector: 'kt-timeoff-read-dialog',
	templateUrl: './timeoff-read.dialog.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
	encapsulation: ViewEncapsulation.None
})
export class TimeoffReadDialogComponent implements OnInit, OnDestroy {
	// Public properties
	timeoff: TimeoffModel;
	viewLoading: boolean = false;
	statuses:any;

	// Private properties
	private componentSubscriptions: Subscription[]=[];
	private company_id:number;

	/**
	 * Component constructor
	 *
	 * @param dialogRef: MatDialogRef<TimeoffReadDialogComponent>
	 * @param fb: FormBuilder
	 * @param store: Store<AppState>
	 * @param typesUtilsService: TypesUtilsService
	 */
	constructor(
		@Inject(MAT_DIALOG_DATA) public data: any,
		public dialogRef:MatDialogRef<TimeoffReadDialogComponent>,
		private store: Store<AppState>,
		private timeoffService:TimeoffService,
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
		this.store.pipe(select(selectTimeoffsActionLoading)).subscribe(res => this.viewLoading = res);
		this.timeoff = this.data.timeoff;
	}
	/**
	 * On destroy
	 */
	ngOnDestroy() {
		this.componentSubscriptions.forEach(el => el.unsubscribe());
	}

	/**
	 * Returns page title
	 */
	getTitle(): string {
		return this.timeoff.employee.first_name + ' ' + this.timeoff.employee.last_name;
	}
	

	/**
	 *  approve
	 *
	 */
	updateStatus(status:string) {
		let timeoff:TimeoffModel = new TimeoffModel;
		timeoff.id = this.timeoff.id;
		timeoff.status = status;
		this.timeoffService.updateTimeoff(timeoff).pipe().subscribe();
		this.dialogRef.close(status);
	}

	/** Alect Close event */
	onAlertClose($event) {
	}
}