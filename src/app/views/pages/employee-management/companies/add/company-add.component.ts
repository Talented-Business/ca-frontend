// Angular
import { Component, OnInit, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef,ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
// Material
import { MatDialog } from '@angular/material';
// RxJS
import { Observable, BehaviorSubject, Subscription, of } from 'rxjs';
// RxJS
import { tap,catchError } from 'rxjs/operators';
import {MatInput} from '@angular/material/input';
import { LayoutUtilsService, TypesUtilsService,MessageType } from '../../../../../core/_base/crud';
// Services and Models
import {
	CompanyModel,
	CompanyService,
} from '../../../../../core/humanresource';

@Component({
	// tslint:disable-next-line:component-selector
	selector: 'company-add',
	templateUrl: './company-add.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CompanyAddComponent implements OnInit {
	// Public properties
	company: CompanyModel;
	oldCompany: CompanyModel;
	selectedTab: number = 0;
	loadingSubject = new BehaviorSubject<boolean>(true);
	loading$: Observable<boolean>;
	companyForm: FormGroup;
	hasFormErrors: boolean = false;
	availableYears: number[] = [];
	filteredColors: Observable<string[]>;
	filteredManufactures: Observable<string[]>;
	availableNationalities:string[];
	// sticky portlet header margin
	
	/**
	 * Component constructor
	 *
	 * @param companyFB: FormBuilder
	 */
	constructor(
		private companiesService:CompanyService,
		private companyFB: FormBuilder,
		private route:Router,
		private layoutUtilsService: LayoutUtilsService,
		) {
		this.oldCompany =  new CompanyModel;
		this.oldCompany.clear();
	}

	/**
	 * @ Lifecycle sequences => https://angular.io/guide/lifecycle-hooks
	 */

	/**
	 * On init
	 */
	ngOnInit() {
        this.loading$ = this.loadingSubject.asObservable();
        this.reset();
		this.loadingSubject.next(false);
	}


	/**
	 * Init company
	 */
	initCompany() {
		this.createForm();
		this.loadingSubject.next(false);
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




	/**
	 * Reset
	 */
	reset() {
		this.company = Object.assign({}, this.oldCompany);
		this.createForm();
		this.hasFormErrors = false;
	}

	/**
	 * Save data
	 *
	 * @param withBack: boolean
	 */
	onSumbit(withBack: boolean = false) {
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

		this.addCompany(editedCompany, withBack);
	}

	/**
	 * Returns object for saving
	 */
	prepareCompany(): CompanyModel {
		const controls = this.companyForm.controls;
		const _company = new CompanyModel();
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
		_company.document_signature_date = controls['document_signature_date'].value;
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

	/**
	 * Add company
	 *
	 * @param _company: CompanyModel
	 * @param withBack: boolean
	 */
	addCompany(_company: CompanyModel, withBack: boolean = false) {
		this.loadingSubject.next(false);
		this.companiesService.createCompany(_company).pipe(
			tap(res => {
				console.log(res);
			}),
			catchError(this.handleError<CompanyModel>('addCompany'))
		).subscribe(res=>{
			
			if(res.status == 'failed'){
				this.hasFormErrors=true;
			}else if(res.status =='ok'){
				const _saveMessage = `you has just be created company successfully`;
				this.layoutUtilsService.showActionNotification(_saveMessage, MessageType.Create, 10000, true, false);
				this.loadingSubject.next(true);
				const url = `/employee-management/companies`;
				this.route.navigateByUrl(url);		
			}
		});		
	}

  /**
   * Handle Http operation that failed.
   * Let the app continue.
   * @param operation - name of the operation that failed
   * @param result - optional value to return as the observable result
   */
  private handleError<T> (operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {

      // TODO: send the error to remote logging infrastructure
      console.error(error); // log to console instead

      // TODO: better job of transforming error for user consumption
      console.log(`${operation} failed: ${error.message}`);

      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }  
  goBackWithoutId	() {
	this.route.navigateByUrl('/employee-management/companies');
  }

	/**
	 * Returns component title
	 */
	getComponentTitle() {
		let result = 'Create new company';
		return result;
	}

	/**
	 * Close alert
	 *
	 * @param $event
	 */
	onAlertClose($event) {
		this.hasFormErrors = false;
	}
}
