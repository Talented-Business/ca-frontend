// Angular
import { Component, OnInit, Inject, ChangeDetectionStrategy, ViewEncapsulation, OnDestroy,ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators,FormControl } from '@angular/forms';
// Material
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

// Services and Models
import { 
	InvoiceItemModel, 
	InvoiceItemService, 
} from '../../../../../core/humanresource';

@Component({
	// tslint:disable-next-line:component-selector
	selector: 'kt-invoice-item-add',
	templateUrl: './invoice-item-add.dialog.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
	encapsulation: ViewEncapsulation.None
})
export class InvoiceItemAddDialogComponent implements OnInit, OnDestroy {
	// Public properties
	invoiceItem: InvoiceItemModel;
	invoiceItemForm: FormGroup;
	hasFormErrors: boolean = false;
	viewLoading:boolean;

	// Private properties

	/**
	 * Component constructor
	 *
	 * @param dialogRef: MatDialogRef<InvoiceItemAddDialogComponent>
	 * @param fb: FormBuilder
	 * @param store: Store<AppState>
	 * @param typesUtilsService: TypesUtilsService
	 */
	constructor(
		public dialogRef:MatDialogRef<InvoiceItemAddDialogComponent>,
		private invoiceItemFB: FormBuilder,
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
		this.createForm();
	}

	/**
	 * On destroy
	 */
	ngOnDestroy() {
	}

	/**
	 * Returns page title
	 */
	getTitle(): string {

		return 'New InvoiceItem';
	}
	
	/**
	 * Create form
	 */
	createForm() {
		this.invoiceItemForm = this.invoiceItemFB.group({
			//employee_id: [this.invoiceItem.employee_id, Validators.required],
			task: ["", [Validators.required]],
            description: ["", [Validators.required]],
            rate: [""],
			amount: ["", [Validators.required]],
		});
	}

	/**
	 * Save data
	 *
	 */
	onSubmit() {
		this.hasFormErrors = false;
		const controls = this.invoiceItemForm.controls;
		/** check form */
		if (this.invoiceItemForm.invalid) {
			Object.keys(controls).forEach(controlName =>
				controls[controlName].markAsTouched()
			);

			this.hasFormErrors = true;
			return;
		}
		// tslint:disable-next-line:prefer-const
		let editedInvoiceItem = this.prepareInvoiceItem();
		this.dialogRef.close(editedInvoiceItem);

	}

	/**
	 * Returns object for saving
	 */
	prepareInvoiceItem(): any {
		const controls = this.invoiceItemForm.controls;
		const _invoiceItem:any = {};
		_invoiceItem.task = controls['task'].value;
        _invoiceItem.description = controls['description'].value;
        _invoiceItem.rate = controls['rate'].value;
        _invoiceItem.amount = controls['amount'].value;
        if(_invoiceItem.rate)_invoiceItem.total = _invoiceItem.rate * _invoiceItem.amount;
        else _invoiceItem.total = _invoiceItem.amount;
		return _invoiceItem;
	}

	validateNumber(e: any) {
		let input = e.target.value;
		let keyCode = String.fromCharCode(e.charCode);
		
		const regValue = /^\d*\.?\d{0,2}$/;
		const regKey = /^[0-9\.]$/;
		if (!regValue.test(input)) {
		  e.preventDefault();
		}
		if (!regKey.test(keyCode)) {
			e.preventDefault();
		}
	}

	/** Alect Close event */
	onAlertClose($event) {
	}
}