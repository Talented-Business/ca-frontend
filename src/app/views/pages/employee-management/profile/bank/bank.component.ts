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

import { LayoutUtilsService,MessageType,TypesUtilsService } from '../../../../../core/_base/crud';
// Services and Models
import { 
	EmployeesService,
} from '../../../../../core/humanresource';
import { isLoggedIn,currentUser } from '../../../../../core/auth/_selectors/auth.selectors';
@Component({
	// tslint:disable-next-line:component-selector
	selector: 'kt-employee-bank',
	templateUrl: './bank.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
	encapsulation: ViewEncapsulation.None
})
export class BankUserProfileComponent implements OnInit, OnDestroy {
	// Public properties
	viewLoading: boolean = false;
	menus$: Observable<any>;
	userForm: FormGroup;
	hasFormErrors: boolean = false;	
	loginedUser;
	// Private properties
	private componentSubscriptions: Subscription[]=[];

	/**
	 * Component constructor
	 *
	 * @param fb: FormBuilder
	 * @param store: Store<AppState>
	 * @param typesUtilsService: TypesUtilsService
	 */
	constructor(
		private userFB: FormBuilder,
		private store: Store<AppState>,
		private employeeService:EmployeesService,
		private layoutUtilsService: LayoutUtilsService,
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
		//this.store.pipe(select(selectProposalsActionLoading)).subscribe(res => this.viewLoading = res);
		let menus = {
			slug:'bank',
		}
		this.store.pipe(
			select(currentUser),
		).subscribe(user=>{
			if(user){
				this.loginedUser = user;
				this.createForm();
				setTimeout(()=>{
					this.cdr.detectChanges();
				},1000);
			}
		});				
		this.menus$ = of(menus);
	}
	/**
	 * Create form
	 */
	createForm() {
		this.userForm = this.userFB.group({
			bank_name: [this.loginedUser.member.bank_name, [Validators.required]],
			bank_account_name: [this.loginedUser.member.bank_account_name, Validators.required],
			bank_account_number: [this.loginedUser.member.bank_account_number, [Validators.required]],
			bank_account_type: [this.loginedUser.member.bank_account_type, [Validators.required]],
		});
	}
	/**
	 * Save data
	 *
	 * @param withBack: boolean
	 */
	onSumbit() {
		this.hasFormErrors = false;
		const controls = this.userForm.controls;
		/** check form */
		if (this.userForm.invalid) {
			Object.keys(controls).forEach(controlName =>
				controls[controlName].markAsTouched()
			);

			this.hasFormErrors = true;
			return;
		}
		// tslint:disable-next-line:prefer-const
		let editedUser = this.prepareUser();
		if (editedUser.id > 0) {
			this.updateBank(editedUser);
			return;
		}
	}

	onCancel(){
		this.createForm();
	}
	/**
	 * Returns object for saving
	 */
	prepareUser() {
		const controls = this.userForm.controls;
		const _user:any = {};
		_user.id = this.loginedUser.member.id;
		_user.bank_name = controls['bank_name'].value;
		_user.bank_account_name = controls['bank_account_name'].value;
		_user.bank_account_number = controls['bank_account_number'].value;
		_user.bank_account_type = controls['bank_account_type'].value;
		return _user;
	}
	/**
	 * Update employee
	 *
	 * @param _user: any
	 */
	updateBank(_user: any) {
		this.employeeService.updateBank(_user).pipe().subscribe(
			(res:any)=>{
				if(res.status=="ok"){
					const message = `Your Bank Information successfully has been saved.`;
					this.layoutUtilsService.showActionNotification(message, MessageType.Update, 10000, true, true);		
				}else if(res.status=="failed"){
					
				}
			}
		)
	}
	/**
	 * Checking control validation
	 *
	 * @param controlName: string => Equals to formControlName
	 * @param validationType: string => Equals to valitors name
	 */
	isControlHasError(controlName: string, validationType: string): boolean {
		const control = this.userForm.controls[controlName];
		if (!control) {
			return false;
		}
		const result = control.hasError(validationType) && (control.dirty || control.touched);
		return result;
	}

	/**
	 * On destroy
	 */
	ngOnDestroy() {
		this.componentSubscriptions.forEach(el => el.unsubscribe());
	}


	/** Alect Close event */
	onAlertClose($event) {
	}	
}