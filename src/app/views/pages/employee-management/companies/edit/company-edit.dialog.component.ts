// Angular
import { Component, OnInit, Inject, ChangeDetectionStrategy, ViewEncapsulation, OnDestroy,ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
// Material
import { MatDialog,MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
// RxJS
import { Observable,BehaviorSubject,Subscription, of } from 'rxjs';
// Services and Models
import { 
	AttributeModel,
	CompanyModel, 
} from '../../../../../core/humanresource';

@Component({
	// tslint:disable-next-line:component-selector
	selector: 'kt-companies-edit',
	templateUrl: './company-edit.dialog.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
	encapsulation: ViewEncapsulation.None
})
export class CompanyEditDialogComponent implements OnInit, OnDestroy {
	// Public properties
	company: CompanyModel;
	companyId$: Observable<number>;
	selectedTab: number = 0;
	companyForm: FormGroup;
	hasFormErrors: boolean = false;
	availableNationalities:string[];
    attributes:AttributeModel[];
    addAttribute:AttributeModel;
    tags:AttributeModel[];

	// Private properties
	private componentSubscriptions: Subscription;
	private viewStatus:any;
	private companyStatus:String;

	/**
	 * Component constructor
	 *
	 * @param dialogRef: MatDialogRef<CompanyEditDialogComponent>
	 * @param fb: FormBuilder
	 * @param store: Store<AppState>
	 * @param typesUtilsService: TypesUtilsService
	 */
	constructor(
		@Inject(MAT_DIALOG_DATA) public data: any,
		private dialogRef:MatDialogRef<CompanyEditDialogComponent>,
		private companyFB: FormBuilder,
		) {
	}

	/**
	 * @ Lifecycle sequences => https://angular.io/guide/lifecycle-hooks
	 */

	/**
	 * On init
	 */
	ngOnInit() {
		this.company = this.data.company;
		this.createForm();
	}

	/**
	 * On destroy
	 */
	ngOnDestroy() {
		if (this.componentSubscriptions) {
			this.componentSubscriptions.unsubscribe();
		}
	}

	/**
	 * Returns page title
	 */
	getTitle(): string {
		if (this.company.id > 0) {
			return `Edit company '${this.company.name}'`;
		}

		return 'New company';
	}

	/**
	 * Create form
	 */
	createForm() {
		this.companyForm = this.companyFB.group({
			name: [this.company.name, Validators.required],
			website: [this.company.website, Validators.required],
			state_incoporation: [this.company.state_incoporation, Validators.required],
			entity_type: [this.company.entity_type, Validators.required],
			industry: [this.company.industry, Validators.required],
			size: [this.company.size, Validators.required],
			description: [this.company.description],
			headquaters_addresses: [this.company.headquaters_addresses, Validators.required],
			legal_address: [this.company.legal_address, Validators.required],
			billing_address: [this.company.billing_address, Validators.required],
			document_agreement: [this.company.document_agreement, Validators.required],
			document_signed_by: [this.company.document_signed_by, Validators.required],
			document_signature_date: [this.company.document_signature_date, Validators.required],
			bank_name: [this.company.bank_name, Validators.required],
			bank_account_name: [this.company.bank_account_name, Validators.required],
			bank_account_number: [this.company.bank_account_number, Validators.required],
			admin_first_name: [this.company.admin_first_name],
			admin_last_name: [this.company.admin_last_name],
			admin_email: [this.company.admin_email],
			admin_phone_number: [this.company.admin_phone_number],
			admin_level: [this.company.admin_level],
		});
	}



	/** ACTIONS */

	/**
	 * Save data
	 *
	 */
	onSubmit() {
		this.hasFormErrors = false;
		const controls = this.companyForm.controls;
		/** check form */
		if (this.companyForm.invalid) {
			Object.keys(controls).forEach(controlName =>
				controls[controlName].markAsTouched()
			);

			this.hasFormErrors = true;
			return;
		}

		// tslint:disable-next-line:prefer-const
		let editedCompany = this.prepareCompany();
		this.dialogRef.close(editedCompany);
	}

	/**
	 * Returns object for saving
	 */
	prepareCompany(): CompanyModel {
		const controls = this.companyForm.controls;
		const _company = new CompanyModel();
		_company.id = this.company.id;
		_company.name = controls['name'].value;
		_company.website = controls['website'].value;
		_company.state_incoporation = controls['state_incoporation'].value;
		_company.entity_type = controls['entity_type'].value;
		_company.industry = controls['industry'].value;
		_company.size = controls['size'].value;
		_company.description = controls['description'].value;
		_company.headquaters_addresses = controls['headquaters_addresses'].value;
		_company.legal_address = controls['legal_address'].value;
		_company.billing_address = controls['billing_address'].value;
		_company.document_agreement = controls['document_agreement'].value;
		_company.document_signed_by = controls['document_signed_by'].value;
		if(controls['document_signature_date'].value.toDateString == undefined){
			_company.document_signature_date = controls['document_signature_date'].value;
		}else{
			_company.document_signature_date = controls['document_signature_date'].value.toDateString();
		}
		_company.bank_name = controls['bank_name'].value;
		_company.bank_account_name = controls['bank_account_name'].value;
		_company.bank_account_number = controls['bank_account_number'].value;
		_company.admin_first_name = controls['admin_first_name'].value;
		_company.admin_last_name = controls['admin_last_name'].value;
		_company.admin_email = controls['admin_email'].value;
		_company.admin_phone_number = controls['admin_phone_number'].value;
		_company.admin_level = controls['admin_level'].value;
		return _company;
	}


	/** Alect Close event */
	onAlertClose($event) {
	}
}