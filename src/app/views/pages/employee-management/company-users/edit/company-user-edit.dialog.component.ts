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
	CompanyUserModel, 
	selectCompanyUsersActionLoading,
	CompanyUserOnServerCreated,
	selectLastCreatedCompanyUserId,
	CompanyUserOnServerUpdated,
	selectCompanyUsersBackProcessingSuccess,
	selectCompanyUsersBackProcessingFailed,
	CompanyUserBackProcessFailed,
} from '../../../../../core/humanresource';
import { EMAIL_REG } from '../../../../../core/humanresource/_consts/specification';
@Component({
	// tslint:disable-next-line:component-selector
	selector: 'kt-companyuser-edit',
	templateUrl: './company-user-edit.dialog.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
	encapsulation: ViewEncapsulation.None
})
export class CompanyUserEditDialogComponent implements OnInit, OnDestroy {
	// Public properties
	companyUser: CompanyUserModel;
	companyUserForm: FormGroup;
	hasFormErrors: boolean = false;
	viewLoading: boolean = false;

	// Private properties
	private componentSubscriptions: Subscription[]=[];
	private company_id:number;

	/**
	 * Component constructor
	 *
	 * @param dialogRef: MatDialogRef<CompanyUserEditDialogComponent>
	 * @param fb: FormBuilder
	 * @param store: Store<AppState>
	 * @param typesUtilsService: TypesUtilsService
	 */
	constructor(
		@Inject(MAT_DIALOG_DATA) public data: any,
		public dialogRef:MatDialogRef<CompanyUserEditDialogComponent>,
		private store: Store<AppState>,
		private companyUserFB: FormBuilder,
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
		this.store.pipe(select(selectCompanyUsersActionLoading)).subscribe(res => this.viewLoading = res);
		this.companyUser = this.data.companyUser;
		this.company_id = this.data.company_id;
		const updateSuccessSubscription = this.store.pipe(
			select(selectCompanyUsersBackProcessingSuccess),
			delay(1000), // Remove this line
		).subscribe(res => {
			if (!res) {
				return;
			}
			if(res)this.dialogRef.close({ isEdit: true });
		});
		this.componentSubscriptions.push(updateSuccessSubscription);
		const updateFailedSubscription = this.store.pipe(
			select(selectCompanyUsersBackProcessingFailed),
			delay(1000), // Remove this line
		).subscribe(res => {
			if (!res) {
				return;
			}
			if(res){
				this.hasFormErrors=true;
				if(res.email!=undefined)this.companyUserForm.controls['email'].setErrors({'incorrect': true,'unique':true});
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
		this.store.dispatch(new CompanyUserBackProcessFailed({ isFailed: false,errors:null }));
		this.componentSubscriptions.forEach(el => el.unsubscribe());
	}

	/**
	 * Returns page title
	 */
	getTitle(): string {
		if (this.companyUser.id > 0) {
			return `Edit Company User '${this.companyUser.name}'`;
		}

		return 'New Company User';
	}
	
	/**
	 * Create form
	 */
	createForm() {
		this.companyUserForm = this.companyUserFB.group({
			name: [this.companyUser.name, Validators.required],
			email: [this.companyUser.email, [Validators.required,Validators.pattern(EMAIL_REG)]],
			password:[''],
			password_confirm:[''],
		});
	}

	onInput(value) {
		if(this.companyUserForm.get('password_confirm').value == this.companyUserForm.get('password').value){
			this.companyUserForm.get('password_confirm').setErrors(null);
		}else{
			this.companyUserForm.get('password_confirm').setErrors([{'confirmedDoesNotMatch': true}]);
		}
		console.log(this.companyUserForm.get('password_confirm').invalid);
		/*if (this.form.hasError('confirmedDoesNotMatch')) { // or some other test of the value
			this.form.get('confirmPassword').setErrors([{'confirmedDoesNotMatch': true}]);
		} else {
			this.form.get('confirmPassword').setErrors(null);
		}*/
	}

	/**
	 * Save data
	 *
	 */
	onSubmit() {
		this.hasFormErrors = false;
		const controls = this.companyUserForm.controls;
		/** check form */
		if (this.companyUserForm.invalid) {
			Object.keys(controls).forEach(controlName =>
				controls[controlName].markAsTouched()
			);

			this.hasFormErrors = true;
			return;
		}
		// tslint:disable-next-line:prefer-const
		let editedCompanyUser = this.prepareCompanyUser();
		if (editedCompanyUser.id >0) {
			this.updateCompanyUser(editedCompanyUser);
		} else {
			this.createCompanyUser(editedCompanyUser);
		}

		//this.dialogRef.close(editedCompanyUser);
	}

	/**
	 * Returns object for saving
	 */
	prepareCompanyUser(): CompanyUserModel {
		const controls = this.companyUserForm.controls;
		const _companyUser = new CompanyUserModel();
		_companyUser.id = this.companyUser.id;
		_companyUser.company_id = this.company_id;
		_companyUser.name = controls['name'].value;
		_companyUser.email = controls['email'].value;
		if(_companyUser.id>0&&controls['password'].value){
			_companyUser.password = controls['password'].value;
			_companyUser.password_confirm = controls['password_confirm'].value;
		}
		return _companyUser;
	}

	/**
	 * Update companyUser
	 *
	 * @param _companyUser: CompanyUserModel
	 */
	updateCompanyUser(_companyUser: CompanyUserModel) {
		const updateCompanyUser: Update<CompanyUserModel> = {
			id: _companyUser.id,
			changes: _companyUser
		};
		this.store.dispatch(new CompanyUserOnServerUpdated({
			partialCompanyUser: updateCompanyUser,
			companyUser: _companyUser
		}));

		// Uncomment this line
		// this.dialogRef.close({ _companyUser, isEdit: true }
	}
	/**
	 * Checking control validation
	 *
	 * @param controlName: string => Equals to formControlName
	 * @param validationType: string => Equals to valitors name
	 */
	isControlHasError(controlName: string, validationType: string): boolean {
		const control = this.companyUserForm.controls[controlName];
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
	 * Create companyUser
	 *
	 * @param _companyUser: CompanyUserModel
	 */
	createCompanyUser(_companyUser: CompanyUserModel) {
		this.store.dispatch(new CompanyUserOnServerCreated({ companyUser: _companyUser }));
		const createSubscription = this.store.pipe(
			select(selectLastCreatedCompanyUserId),
			delay(1000), // Remove this line
		).subscribe(res => {
			if (!res) {
				return;
			}
			/*if(res.status == 0){
				var response = res;
				if(response.errors.email!=undefined)this.companyUserForm.controls['email'].setErrors({'incorrect': true,'unique':true});
			}else if(res.status ==1){
				this.dialogRef.close({ _companyUser, isEdit: false });
			}*/
		});
		this.componentSubscriptions.push(createSubscription);
	}

	/** Alect Close event */
	onAlertClose($event) {
	}
}