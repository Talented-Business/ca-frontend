// Angular
import { Component, OnInit,OnDestroy,Input,ChangeDetectorRef } from '@angular/core';
// Lodash
import { shuffle } from 'lodash';
// Services
// Widgets model
import { LayoutConfigService, SparklineChartOptions } from '../../../../core/_base/layout';
// RXJS
import { debounceTime, distinctUntilChanged, tap, skip, take, delay } from 'rxjs/operators';
import { BehaviorSubject, merge, Observable, of, Subscription } from 'rxjs';
import {
	ConfigService,
} from '../../../../core/humanresource';

@Component({
	selector: 'kt-company-dashboard',
	templateUrl: './company-dashboard.component.html',
})
export class CompanyDashboardComponent implements OnInit, OnDestroy {
	loadingSubject = new BehaviorSubject<boolean>(true);
	loading$: Observable<boolean>;
	requests:any=[];
    applicants:any=[];
    invoices:any=[];
	// Subscriptions
	private subscriptions: Subscription[] = [];

	constructor(
		private layoutConfigService: LayoutConfigService,
		private configService: ConfigService,
		private cdr: ChangeDetectorRef
		) {
	}

	ngOnInit(): void {
		this.loading$ = this.loadingSubject.asObservable();
		this.loadingSubject.next(true);
		this.loadCompanyDashboardList();
	}
	/**
	 * On Destroy
	 */
	ngOnDestroy() {
		this.subscriptions.forEach(el => el.unsubscribe());
	}
	loadCompanyDashboardList(){
		this.configService.getDashboard(2019).subscribe(res=>{
			if(res){
				this.requests = res.requests;
				this.applicants = res.applicants;
				this.invoices = res.invoices;
				this.cdr.detectChanges();
			}
			this.loadingSubject.next(false);			
		});
	}
}
