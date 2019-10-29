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
	ConfigService, 
} from '../../../../../core/humanresource';

@Component({
	// tslint:disable-next-line:component-selector
	selector: 'kt-setting-edit',
	templateUrl: './setting-edit.dialog.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
	encapsulation: ViewEncapsulation.None
})
export class SettingEditDialogComponent implements OnInit, OnDestroy {
	// Public properties
	configForm: FormGroup;
	config:any;
	hasFormErrors: boolean = false;
	viewLoading: boolean = false;
	total:number=10;

	// Private properties
	private componentSubscriptions: Subscription[]=[];
	private company_id:number;

	/**
	 * Component constructor
	 *
	 * @param dialogRef: MatDialogRef<SettingEditDialogComponent>
	 * @param fb: FormBuilder
	 * @param store: Store<AppState>
	 * @param typesUtilsService: TypesUtilsService
	 */
	constructor(
		@Inject(MAT_DIALOG_DATA) public data: any,
		public dialogRef:MatDialogRef<SettingEditDialogComponent>,
		private configFB: FormBuilder,
		private configService:ConfigService,
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
		//this.store.pipe(select(selectCommissionsActionLoading)).subscribe(res => this.viewLoading = res);
		this.config = this.data.config;
		this.createForm();
	}

	/**
	 * On destroy
	 */
	ngOnDestroy() {
//		this.store.dispatch(new CommissionBackProcessFailed({ isFailed: false,errors:null }));
		this.componentSubscriptions.forEach(el => el.unsubscribe());
	}

	/**
	 * Returns page title
	 */
	getTitle(): string {
		return 'Settings';
	}
	
	/**
	 * Create form
	 */
	createForm() {
		this.configForm = this.configFB.group({
			//employee_id: [this.commission.employee_id, Validators.required],
			worksnap_api_key: [this.config.worksnap_api_key, [Validators.required]],
			company_fee: [this.config.company_fee, [Validators.required]],
			member_fee: [this.config.member_fee, [Validators.required]],
		});
	}

	/**
	 * Save data
	 *
	 */
	onSubmit() {
		this.hasFormErrors = false;
		const controls = this.configForm.controls;
		/** check form */
		if (this.configForm.invalid) {
			Object.keys(controls).forEach(controlName =>
				controls[controlName].markAsTouched()
			);

			this.hasFormErrors = true;
			return;
		}
		// tslint:disable-next-line:prefer-const
		let editedConfig = this.prepareConfig();
		this.save(editedConfig);
		this.dialogRef.close(editedConfig);

	}

	/**
	 * Returns object for saving
	 */
	prepareConfig(): any {
		const controls = this.configForm.controls;
		const _config:any = {};
		_config.worksnap_api_key = controls['worksnap_api_key'].value;
		_config.company_fee = controls['company_fee'].value;
		_config.member_fee = controls['member_fee'].value;
		return _config;
	}

	/**
	 * Update commission
	 *
	 * @param _config: CommissionModel
	 */
	save(_config: any) {
		this.configService.save(_config).subscribe(res=>{

		});

		// Uncomment this line
		// this.dialogRef.close({ _config, isEdit: true }
	}

	/** Alect Close event */
	onAlertClose($event) {
	}
}