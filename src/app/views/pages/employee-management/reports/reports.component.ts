// Angular
import { Component, OnInit, Inject, ChangeDetectionStrategy, ViewEncapsulation, OnDestroy,ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
// Material
import { MatDialog, } from '@angular/material';
// RxJS
import { Observable,BehaviorSubject,Subscription, of } from 'rxjs';
// Services and Models
import { LayoutUtilsService, MessageType, QueryParamsModel } from '../../../../core/_base/crud';
import { 
	ConfigService,
	InvoiceModel,
	InvoiceService,
} from '../../../../core/humanresource';

@Component({
	// tslint:disable-next-line:component-selector
	selector: 'kt-reports',
	templateUrl: './reports.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
	encapsulation: ViewEncapsulation.None
})
export class ReportsComponent implements OnInit, OnDestroy {
	// Public properties
	config:any;
	invoice_id:number;
	invoices:InvoiceModel[]=[];
	years:number[] = [];
	year:number;
	monthYear:number;
	month:number;
	// Private properties
	private componentSubscriptions: Subscription;
	private viewStatus:any;
	private companyStatus:String;

	/**
	 * Component constructor
	 *
	 */
	constructor(
		private layoutUtilsService: LayoutUtilsService,
		private cdr: ChangeDetectorRef,
		private configservice:ConfigService,
		private invoiceService:InvoiceService,
		) {
	}
	loadSetting(){
		this.invoiceService.getAllInvoices().subscribe(
			res=>{
				this.invoices = res;
				if(this.invoices[0])this.invoice_id = this.invoices[0].id;
				this.cdr.detectChanges();
			}
		)
	}
	/**
	 * @ Lifecycle sequences => https://angular.io/guide/lifecycle-hooks
	 */

	/**
	 * On init
	 */
	ngOnInit() {
		this.loadSetting();
		let currentYear:number = new Date().getFullYear();
		let i;
		for(i = currentYear;i>2018;i--){
			this.years.push(i);
		}
		this.year = currentYear;
		this.monthYear = currentYear;
		this.month = 1;
	}

	/**
	 * On destroy
	 */
	ngOnDestroy() {
	}
	onExport(action:string){
		this.configservice.export(action).subscribe(data => this.downloadFile(data));
	}
	onExportOnInvoice(){
		if(this.invoice_id==undefined){
			alert('please select invoice');
			return;
		}
		let action = 'payroll?id='+this.invoice_id;
		this.configservice.export(action).subscribe(data => this.downloadFile(data));
	}
	onExportRevenueMonth(){
		let action = 'revenueMonth?year='+this.monthYear+"&month="+this.month;
		this.configservice.export(action).subscribe(data => this.downloadFile(data));
	}
	onExportRevenue(){
		let action = 'revenue?year='+this.year;
		this.configservice.export(action).subscribe(data => this.downloadFile(data));
	}
	downloadFile(data: any) {
		/*const blob = new Blob([data], { type: '' });
		const url= window.URL.createObjectURL(blob);
		window.open(url);*/
	}
	/** Alect Close event */
	onAlertClose($event) {
	}
}