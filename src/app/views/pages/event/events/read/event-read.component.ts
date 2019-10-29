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
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';
// Services and Models
import { 
	selectEventById,
	EventModel, 
	EventService 
} from '../../../../../core/event';
import { currentUser } from '../../../../../core/auth';

import { EventEditDialogComponent } from '../edit/event-edit.dialog.component';

@Component({
	// tslint:disable-next-line:component-selector
	selector: 'kt-event-read',
	templateUrl: './event-read.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
	encapsulation: ViewEncapsulation.None
})
export class EventReadComponent implements OnInit, OnDestroy {
	// Public properties
	event: EventModel;
	eventId$: Observable<number>;
	Editor = ClassicEditor;
	loadingSubject = new BehaviorSubject<boolean>(true);
	loading$: Observable<boolean>;
	eventStatus:String;
	loginedUser:any;
	// Private properties
	private componentSubscriptions: Subscription;

	/**
	 * Component constructor
	 *
	 * @param dialogRef: MatDialogRef<EventEditDialogComponent>
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
		private eventService: EventService,
		private cdr: ChangeDetectorRef) {
	}

	/**
	 * @ Lifecycle sequences => https://angular.io/guide/lifecycle-hooks
	 */

	/**
	 * On init
	 */
	ngOnInit() {
		//this.store.pipe(select(selectEventsActionLoading)).subscribe(res => this.viewLoading = res);
		this.loading$ = this.loadingSubject.asObservable();
		this.loadingSubject.next(true);
		this.activatedRoute.params.subscribe(params => {
			const id = params['id'];
			if (id && id > 0) {

				this.store.pipe(
					select(selectEventById(id))
				).subscribe(result => {
					if (!result) {
						this.loadEventFromService(id);
						return;
					}

					this.loadEvent(result);
				});
			} else {
				const newEvent = new EventModel();
				newEvent.clear();
				this.loadEvent(newEvent);
			}
		});
		this.componentSubscriptions = this.store.select(currentUser).subscribe(user=>{
			if(user !=undefined){
				this.loginedUser = user;
			}
		})
		
	}

	/**
	 * On destroy
	 */
	ngOnDestroy() {
		if (this.componentSubscriptions) {
			this.componentSubscriptions.unsubscribe();
		}
	}


	loadEvent(_event, fromService: boolean = false) {
		if (!_event) {
			this.goBack('');
		}
		this.event = _event;
		if(_event.status)this.eventStatus = 'Active';
		else this.eventStatus = 'Inactive';//_event.status;
		this.eventId$ = of(_event.id);
		this.loadingSubject.next(false);
		if (fromService) {
			this.cdr.detectChanges();
		}
	}
	// If event didn't find in store
	loadEventFromService(eventId) {
		this.eventService.getEventById(eventId).subscribe(res => {
			this.loadEvent(res, true);
		});
	}
	/**
	 * Returns component title
	 */
	getComponentTitle():string {
		if (this.event&&this.event.id > 0) {
			return `${this.event.title}`;
		}

		return '';
	}
	/**
	 * Go back to the list
	 *
	 * @param id: any
	 */
	goBack(id) {
		this.loadingSubject.next(false);
		const url = `/events`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}
	goBackWithoutId	() {
		this.router.navigateByUrl('/events', { relativeTo: this.activatedRoute });
	}
	/** ACTIONS */

	/** Alect Close event */
	onAlertClose($event) {
	}
}