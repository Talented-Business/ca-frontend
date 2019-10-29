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

// Services and Models
import { 
	InvoiceModel, 
	CompanyModel,
	selectInvoicesActionLoading,
	InvoiceOnServerUpdated,
	InvoiceService,
} from '../../../../../core/humanresource';
@Component({
	// tslint:disable-next-line:component-selector
	selector: 'kt-invoice-read-dialog',
	templateUrl: './invoice-read.dialog.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
	encapsulation: ViewEncapsulation.None
})
export class InvoiceReadDialogComponent implements OnInit, OnDestroy {
	// Public properties
	invoice: InvoiceModel;
	viewLoading: boolean = false;
	statuses:any;

	// Private properties
	private componentSubscriptions: Subscription[]=[];
	private company_id:number;

	/**
	 * Component constructor
	 *
	 * @param dialogRef: MatDialogRef<InvoiceReadDialogComponent>
	 * @param fb: FormBuilder
	 * @param store: Store<AppState>
	 * @param typesUtilsService: TypesUtilsService
	 */
	constructor(
		@Inject(MAT_DIALOG_DATA) public data: any,
		public dialogRef:MatDialogRef<InvoiceReadDialogComponent>,
		private store: Store<AppState>,
		private invoiceService:InvoiceService,
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
		this.store.pipe(select(selectInvoicesActionLoading)).subscribe(res => this.viewLoading = res);
		this.invoice = this.data.invoice;
	}
	/**
	 * On destroy
	 */
	ngOnDestroy() {
		this.componentSubscriptions.forEach(el => el.unsubscribe());
	}

	/**
	 * Returns page title
	 */
	getTitle(): string {
		let label = "Invoice ";
		/*if(this.invoice.status == "Invoice" || this.invoice.status == "Proforma"){
			label 
		}*/
		return label+this.invoice.id.toString();
	}
	convert(status:string){
		switch (status) {
			case 'Proforma':
				return 'Proforma';
			case 'Invoice':
				return 'Approved';
			case 'Recheck':
				return 'Recheck';
			case 'Paid':
				return 'Paid';
			default:
				return 	status;	
		}
	}

	/**
	 *  approve
	 *
	 */
	updateStatus(status:string) {
		let invoice:InvoiceModel = new InvoiceModel;
		invoice.id = this.invoice.id;
		invoice.status = status;
		this.invoiceService.updateInvoice(invoice).pipe().subscribe();
		this.dialogRef.close(status);
	}

	/** Alect Close event */
	onAlertClose($event) {
	}
}