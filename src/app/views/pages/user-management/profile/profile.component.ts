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
import { AppState } from '../../../../core/reducers';

import { LayoutUtilsService,MessageType,TypesUtilsService } from '../../../../core/_base/crud';
// Services and Models
import { UserLoaded } from '../../../../core/auth/_actions/auth.actions';
import { isLoggedIn,currentUser } from '../../../../core/auth/_selectors/auth.selectors';
import { EMAIL_REG } from '../../../../core/humanresource/_consts/specification';
import { AuthService } from '../../../../core/auth'
@Component({
	// tslint:disable-next-line:component-selector
	selector: 'kt-user-basic-profile',
	templateUrl: './profile.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
	encapsulation: ViewEncapsulation.None
})
export class UserProfileComponent implements OnInit, OnDestroy {
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
		private authService:AuthService,
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
		let menus = {
			slug:'profile',
		}
		this.menus$ = of(menus);
	}
	/**
	 * On destroy
	 */
	ngOnDestroy() {
		this.componentSubscriptions.forEach(el => el.unsubscribe());
	}

	/**
	 * Create form
	 */
	createForm() {
		this.userForm = this.userFB.group({
			email: [this.loginedUser.email, [Validators.required,Validators.pattern(EMAIL_REG)]],
			current_password: [""],
			new_password: [""],
			confirm_password: [""],
		});
	}

	/**
	 * Save data
	 *
	 * @param withBack: boolean
	 */
	onSumbit() {
		this.hasFormErrors = false;
		let password=false;
		const controls = this.userForm.controls;
		/** check form */
		if (this.userForm.invalid) {
			Object.keys(controls).forEach(controlName =>
				controls[controlName].markAsTouched()
			);

			this.hasFormErrors = true;
			return;
		}
		if(controls['current_password'].value){
			if(controls['new_password'].value==null || controls['new_password'].value==""){
				this.hasFormErrors = true;
				controls['new_password'].setErrors({'incorrect': true,'required':true});
				controls['new_password'].markAsTouched();
			}
			if(controls['new_password'].value !=controls['confirm_password'].value){
				this.hasFormErrors = true;
				controls['confirm_password'].setErrors({'incorrect': true,'unmatched':true});
				controls['confirm_password'].markAsTouched();
			}
			if(this.hasFormErrors)return;
			password = true;
		}else{
			if(controls['new_password'].value || controls['confirm_password'].value){
				if(controls['current_password'].value==null || controls['current_password'].value==""){
					this.hasFormErrors = true;
					controls['current_password'].setErrors({'incorrect': true,'required':true});
					controls['current_password'].markAsTouched();
				}
				if(controls['new_password'].value==null || controls['new_password'].value==""){
					this.hasFormErrors = true;
					controls['new_password'].setErrors({'incorrect': true,'required':true});
					controls['new_password'].markAsTouched();
				}
				if(controls['new_password'].value !=controls['confirm_password'].value){
					this.hasFormErrors = true;
					controls['confirm_password'].setErrors({'incorrect': true,'unmatched':true});
					controls['confirm_password'].markAsTouched();
				}
				if(this.hasFormErrors)return;
				password = true;
			}
		}
		// tslint:disable-next-line:prefer-const
		let editedUser = this.prepareUser(password);
		if (editedUser.id > 0) {
			this.updateUser(editedUser);
			return;
		}
	}

	onCancel(){
		this.createForm();
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
	 * Returns object for saving
	 */
	prepareUser(password:boolean) {
		const controls = this.userForm.controls;
		const _user:any = {};
		_user.id = this.loginedUser.id;
		_user.email = controls['email'].value;
		if(password){
			_user.current_password = controls['current_password'].value;
			_user.new_password = controls['new_password'].value;
			_user.confirm_password = controls['confirm_password'].value;
		}
		return _user;
	}

	/**
	 * Update employee
	 *
	 * @param _user: any
	 */
	updateUser(_user: any) {
		this.authService.updateUser(_user).pipe().subscribe(
			(res:any)=>{
				if(res.status=="ok"){
					this.store.dispatch(new UserLoaded({ user: res.user }));
					const message = `Your profile successfully has been saved.`;
					this.layoutUtilsService.showActionNotification(message, MessageType.Update, 10000, true, false);		
				}else if(res.status=="failed"){
					if(res.errors.password){
						switch(res.errors.password){
							case 'current_password_falied':
								this.hasFormErrors = true;
								this.userForm.controls['current_password'].setErrors({'incorrect': true,'pattern':true});
								this.userForm.controls['current_password'].markAsTouched();		
								this.cdr.detectChanges();		
								break;
							case 'password_unmatched':
								this.hasFormErrors = true;
								this.userForm.controls['confirm_password'].setErrors({'incorrect': true,'unmatched':true});
								this.userForm.controls['confirm_password'].markAsTouched();				
								this.cdr.detectChanges();
								break;
						}						
					}else if(res.errors.email){
						this.hasFormErrors = true;
						this.userForm.controls['email'].setErrors({'incorrect': true,'unique':true});
						this.userForm.controls['email'].markAsTouched();		
						this.cdr.detectChanges();		
					}
				}
			}
		)
	}


	/** Alect Close event */
	onAlertClose($event) {
	}	
}