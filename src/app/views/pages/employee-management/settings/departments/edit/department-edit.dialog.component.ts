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
import { AppState } from '../../../../../../core/reducers';

// Services and Models
import { 
	DepartmentModel, 
	selectDepartmentsActionLoading,
	DepartmentOnServerCreated,
	selectLastCreatedDepartmentId,
	DepartmentOnServerUpdated,
	DepartmentListingChanged,
} from '../../../../../../core/humanresource';
@Component({
	// tslint:disable-next-line:component-selector
	selector: 'kt-department-edit',
	templateUrl: './department-edit.dialog.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
	encapsulation: ViewEncapsulation.None
})
export class DepartmentEditDialogComponent implements OnInit, OnDestroy {
	// Public properties
	department: DepartmentModel;
	departmentForm: FormGroup;
	hasFormErrors: boolean = false;
	viewLoading: boolean = false;

	// Private properties
	private componentSubscriptions: Subscription[]=[];
	private company_id:number;

	/**
	 * Component constructor
	 *
	 * @param dialogRef: MatDialogRef<DepartmentEditDialogComponent>
	 * @param fb: FormBuilder
	 * @param store: Store<AppState>
	 * @param typesUtilsService: TypesUtilsService
	 */
	constructor(
		@Inject(MAT_DIALOG_DATA) public data: any,
		public dialogRef:MatDialogRef<DepartmentEditDialogComponent>,
		private store: Store<AppState>,
		private departmentFB: FormBuilder,
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
		this.store.pipe(select(selectDepartmentsActionLoading)).subscribe(res => this.viewLoading = res);
		this.department = this.data.department;
		this.company_id = this.data.company_id;
		this.createForm();
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
		if (this.department.id > 0) {
			return `Edit department '${this.department.name}'`;
		}

		return 'New department';
	}
	
	/**
	 * Create form
	 */
	createForm() {
		this.departmentForm = this.departmentFB.group({
			name: [this.department.name, Validators.required],
		});
	}

	/**
	 * Save data
	 *
	 */
	onSubmit() {
		this.hasFormErrors = false;
		const controls = this.departmentForm.controls;
		/** check form */
		if (this.departmentForm.invalid) {
			Object.keys(controls).forEach(controlName =>
				controls[controlName].markAsTouched()
			);

			this.hasFormErrors = true;
			return;
		}
		this.store.dispatch(new DepartmentListingChanged());
		// tslint:disable-next-line:prefer-const
		let editedDepartment = this.prepareDepartment();
		if (editedDepartment.id >0) {
			this.updateDepartment(editedDepartment);
		} else {
			this.createDepartment(editedDepartment);
		}

		this.dialogRef.close(editedDepartment);
	}

	/**
	 * Returns object for saving
	 */
	prepareDepartment(): DepartmentModel {
		const controls = this.departmentForm.controls;
		const _department = new DepartmentModel();
		_department.id = this.department.id;
		_department.name = controls['name'].value;
		return _department;
	}

	/**
	 * Update department
	 *
	 * @param _department: DepartmentModel
	 */
	updateDepartment(_department: DepartmentModel) {
		const updateDepartment: Update<DepartmentModel> = {
			id: _department.id,
			changes: _department
		};
		this.store.dispatch(new DepartmentOnServerUpdated({
			partialDepartment: updateDepartment,
			department: _department
		}));

		// Uncomment this line
		// this.dialogRef.close({ _department, isEdit: true }
	}
	/**
	 * Create department
	 *
	 * @param _department: DepartmentModel
	 */
	createDepartment(_department: DepartmentModel) {
		this.store.dispatch(new DepartmentOnServerCreated({ department: _department }));
		const createSubscription = this.store.pipe(
			select(selectLastCreatedDepartmentId),
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