// Angular
import { Component, OnInit,OnDestroy } from '@angular/core';
// Lodash
import { shuffle } from 'lodash';
// Services
// Widgets model
import { LayoutConfigService, SparklineChartOptions } from '../../../core/_base/layout';
// RXJS
import { debounceTime, distinctUntilChanged, tap, skip, take, delay } from 'rxjs/operators';
import { fromEvent, merge, Observable, of, Subscription } from 'rxjs';

// NGRX
import { Store, select } from '@ngrx/store';
import { AppState } from '../../../core/reducers';
import { currentUser } from '../../../core/auth';
@Component({
	selector: 'kt-dashboard',
	templateUrl: './dashboard.component.html',
	styleUrls: ['dashboard.component.scss'],
})
export class DashboardComponent implements OnInit, OnDestroy {
	companyId$: Observable<number>;
	employeeId$: Observable<number>;
	loginedUser:any;
	// Subscriptions
	private subscriptions: Subscription[] = [];

	constructor(
		private layoutConfigService: LayoutConfigService,
		private store: Store<AppState>,
		) {
	}

	ngOnInit(): void {
		const subscription = this.store.select(currentUser).subscribe(user=>{
			if(user !=undefined){
				this.loginedUser = user;
				if(this.loginedUser.type=="company")this.companyId$ = of(this.loginedUser.company.id);
				if(this.loginedUser.type=="member" || this.loginedUser.type=="employee")this.employeeId$ = of(this.loginedUser.member.id);
			}
		})
		this.subscriptions.push(subscription);
	}
	/**
	 * On Destroy
	 */
	ngOnDestroy() {
		this.subscriptions.forEach(el => el.unsubscribe());
	}
}
