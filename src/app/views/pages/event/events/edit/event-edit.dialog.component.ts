// Angular
import { Component, OnInit, Inject, ChangeDetectionStrategy, ViewEncapsulation, OnDestroy,ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators,FormControl } from '@angular/forms';
// Material
import { MatDialog,MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';
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
	EventModel, 
	selectEventsActionLoading,
	EventOnServerCreated,
	selectLastCreatedEventId,
	EventOnServerUpdated,
	selectEventsBackProcessingSuccess,
	selectEventsBackProcessingFailed,
	EventBackProcessFailed,
} from '../../../../../core/event';
@Component({
	// tslint:disable-next-line:component-selector
	selector: 'kt-event-edit',
	templateUrl: './event-edit.dialog.component.html',
	styleUrls:['./event-edit.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
	encapsulation: ViewEncapsulation.None
})
export class EventEditDialogComponent implements OnInit, OnDestroy {
	// Public properties
	event: EventModel;
	eventForm: FormGroup;
	Editor = ClassicEditor;
	hasFormErrors: boolean = false;
	viewLoading: boolean = false;

	// Private properties
	private componentSubscriptions: Subscription[]=[];
	private company_id:number;

	/**
	 * Component constructor
	 *
	 * @param dialogRef: MatDialogRef<EventEditDialogComponent>
	 * @param fb: FormBuilder
	 * @param store: Store<AppState>
	 * @param typesUtilsService: TypesUtilsService
	 */
	constructor(
		@Inject(MAT_DIALOG_DATA) public data: any,
		public dialogRef:MatDialogRef<EventEditDialogComponent>,
		private store: Store<AppState>,
		private eventFB: FormBuilder,
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
		this.store.pipe(select(selectEventsActionLoading)).subscribe(res => this.viewLoading = res);
		this.event = this.data.event;
		const updateSuccessSubscription = this.store.pipe(
			select(selectEventsBackProcessingSuccess),
			delay(1000), // Remove this line
		).subscribe(res => {
			if (!res) {
				return;
			}
			if(res)this.dialogRef.close({ isEdit: true });
		});
		this.componentSubscriptions.push(updateSuccessSubscription);
		const updateFailedSubscription = this.store.pipe(
			select(selectEventsBackProcessingFailed),
			delay(1000), // Remove this line
		).subscribe(res => {
			if (!res) {
				return;
			}
			if(res){
				this.hasFormErrors=true;
				if(res.email!=undefined)this.eventForm.controls['email'].setErrors({'incorrect': true,'unique':true});
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
		this.store.dispatch(new EventBackProcessFailed({ isFailed: false,errors:null }));
		this.componentSubscriptions.forEach(el => el.unsubscribe());
	}

	/**
	 * Returns page title
	 */
	getTitle(): string {
		if (this.event.id > 0) {
			return `Edit news '${this.event.title}'`;
		}

		return 'New news';
	}
	
	/**
	 * Create form
	 */
	createForm() {
		this.eventForm = this.eventFB.group({
			title: [this.event.title, Validators.required],
			description: [this.event.description, Validators.required],
			status: [this.event.status, Validators.required],
		});
	}

	/**
	 * Save data
	 *
	 */
	onSubmit() {
		this.hasFormErrors = false;
		const controls = this.eventForm.controls;
		/** check form */
		if (this.eventForm.invalid) {
			Object.keys(controls).forEach(controlName =>
				controls[controlName].markAsTouched()
			);

			this.hasFormErrors = true;
			return;
		}
		// tslint:disable-next-line:prefer-const
		let editedEvent = this.prepareEvent();
		if (editedEvent.id >0) {
			this.updateEvent(editedEvent);
		} else {
			this.createEvent(editedEvent);
		}

		this.dialogRef.close(editedEvent);
	}

	/**
	 * Returns object for saving
	 */
	prepareEvent(): EventModel {
		const controls = this.eventForm.controls;
		const _event = new EventModel();
		_event.id = this.event.id;
		_event.title = controls['title'].value;
		_event.description = controls['description'].value;
		_event.status = controls['status'].value;
		return _event;
	}

	/**
	 * Update event
	 *
	 * @param _event: EventModel
	 */
	updateEvent(_event: EventModel) {
		const updateEvent: Update<EventModel> = {
			id: _event.id,
			changes: _event
		};
		this.store.dispatch(new EventOnServerUpdated({
			partialEvent: updateEvent,
			event: _event
		}));

		// Uncomment this line
		// this.dialogRef.close({ _event, isEdit: true }
	}
	/**
	 * Checking control validation
	 *
	 * @param controlName: string => Equals to formControlName
	 * @param validationType: string => Equals to valitors name
	 */
	isControlHasError(controlName: string, validationType: string): boolean {
		const control = this.eventForm.controls[controlName];
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
	 * Create event
	 *
	 * @param _event: EventModel
	 */
	createEvent(_event: EventModel) {
		this.store.dispatch(new EventOnServerCreated({ event: _event }));
		const createSubscription = this.store.pipe(
			select(selectLastCreatedEventId),
			delay(1000), // Remove this line
		).subscribe(res => {
			if (!res) {
				return;
			}
			/*if(res.status == 0){
				var response = res;
				if(response.errors.email!=undefined)this.eventForm.controls['email'].setErrors({'incorrect': true,'unique':true});
			}else if(res.status ==1){
				this.dialogRef.close({ _event, isEdit: false });
			}*/
		});
		this.componentSubscriptions.push(createSubscription);
	}

	/** Alect Close event */
	onAlertClose($event) {
	}
}