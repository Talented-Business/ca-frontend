// Angular
import { Component, OnInit,OnDestroy,ChangeDetectorRef } from '@angular/core';
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
	selector: 'kt-admin-dashboard',
	templateUrl: './admin-dashboard.component.html',
})
export class AdminDashboardComponent implements OnInit, OnDestroy {
	loadingSubject = new BehaviorSubject<boolean>(true);
	loading$: Observable<boolean>;
	departments:{ labels: string[]; datasets: any[] };
	employees:{ labels: string[]; datasets: any[] };
	fees:any;
	loginedUser:any;
	years:number[] = [];
	year:number;
	// Subscriptions
	private subscriptions: Subscription[] = [];

	constructor(
		private layoutConfigService: LayoutConfigService,
		private configService: ConfigService,
		private cdr: ChangeDetectorRef
		) {
	}

	ngOnInit(): void {
		let currentYear:number = new Date().getFullYear();
		let i;
		for(i = currentYear;i>2018;i--){
			this.years.push(i);
		}
		this.year = currentYear;
		this.loading$ = this.loadingSubject.asObservable();
		this.loadingSubject.next(true);
		this.loadDashboardList();
	}
	/**
	 * On Destroy
	 */
	ngOnDestroy() {
		this.subscriptions.forEach(el => el.unsubscribe());
	}
	loadDashboardList(){
		this.configService.getDashboard(this.year).subscribe(res=>{
			if(res){
				this.departments = { 
					labels:res.departments.labels, 
					datasets: [
							{
								//label: '# of Votes',
								backgroundColor: [
									"olive",
									"yellow",
									"green",
									"orange",
									"blue",
									"purple",
									"grey",
									"brown",
									"pink",
									"tan",
									"blank",
								],
								data: res.departments.data
							}
						]
				};
				this.employees = { 
					labels: ['Male', 'Female'],
					datasets: [
						{
							//label: '# of Votes',
							backgroundColor: [
								"yellow",
								"blue"
							],
							data: res.employees
						}
					]
				};
				this.fees = {
					labels: res.invoices.labels,
					datasets: [
						{
							label:'Invoice',
							backgroundColor: this.layoutConfigService.getConfig('colors.state.success'),
							data: res.invoices.invoices
						},
						{
							label:'Management fee',
							backgroundColor: this.layoutConfigService.getConfig('colors.state.primary'),
							data: res.invoices.fees
						}
					]
				};	
				this.cdr.detectChanges();
			}
			this.loadingSubject.next(false);			
		});		
		this.loadingSubject.next(false);	
	}
}
