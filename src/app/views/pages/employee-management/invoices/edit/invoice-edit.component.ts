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
import { InvoiceItemAddDialogComponent } from '../add/invoice-item-add.dialog.component';
// CRUD
import { LayoutUtilsService,MessageType } from '../../../../../core/_base/crud';

// Services and Models
import { 
	InvoiceModel, 
	CompanyModel,
	selectInvoicesActionLoading,
	InvoiceOnServerCreated,
	selectLastCreatedInvoiceId,
	InvoiceOnServerUpdated,
	CompanyService,
	InvoiceItemService,
	InvoiceService,
	selectInvoiceById,
	selectInvoicesBackProcessingFailed, 
	selectInvoicesBackProcessingSuccess,
} from '../../../../../core/humanresource';
@Component({
	// tslint:disable-next-line:component-selector
	selector: 'kt-invoice-edit',
	templateUrl: './invoice-edit.component.html',
	styleUrls:['./invoice-edit.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
	encapsulation: ViewEncapsulation.None
})
export class InvoiceEditComponent implements OnInit, OnDestroy {
	// Public properties
	invoice: InvoiceModel;
	invoiceForm: FormGroup;
	hasFormErrors: boolean = false;
	viewLoading: boolean = false;
	companies:CompanyModel[];
	statuses:any;
	invoiceItems:any[];
	company_id:number;
	companyCtrl:FormControl = new FormControl();
	filteredCompanies: Observable<CompanyModel[]>;

	// Private properties
	private componentSubscriptions: Subscription[]=[];

	/**
	 * Component constructor
	 *
	 * @param fb: FormBuilder
	 * @param store: Store<AppState>
	 * @param typesUtilsService: TypesUtilsService
	 */
	constructor(
		private activatedRoute: ActivatedRoute,
		private store: Store<AppState>,
		private router: Router,
		private invoiceFB: FormBuilder,
		private companyService:CompanyService,
		private invoiceItemService:InvoiceItemService,
		private layoutUtilsService: LayoutUtilsService,
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
		this.activatedRoute.params.subscribe(params => {
			const id = params['id'];
			if (id && id > 0) {

				this.store.pipe(
					select(selectInvoiceById(id))
				).subscribe(result => {
					if (!result) {
						this.loadInvoiceFromService(id);
						return;
					}
					this.loadInvoice(result);
				});
			} else {
				let newInvoice = new InvoiceModel;
				this.loadInvoice(newInvoice);
			}
		});

		this.store.pipe(select(selectInvoicesActionLoading)).subscribe(res => this.viewLoading = res);
		this.companyService.getAllCompanies().subscribe(
			res=>{
				this.companies = res;
				this.filteredCompanies = this.companyCtrl.valueChanges
				.pipe(
				  startWith(''),
				  map(value => typeof value === 'string' ? value : value.name),
				  map(name => name ? this._filterCompanies(name) : this.companies.slice())
				);
				this.cdr.detectChanges();
			}
		);
		const updateSuccessSubscription = this.store.pipe(
			select(selectInvoicesBackProcessingSuccess),
			delay(1000), // Remove this line
		).subscribe(res => {
			if (!res) {
				return;
			}
			const message = `Invoice successfully has been saved.`;
			this.layoutUtilsService.showActionNotification(message, MessageType.Update, 10000, true, true);
			//this.refreshEmployee(false);
			//setTimeout(()=>{
				this.router.navigate(['/employee-management/billings'], { relativeTo: this.activatedRoute });
			//},100);	
		});
		this.componentSubscriptions.push(updateSuccessSubscription);
		const updateFailedSubscription = this.store.pipe(
			select(selectInvoicesBackProcessingFailed),
			delay(1000), // Remove this line
		).subscribe(res => {
			if (!res) {
				return;
			}
			if(res){
				this.hasFormErrors=true;
			}
			this.viewLoading = false;
			this.cdr.detectChanges();
		});	
		this.componentSubscriptions.push(updateFailedSubscription);	

	}
	private _filterCompanies(value: string): CompanyModel[] {
		const filterValue = value.toLowerCase();	
		return this.companies.filter(invoice => invoice.name.toLowerCase().indexOf(filterValue) === 0);
	}
	loadInvoiceFromService(invoiceId:number){
		this.invoiceService.getInvoiceById(invoiceId).subscribe(res => {
			this.loadInvoice(res, true);
		});
	}
	loadInvoice(_invoice, fromService: boolean = false) {
		if (!_invoice) {
			this.goBack('');
		}
		this.invoice = _invoice;
		if(this.invoice.id == undefined){
			this.invoice.invoicing_date =  new Date();
			this.invoice.start_date =  new Date();
			this.invoice.end_date =  new Date(this.invoice.start_date.getTime() + 6 * 24 * 60 * 60 * 1000);
		}else{
			this.company_id = this.invoice.company_id;
			this.companyCtrl.setValue(this.invoice.company);
			this.invoiceItems = JSON.parse(JSON.stringify(this.invoice.items));
		}
		this.createForm();
		if (fromService) {
			this.cdr.detectChanges();
		}
	}
	/**
	 * Go back to the list
	 *
	 * @param id: any
	 */
	goBack(id) {
		//this.loadingSubject.next(false);
		const url = `../billings`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}
	goBackWithoutId	() {
		this.router.navigateByUrl('/employee-management/billings', { relativeTo: this.activatedRoute });
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
		if (this.invoice.id > 0) {
			return `Update Invoice ${this.invoice.id}`;
		}

		return 'New Invoice';
	}
	
	/**
	 * Create form
	 */
	createForm() {
		this.invoiceForm = this.invoiceFB.group({
			invoicing_date: [this.invoice.invoicing_date, Validators.required],
			start_date: [this.invoice.start_date, Validators.required],
			end_date: [this.invoice.end_date, Validators.required],
		});
	}

	/**
	 * Save data
	 *
	 */
	onSubmit(status:boolean) {
		this.hasFormErrors = false;
		const controls = this.invoiceForm.controls;
		/** check form */
		if (this.invoiceForm.invalid) {
			Object.keys(controls).forEach(controlName =>
				controls[controlName].markAsTouched()
			);

			this.hasFormErrors = true;
			return;
		}
		if(controls['start_date'].value>controls['end_date'].value){
			controls['end_date'].setErrors({'incorrect': true,'required':true});
			controls['end_date'].markAsTouched()
			this.hasFormErrors = true;
			return;
		}
		let invoiceItem = this.invoiceItems.find((item)=>{
			if(item.task=="") return item;
			if(item.description=="") return item;
			if(item.total==null) return item;
		});
		if(invoiceItem){
			this.hasFormErrors = true;
			this.cdr.detectChanges();
			return;
		}
		// tslint:disable-next-line:prefer-const
		let editedInvoice = this.prepareInvoice(status);
		if(editedInvoice.id>0)this.updateInvoice(editedInvoice);
		else this.createInvoice(editedInvoice);
		//goback list;
	}
	/**
	 * Checking control validation
	 *
	 * @param controlName: string => Equals to formControlName
	 * @param validationType: string => Equals to valitors name
	 */
	isControlHasError(i:number,controlName: string, validationType: string): boolean {
		if(this.invoiceItems[i][controlName] == "")return true;
		return false;
	}
	companyFocusOut(){
		let nameValue = this.companyCtrl.value;
		if(typeof nameValue == 'string' && nameValue!=null&&nameValue!="" ){
			setTimeout(()=>{
				nameValue = this.companyCtrl.value;
				const filterValue = nameValue.toLowerCase();
				let company = this.companies.find((item)=>{
					return item.name.toLowerCase().indexOf(filterValue)===0;
				});
				if(company){
					this.company_id = company.id;
					this.companyCtrl.setValue(company);
				}else{
					this.companyCtrl.setValue("");
				}
			},150);
		}
	}
	selected($event, company:CompanyModel) {
		this.company_id = company.id;
	}	
	getDisplayFn(company?: CompanyModel): string | undefined {
		return company ? company.name: undefined;
	}

	findInvoiceItems(){
		//from to company_id
		this.viewLoading = true;
		let start_date,end_date;
		if(this.invoiceForm.controls['start_date'].value.toDateString == undefined){
			start_date = this.invoiceForm.controls['start_date'].value;
		}else{
			start_date = this.invoiceForm.controls['start_date'].value.toDateString();
		}
		if(this.invoiceForm.controls['end_date'].value.toDateString == undefined){
			end_date = this.invoiceForm.controls['end_date'].value;
		}else{
			end_date = this.invoiceForm.controls['end_date'].value.toDateString();
		}
		this.invoiceItemService.getInvoiceItemsFromWorksnap(start_date,end_date,this.company_id).subscribe(
			res=>{
				if(this.invoiceItems){
					res.forEach((newItem:any,index)=>{
						let number = this.invoiceItems.findIndex((oldItem)=>{
							return oldItem.slug == newItem.slug;
						});
						if(number>-1){
							this.invoiceItems[number].rate = newItem.rate;
							this.invoiceItems[number].amount = newItem.amount;
							this.invoiceItems[number].total = newItem.total;
						}else{
							this.invoiceItems.splice(index,0,newItem);
						}
					});
				}
				else this.invoiceItems = res;
				this.viewLoading = false;
				this.cdr.detectChanges();
			}
		)

	}
	amountChanged(index, amount){
		if(this.invoiceItems[index].rate){
			this.invoiceItems[index].total = amount * this.invoiceItems[index].rate;
		}else{
			this.invoiceItems[index].total = amount;
		}
	}
	calculateTotal():number{
		if(this.invoiceItems){
			let total = this.invoiceItems.reduce(function(total,item){
				return parseFloat(total) + parseFloat(item.total);
			},0);
			return total;
		}
		return 0;
	}
	addInvoiceItem(){
		/*let config = {
			panelClass: 'full-screen-modal',
		  };		
		const dialogRef = this.dialog.open(InvoiceItemAddDialogComponent, config);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}
			if(this.invoiceItems==undefined)this.invoiceItems = [];
			this.invoiceItems.push(res);
			this.cdr.detectChanges();
		});*/
		let invoice = {task:'Other',description:'',amount:0,'total':0}
		if(this.invoiceItems==undefined)this.invoiceItems = [];
		this.invoiceItems.push(invoice);
	}
	deleteInvoiceItem(index){
		this.invoiceItems.splice(index,1);
	}
	/**
	 * Returns object for saving
	 */
	prepareInvoice(status:boolean): InvoiceModel {
		const controls = this.invoiceForm.controls;
		const _invoice = new InvoiceModel();
		_invoice.id = this.invoice.id;
		_invoice.invoicing_date = controls['invoicing_date'].value;
		_invoice.company_id = this.company_id;
		if(controls['start_date'].value.toDateString == undefined){
			_invoice.start_date = controls['start_date'].value;
		}else{
			_invoice.start_date = controls['start_date'].value.toDateString();
		}
		if(controls['end_date'].value.toDateString == undefined){
			_invoice.end_date = controls['end_date'].value;
		}else{
			_invoice.end_date = controls['end_date'].value.toDateString();
		}
		_invoice.items = this.invoiceItems;
		if(status)_invoice.status = "Proforma";
		else _invoice.status = "Draft";
		_invoice.total = this.calculateTotal();
		return _invoice;
	}

	/**
	 * Update invoice
	 *
	 * @param _invoice: InvoiceModel
	 */
	updateInvoice(_invoice: InvoiceModel) {
		const updateInvoice: Update<InvoiceModel> = {
			id: _invoice.id,
			changes: _invoice
		};
		this.store.dispatch(new InvoiceOnServerUpdated({
			partialInvoice: updateInvoice,
			invoice: _invoice
		}));

		// Uncomment this line
		// this.dialogRef.close({ _invoice, isEdit: true }
	}
	/**
	 * Create invoice
	 *
	 * @param _invoice: InvoiceModel
	 */
	createInvoice(_invoice: InvoiceModel) {
		this.store.dispatch(new InvoiceOnServerCreated({ invoice: _invoice }));
	}

	/** Alect Close event */
	onAlertClose($event) {
	}
}