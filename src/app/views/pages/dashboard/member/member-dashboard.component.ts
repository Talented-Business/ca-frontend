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
import { environment } from '../../../../../environments/environment';
@Component({
	selector: 'kt-member-dashboard',
	templateUrl: './member-dashboard.component.html',
})
export class MemberDashboardComponent implements OnInit, OnDestroy {
	loadingSubject = new BehaviorSubject<boolean>(true);
	loading$: Observable<boolean>;
	requests:any[]=[];
	hours:string;
	// Subscriptions
	private subscriptions: Subscription[] = [];
	private hostingUrl:string;

	constructor(
		private layoutConfigService: LayoutConfigService,
		private configService: ConfigService,
		private cdr: ChangeDetectorRef
		) {
		this.hostingUrl = environment.host_url;		
	}

	ngOnInit(): void {
		this.loading$ = this.loadingSubject.asObservable();
		this.loadingSubject.next(true);
		this.loadMemberDashboardList();
	}
	/**
	 * On Destroy
	 */
	ngOnDestroy() {
		this.subscriptions.forEach(el => el.unsubscribe());
	}
	loadMemberDashboardList(){
		this.configService.getDashboard(2019).subscribe(res=>{
			if(res){
				this.requests = res.requests;
				this.hours = res.hours;
				this.cdr.detectChanges();
			}
			this.loadingSubject.next(false);			
		});
	}
	checkImage(url:string){
		return(url && url.match(/\.(jpeg|jpg|gif|png)$/) != null);
	}
}
