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
	DepartmentModel,
	AttributeModel, 
	ConfigService,
} from '../../../../core/humanresource';
import { SettingEditDialogComponent } from './edit/setting-edit.dialog.component';

@Component({
	// tslint:disable-next-line:component-selector
	selector: 'kt-settings',
	templateUrl: './settings.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
	encapsulation: ViewEncapsulation.None
})
export class SettingsComponent implements OnInit, OnDestroy {
	// Public properties
	config:any;
	// Private properties
	private componentSubscriptions: Subscription;
	private viewStatus:any;
	private companyStatus:String;

	/**
	 * Component constructor
	 *
	 */
	constructor(
		public dialog: MatDialog,
		private configservice:ConfigService,
		private layoutUtilsService: LayoutUtilsService,
		private cdr: ChangeDetectorRef,
		) {
		this.config = {
			worksnap_api_key:"",
			company_fee:"",
			member_fee:"",
		};
		this.loadSetting();
	}
	loadSetting(){
		this.configservice.getAll().subscribe(
			res => {
				if(res.worksnap_api_key)this.config.worksnap_api_key = res.worksnap_api_key;
				if(res.company_fee)this.config.company_fee = res.company_fee;
				if(res.member_fee)this.config.member_fee = res.member_fee;
				this.cdr.detectChanges();
			}
		);
	}
	/**
	 * @ Lifecycle sequences => https://angular.io/guide/lifecycle-hooks
	 */

	/**
	 * On init
	 */
	ngOnInit() {
	}

	/**
	 * On destroy
	 */
	ngOnDestroy() {
	}
	openForm(){
		let _saveMessage;
		const _messageType = MessageType.Update;
		_saveMessage='The setting has been updated successfully';
		let config = {
			width: '68vw',
			'margin-right':'auto',
			'margin-left':'auto',
			panelClass: 'full-screen-modal',
			data:{config:this.config}
		  };		
		const dialogRef = this.dialog.open(SettingEditDialogComponent, config);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}

			this.layoutUtilsService.showActionNotification(_saveMessage, _messageType,500,true,false);
			this.loadSetting();
		});
	}

	/** Alect Close event */
	onAlertClose($event) {
	}
}