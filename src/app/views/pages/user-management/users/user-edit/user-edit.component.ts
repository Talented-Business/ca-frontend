// Angular
import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
// RxJS
import { BehaviorSubject, Observable, of, Subscription } from 'rxjs';
// NGRX
import { Store, select } from '@ngrx/store';
import { Update } from '@ngrx/entity';
import { AppState } from '../../../../../core/reducers';
// Layout
import { SubheaderService, LayoutConfigService } from '../../../../../core/_base/layout';
import { LayoutUtilsService, MessageType } from '../../../../../core/_base/crud';
// Services and Models
import {
	User,
	UserUpdated,
	selectUserById,
	UserOnServerCreated,
	selectLastCreatedUserId,
	selectUsersActionLoading,
	AuthService,
} from '../../../../../core/auth';

@Component({
	selector: 'kt-user-edit',
	templateUrl: './user-edit.component.html',
})
export class UserEditComponent implements OnInit, OnDestroy {
	// Public properties
	user: User;
	userId$: Observable<number>;
	oldUser: User;
	loading$: Observable<boolean>;
	userForm: FormGroup;
	hasFormErrors: boolean = false;
	permissions:any[]=[];
	superAdmin:boolean=false;
	// Private properties
	private subscriptions: Subscription[] = [];
	private menuLabels:string[] = ['Employees', 'Companies', 'Jobs', 'Invoices','Assets','News & Event'];

	/**
	 * Component constructor
	 *
	 * @param activatedRoute: ActivatedRoute
	 * @param router: Router
	 * @param userFB: FormBuilder
	 * @param subheaderService: SubheaderService
	 * @param layoutUtilsService: LayoutUtilsService
	 * @param store: Store<AppState>
	 * @param layoutConfigService: LayoutConfigService
	 */
	constructor(private activatedRoute: ActivatedRoute,
		private router: Router,
		private userFB: FormBuilder,
		private subheaderService: SubheaderService,
		private layoutUtilsService: LayoutUtilsService,
		private store: Store<AppState>,
		private authService:AuthService,
		private cdr: ChangeDetectorRef,
		private layoutConfigService: LayoutConfigService) { }

	/**
	 * @ Lifecycle sequences => https://angular.io/guide/lifecycle-hooks
	 */

	/**
	 * On init
	 */
	ngOnInit() {
		this.loading$ = this.store.pipe(select(selectUsersActionLoading));

		const routeSubscription =  this.activatedRoute.params.subscribe(params => {
			const id = params['id'];
			if (id && id > 0) {
				this.store.pipe(select(selectUserById(id))).subscribe(res => {
					if (res) {
						this.user = res;
						this.oldUser = Object.assign({}, this.user);
						this.initUser();
					}else{
						this.authService.getUserById(id).subscribe(res => {
							this.user = res;
							this.oldUser = Object.assign({}, this.user);
							this.initUser();
							this.cdr.detectChanges();
						});
										
					}
				});
			} else {
				this.user = new User();
				this.user.clear();
				this.oldUser = Object.assign({}, this.user);
				this.permissions = [1,1,1,1,1,1];
				this.initUser();
			}
		});
		this.subscriptions.push(routeSubscription);
	}

	ngOnDestroy() {
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}

	/**
	 * Init user
	 */
	initUser() {
		this.createForm();
		if (!this.user.id) {
			this.subheaderService.setTitle('Create user');
			this.subheaderService.setBreadcrumbs([
				{ title: 'User Management', page: `user-management` },
				{ title: 'Users',  page: `user-management/users` },
				{ title: 'Create user', page: `user-management/users/add` }
			]);
			return;
		}
		if(this.user.type=='super')this.superAdmin = true;
		if(this.user.menus){
			this.permissions = [0,0,0,0,0,0];
			this.user.menus.forEach((menu:any, index)=>{
				if(menu.status){
					let number = this.menuLabels.indexOf(menu.status);
					this.permissions[number] = 1;
				}else{
					let number = this.menuLabels.indexOf(menu);
					this.permissions[number] = 1;
				}
			})
		}
		this.subheaderService.setTitle('Edit user');
		this.subheaderService.setBreadcrumbs([
			{ title: 'User Management', page: `user-management` },
			{ title: 'Users',  page: `user-management/users` },
			{ title: 'Edit user', page: `user-management/users/edit`, queryParams: { id: this.user.id } }
		]);
	}

	/**
	 * Create form
	 */
	createForm() {
		this.userForm = this.userFB.group({
			name: [this.user.name, Validators.required],
			email: [this.user.email, Validators.email],
			new_password: [""],
			confirm_password: [""],
			active:[this.user.active]
		});
	}

	/**
	 * Redirect to list
	 *
	 */
	goBackWithId() {
		const url = `/user-management/users`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}

	/**
	 * Refresh user
	 *
	 * @param isNew: boolean
	 * @param id: number
	 */
	refreshUser(isNew: boolean = false, id = 0) {
		let url = this.router.url;
		if (!isNew) {
			this.router.navigate([url], { relativeTo: this.activatedRoute });
			return;
		}

		url = `/user-management/users/edit/${id}`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}

	/**
	 * Reset
	 */
	reset() {
		this.user = Object.assign({}, this.oldUser);
		this.createForm();
		this.hasFormErrors = false;
		this.userForm.markAsPristine();
        this.userForm.markAsUntouched();
        this.userForm.updateValueAndValidity();
	}

	/**
	 * Save data
	 *
	 * @param withBack: boolean
	 */
	onSumbit(withBack: boolean = false) {
		this.hasFormErrors = false;
		const controls = this.userForm.controls;
		let password=false;
		/** check form */
		if (this.userForm.invalid) {
			Object.keys(controls).forEach(controlName =>
				controls[controlName].markAsTouched()
			);

			this.hasFormErrors = true;
			return;
		}
		if(this.user.id>0 && (controls['new_password'].value || controls['confirm_password'].value ) || this.user.id==undefined){
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

		const editedUser = this.prepareUser(password);

		if (editedUser.id > 0) {
			this.updateUser(editedUser, withBack);
			return;
		}

		this.addUser(editedUser, withBack);
	}

	/**
	 * Returns prepared data for save
	 */
	prepareUser(password:boolean): User {
		const controls = this.userForm.controls;
		const _user = new User();
		_user.clear();
		_user.id = this.user.id;
		_user.name = controls['name'].value;
		_user.email = controls['email'].value;
		_user.active = controls['active'].value;
		if(password){
			_user.new_password = controls['new_password'].value;
			_user.confirm_password = controls['confirm_password'].value;
		}
		_user.menus = [];
		this.menuLabels.forEach((menuLabel, index)=>{
			if(this.permissions[index]){
				_user.menus.push(menuLabel);
			}
		})
		if(this.superAdmin)_user.type = 'super';
		else _user.type = 'admin';
		return _user;
	}

	/**
	 * Add User
	 *
	 * @param _user: User
	 * @param withBack: boolean
	 */
	addUser(_user: User, withBack: boolean = false) {
		this.store.dispatch(new UserOnServerCreated({ user: _user }));
		const addSubscription = this.store.pipe(select(selectLastCreatedUserId)).subscribe(newId => {
			const message = `New user successfully has been added.`;
			this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, true);
			if (newId) {
				if (withBack) {
					this.goBackWithId();
				} else {
					this.refreshUser(true, newId);
				}
			}
		});
		this.subscriptions.push(addSubscription);
	}

	/**
	 * Update user
	 *
	 * @param _user: User
	 * @param withBack: boolean
	 */
	updateUser(_user: User, withBack: boolean = false) {
		// Update User
		// tslint:disable-next-line:prefer-const

		const updatedUser: Update<User> = {
			id: _user.id,
			changes: _user
		};
		this.store.dispatch(new UserUpdated( { partialUser: updatedUser, user: _user }));
		const message = `User successfully has been saved.`;
		this.layoutUtilsService.showActionNotification(message, MessageType.Update, 5000, true, true);
		if (withBack) {
			this.goBackWithId();
		} else {
			this.refreshUser(false);
		}
	}

	/**
	 * Returns component title
	 */
	getComponentTitle() {
		let result = 'Create user';
		if (!this.user || !this.user.id) {
			return result;
		}

		result = `Edit user - ${this.user.name}`;
		return result;
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
	 * Close Alert
	 *
	 * @param $event: Event
	 */
	onAlertClose($event) {
		this.hasFormErrors = false;
	}
}
