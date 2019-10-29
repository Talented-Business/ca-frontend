// Angular
import { Component, OnInit,Input,  ChangeDetectionStrategy, ViewEncapsulation, OnDestroy,ChangeDetectorRef } from '@angular/core';
// RxJS
import { Observable,BehaviorSubject,Subscription, of } from 'rxjs';
// NGRX
import { Store, select } from '@ngrx/store';
// State
import { AppState } from '../../../../../core/reducers';
import { currentUser } from '../../../../../core/auth';

@Component({
	// tslint:disable-next-line:component-selector
	selector: 'kt-meta-user-profile',
	templateUrl: './meta-profile.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
	encapsulation: ViewEncapsulation.None
})
export class MetaProfileComponent implements OnInit, OnDestroy {
// Incoming data
	@Input() menus$: Observable<any>;	
	slug:string;
	profileMenus:any;
	// Public properties
	viewLoading: boolean = false;

	// Private properties
	private componentSubscriptions: Subscription[]=[];
	loginedUser:any;
	

	/**
	 * Component constructor
	 *
	 * @param fb: FormBuilder
	 * @param store: Store<AppState>
	 * @param typesUtilsService: TypesUtilsService
	 */
	constructor(
		private store: Store<AppState>,
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
		this.menus$.pipe().subscribe(res => {
			if (!res) {
				return;
			}

			this.slug = res.slug;
		});		
		this.store.select(currentUser).subscribe(user=>{
			if(user){
				this.loginedUser = user;
				setTimeout(()=>{
					this.cdr.detectChanges();
				},1000);
			}
		})
		this.profileMenus = [
			{
				'label':'Account',
				'slug':'profile',
				'link':'/user-management/profile',
				'icon':'person'
			},
		];
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