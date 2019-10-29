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
	AssetAssignModel, 
	selectAssetAssignsActionLoading,
	AssetAssignOnServerCreated,
	selectLastCreatedAssetAssignId,
	AssetAssignOnServerUpdated,
	selectAssetAssignsBackProcessingSuccess,
	selectAssetAssignsBackProcessingFailed,
	AssetAssignBackProcessFailed,
} from '../../../../../core/asset';
import { 
	EmployeeModel,
	EmployeesService,
} from '../../../../../core/humanresource';

@Component({
	// tslint:disable-next-line:component-selector
	selector: 'kt-asset-assign-edit',
	templateUrl: './assign-edit.dialog.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
	encapsulation: ViewEncapsulation.None
})
export class AssetAssignEditDialogComponent implements OnInit, OnDestroy {
	// Public properties
	assetAssign: AssetAssignModel;
	assetAssignForm: FormGroup;
	hasFormErrors: boolean = false;
	viewLoading: boolean = false;
	employees:EmployeeModel[]=[];
	employeeCtrl:FormControl = new FormControl();
	filteredEmployees: Observable<EmployeeModel[]>;
	selectedEmployeeDisplayName:string;
	selectedEmployeeId:number;

	// Private properties
	private componentSubscriptions: Subscription[]=[];
	private company_id:number;

	/**
	 * Component constructor
	 *
	 * @param dialogRef: MatDialogRef<AssetAssignEditDialogComponent>
	 * @param fb: FormBuilder
	 * @param store: Store<AppState>
	 * @param typesUtilsService: TypesUtilsService
	 */
	constructor(
		@Inject(MAT_DIALOG_DATA) public data: any,
		public dialogRef:MatDialogRef<AssetAssignEditDialogComponent>,
		private store: Store<AppState>,
		private employeesService:EmployeesService,
		private assetAssignFB: FormBuilder,
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
		this.store.pipe(select(selectAssetAssignsActionLoading)).subscribe(res => this.viewLoading = res);
		this.assetAssign = this.data.assetAssign;
		if(this.assetAssign.employee_id){
			this.selectedEmployeeDisplayName = this.assetAssign.employee.first_name + ' ' + this.assetAssign.employee.last_name;
			this.selectedEmployeeId = this.assetAssign.employee_id;	
		}
		const updateSuccessSubscription = this.store.pipe(
			select(selectAssetAssignsBackProcessingSuccess),
			delay(1000), // Remove this line
		).subscribe(res => {
			if (!res) {
				return;
			}
			if(res)this.dialogRef.close({ isEdit: true });
		});
		this.componentSubscriptions.push(updateSuccessSubscription);
		const updateFailedSubscription = this.store.pipe(
			select(selectAssetAssignsBackProcessingFailed),
			delay(1000), // Remove this line
		).subscribe(res => {
			if (!res) {
				return;
			}
			if(res){
				this.hasFormErrors=true;
				if(res.email!=undefined)this.assetAssignForm.controls['email'].setErrors({'incorrect': true,'unique':true});
			}
			this.viewLoading = false;
			this.cdr.detectChanges();
		});
		this.componentSubscriptions.push(updateFailedSubscription);
		this.employeesService.findAllEmployees().pipe(
			).subscribe(res=>this.employees = res);		
		this.filteredEmployees = this.employeeCtrl.valueChanges
			.pipe(
				startWith(''),
				map(value => typeof value === 'string' ? value : value.first_name),
				map(name => name ? this._filterEmployees(name) : this.employees.slice())
			);
		this.createForm();
	}
	private _filterEmployees(value: string): EmployeeModel[] {
		const filterValue = value.toLowerCase();	
		return this.employees.filter(employee => employee.first_name.toLowerCase().indexOf(filterValue) === 0 || employee.last_name.toLowerCase().indexOf(filterValue) === 0);
	}
	private selected($event, employee:EmployeeModel) {
		this.selectedEmployeeDisplayName = employee.first_name + ' ' + employee.last_name;
		this.selectedEmployeeId = employee.id;
	}	
	getDisplayFn(employee?: EmployeeModel): string | undefined {
		return employee ? "": undefined;
	}

	/**
	 * On destroy
	 */
	ngOnDestroy() {
		this.store.dispatch(new AssetAssignBackProcessFailed({ isFailed: false,errors:null }));
		this.componentSubscriptions.forEach(el => el.unsubscribe());
	}

	/**
	 * Returns page title
	 */
	getTitle(): string {
		if (this.assetAssign.id > 0) {
			return `Edit assetAssign `;
		}

		return 'New assetAssign';
	}
	
	/**
	 * Create form
	 */
	createForm() {
		this.assetAssignForm = this.assetAssignFB.group({
			//employee_id: [this.assetAssign.employee_id, Validators.required],
			start_date: [this.assetAssign.start_date, [Validators.required]],
			end_date: [this.assetAssign.end_date, [Validators.required]],
			comment: [this.assetAssign.comment, [Validators.required]],
		});
	}

	/**
	 * Save data
	 *
	 */
	onSubmit() {
		this.hasFormErrors = false;
		const controls = this.assetAssignForm.controls;
		/** check form */
		if (this.assetAssignForm.invalid) {
			Object.keys(controls).forEach(controlName =>
				controls[controlName].markAsTouched()
			);

			this.hasFormErrors = true;
			return;
		}
		if(this.selectedEmployeeId>0){
			// tslint:disable-next-line:prefer-const
			if(controls['start_date'].value>controls['end_date'].value){
				controls['end_date'].setErrors({'incorrect': true,'required':true});
				controls['end_date'].markAsTouched()
				this.hasFormErrors = true;
				return;
			}
			let editedAssetAssign = this.prepareAssetAssign();
			if (editedAssetAssign.id >0) {
				this.updateAssetAssign(editedAssetAssign);
			} else {
				this.createAssetAssign(editedAssetAssign);
			}
	
			this.dialogRef.close(editedAssetAssign);
		}else{
			this.hasFormErrors = true;
			this.employeeCtrl.setErrors({'incorrect': true,'unique':true});
			this.employeeCtrl.markAsTouched();
		}

	}

	/**
	 * Returns object for saving
	 */
	prepareAssetAssign(): AssetAssignModel {
		const controls = this.assetAssignForm.controls;
		const _assetAssign = new AssetAssignModel();
		_assetAssign.id = this.assetAssign.id;
		_assetAssign.employee_id = this.selectedEmployeeId;
		if(controls['start_date'].value.toDateString == undefined){
			_assetAssign.start_date = controls['start_date'].value;
		}else{
			_assetAssign.start_date = controls['start_date'].value.toDateString();
		}
		if(controls['end_date'].value.toDateString == undefined){
			_assetAssign.end_date = controls['end_date'].value;
		}else{
			_assetAssign.end_date = controls['end_date'].value.toDateString();
		}
		_assetAssign.asset_id = this.assetAssign.asset_id;
		_assetAssign.comment = controls['comment'].value;
		return _assetAssign;
	}

	/**
	 * Update assetAssign
	 *
	 * @param _assetAssign: AssetAssignModel
	 */
	updateAssetAssign(_assetAssign: AssetAssignModel) {
		const updateAssetAssign: Update<AssetAssignModel> = {
			id: _assetAssign.id,
			changes: _assetAssign
		};
		this.store.dispatch(new AssetAssignOnServerUpdated({
			partialAssetAssign: updateAssetAssign,
			assetAssign: _assetAssign
		}));

		// Uncomment this line
		// this.dialogRef.close({ _assetAssign, isEdit: true }
	}
	/**
	 * Checking control validation
	 *
	 * @param controlName: string => Equals to formControlName
	 * @param validationType: string => Equals to valitors name
	 */
	isControlHasError(controlName: string, validationType: string): boolean {
		const control = this.assetAssignForm.controls[controlName];
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
	 * Create assetAssign
	 *
	 * @param _assetAssign: AssetAssignModel
	 */
	createAssetAssign(_assetAssign: AssetAssignModel) {
		this.store.dispatch(new AssetAssignOnServerCreated({ assetAssign: _assetAssign }));
		const createSubscription = this.store.pipe(
			select(selectLastCreatedAssetAssignId),
			delay(1000), // Remove this line
		).subscribe(res => {
			if (!res) {
				return;
			}
		});
		this.componentSubscriptions.push(createSubscription);
	}

	/** Alect Close event */
	onAlertClose($event) {
	}
}