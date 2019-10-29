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
	CommissionModel, 
	CommissionService, 
} from '../../../../../core/humanresource';

@Component({
	// tslint:disable-next-line:component-selector
	selector: 'kt-commisson-item-edit',
	templateUrl: './commission-edit.dialog.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
	encapsulation: ViewEncapsulation.None
})
export class CommissionEditDialogComponent implements OnInit, OnDestroy {
	// Public properties
	commission: CommissionModel;
	commissionForm: FormGroup;
	hasFormErrors: boolean = false;
	viewLoading: boolean = false;
	total:number=10;

	// Private properties
	private componentSubscriptions: Subscription[]=[];
	private company_id:number;

	/**
	 * Component constructor
	 *
	 * @param dialogRef: MatDialogRef<CommissionEditDialogComponent>
	 * @param fb: FormBuilder
	 * @param store: Store<AppState>
	 * @param typesUtilsService: TypesUtilsService
	 */
	constructor(
		@Inject(MAT_DIALOG_DATA) public data: any,
		public dialogRef:MatDialogRef<CommissionEditDialogComponent>,
		private store: Store<AppState>,
		private commissionFB: FormBuilder,
		private commissionService:CommissionService,
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
		this.commission = this.data.commission;
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
		if (this.commission.id > 0) {
			return `Edit Commission`;
		}

		return 'New Commission';
	}
	
	/**
	 * Create form
	 */
	createForm() {
		this.commissionForm = this.commissionFB.group({
			//employee_id: [this.commission.employee_id, Validators.required],
			name: [this.commission.name, [Validators.required]],
			fee: [this.commission.fee, [Validators.required]],
			quantity: [this.commission.quantity, [Validators.required]],
		});
	}

	/**
	 * Save data
	 *
	 */
	onSubmit() {
		this.hasFormErrors = false;
		const controls = this.commissionForm.controls;
		/** check form */
		if (this.commissionForm.invalid) {
			Object.keys(controls).forEach(controlName =>
				controls[controlName].markAsTouched()
			);

			this.hasFormErrors = true;
			return;
		}
		// tslint:disable-next-line:prefer-const
		let editedCommission = this.prepareCommission();
		if (editedCommission.id >0) {
			this.updateCommission(editedCommission);
		} else {
			this.createCommission(editedCommission);
		}

		this.dialogRef.close(editedCommission);

	}

	/**
	 * Returns object for saving
	 */
	prepareCommission(): CommissionModel {
		const controls = this.commissionForm.controls;
		const _commission = new CommissionModel();
		_commission.id = this.commission.id;
		_commission.group_id = this.commission.group_id;
		_commission.name = controls['name'].value;
		_commission.fee = controls['fee'].value;
		_commission.quantity = controls['quantity'].value;
		return _commission;
	}

	/**
	 * Update commission
	 *
	 * @param _commission: CommissionModel
	 */
	updateCommission(_commission: CommissionModel) {
		this.commissionService.updateCommission(_commission).subscribe(res=>{

		});

		// Uncomment this line
		// this.dialogRef.close({ _commission, isEdit: true }
	}
	/**
	 * Checking control validation
	 *
	 * @param controlName: string => Equals to formControlName
	 * @param validationType: string => Equals to valitors name
	 */
	isControlHasError(controlName: string, validationType: string): boolean {
		const control = this.commissionForm.controls[controlName];
		if (!control) {
			return false;
		}
		const result = control.hasError(validationType) && (control.dirty || control.touched);
		return result;
	}
	validateNumber(e: any) {
		let input = e.target.value;
		let keyCode = String.fromCharCode(e.charCode);
		
		const regValue = /^\d*\.?\d{0,2}$/;
		const regKey = /^[0-9\.]$/;
		if (!regValue.test(input)) {
		  e.preventDefault();
		}
		if (!regKey.test(keyCode)) {
			e.preventDefault();
		}
	}
	/**
	 * Create commission
	 *
	 * @param _commission: CommissionModel
	 */
	createCommission(_commission: CommissionModel) {
		this.commissionService.createCommission(_commission).subscribe(res=>{
			
		});
	}

	/** Alect Close event */
	onAlertClose($event) {
	}
}