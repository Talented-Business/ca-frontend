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
	selectJobById,
	JobModel, 
	JobUpdated,
	JobService 
} from '../../../../../core/humanresource';
import { JobEditDialogComponent } from '../edit/job-edit.dialog.component';

@Component({
	// tslint:disable-next-line:component-selector
	selector: 'kt-job-read',
	templateUrl: './job-read.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
	encapsulation: ViewEncapsulation.None
})
export class JobReadComponent implements OnInit, OnDestroy {
	// Public properties
	job: JobModel;
	jobId$: Observable<number>;
	loadingSubject = new BehaviorSubject<boolean>(true);
	loading$: Observable<boolean>;
	jobStatus:String;
	// Private properties
	private componentSubscriptions: Subscription;
	private view:boolean=true;

	/**
	 * Component constructor
	 *
	 * @param dialogRef: MatDialogRef<JobEditDialogComponent>
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
		private jobService: JobService,
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
		//this.store.pipe(select(selectJobsActionLoading)).subscribe(res => this.viewLoading = res);
		this.loading$ = this.loadingSubject.asObservable();
		this.loadingSubject.next(true);
		this.activatedRoute.params.subscribe(params => {
			const id = params['id'];
			if (id && id > 0) {

				this.store.pipe(
					select(selectJobById(id))
				).subscribe(result => {
					if (!result) {
						this.loadJobFromService(id);
						return;
					}

					this.loadJob(result);
				});
			} else {
				const newJob = new JobModel();
				newJob.clear();
				this.loadJob(newJob);
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


	loadJob(_job, fromService: boolean = false) {
		if (!_job) {
			this.goBack('');
		}
		this.job = _job;
		if(_job.status)this.jobStatus = 'Active';
		else this.jobStatus = 'Inactive';//_job.status;
		this.jobId$ = of(_job.id);
		this.loadingSubject.next(false);
		if (fromService) {
			this.cdr.detectChanges();
		}
	}
	toggleView(){
		this.view = !this.view;
	}
	// If job didn't find in store
	loadJobFromService(jobId) {
		this.jobService.getJobById(jobId).subscribe(res => {
			this.loadJob(res, true);
		});
	}
	/**
	 * Returns component title
	 */
	getComponentTitle():string {
		if (this.job&&this.job.id > 0) {
			return `${this.job.title} | ${
				this.job.position
			}`;
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
		const url = `../jobs`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}
	goBackWithoutId	() {
		this.router.navigateByUrl('/employee-management/jobs', { relativeTo: this.activatedRoute });
	}
	/** ACTIONS */

	/** Alect Close event */
	onAlertClose($event) {
	}
}