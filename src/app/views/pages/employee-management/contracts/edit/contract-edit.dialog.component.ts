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
	EmployeeModel,
	CompanyModel,
	ContractModel, 
	DepartmentModel,
	EmployeesService,
	CompanyService,
	selectContractsActionLoading,
	ContractOnServerCreated,
	selectLastCreatedContractId,
	ContractUpdated,
} from '../../../../../core/humanresource';

@Component({
	// tslint:disable-next-line:component-selector
	selector: 'kt-contracts-edit',
	templateUrl: './contract-edit.dialog.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
	encapsulation: ViewEncapsulation.None
})
export class ContractEditDialogComponent implements OnInit, OnDestroy {
	// Public properties
	contract: ContractModel;
	contractForm: FormGroup;
	hasFormErrors: boolean = false;
	viewLoading: boolean = false;
	members:EmployeeModel[]=[];
	departments:DepartmentModel[]=[];
	employeeCtrl:FormControl = new FormControl();
	filteredEmployees: Observable<EmployeeModel[]>;
	companies:CompanyModel[];
	proposal_id:number;
	selectedEmployeeDisplayName:string;
	company_id:number;
	worksnapName:string;
	companyCtrl:FormControl = new FormControl();
	filteredCompanies: Observable<CompanyModel[]>;
	selectedEmployeeId:number;
	proposal_status:string;

	// Private properties
	private componentSubscriptions: Subscription[]=[];

	/**
	 * Component constructor
	 *
	 * @param dialogRef: MatDialogRef<ContractEditDialogComponent>
	 * @param fb: FormBuilder
	 * @param store: Store<AppState>
	 * @param typesUtilsService: TypesUtilsService
	 */
	constructor(
		@Inject(MAT_DIALOG_DATA) public data: any,
		public dialogRef:MatDialogRef<ContractEditDialogComponent>,
		private store: Store<AppState>,
		private employeesService:EmployeesService,
		private companyService:CompanyService,
		private contractFB: FormBuilder,
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
		this.store.pipe(select(selectContractsActionLoading)).subscribe(res => this.viewLoading = res);
		this.contract = this.data.contract;
		if(this.contract.employee_id){
			this.selectedEmployeeDisplayName = this.contract.employee.first_name + ' ' + this.contract.employee.last_name;
			this.selectedEmployeeId = this.contract.employee_id;	
		}
		this.company_id = this.data.company_id;
		this.proposal_id = this.data.proposal_id;
		this.proposal_status = this.data.proposal_status;
		this.createForm();
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
        const departmentSubscrition = this.store.subscribe((state:any)=>{
			this.departments = Object.values(state.departments.entities);
        });		
		this.componentSubscriptions.push(departmentSubscrition);
		this.employeesService.findUnhiredEmployees().pipe(
		).subscribe(res=>this.members = res);		
		this.filteredEmployees = this.employeeCtrl.valueChanges
		.pipe(
		  startWith(''),
		  map(value => typeof value === 'string' ? value : value.first_name),
		  map(name => name ? this._filterEmployees(name) : this.members.slice())
		);
	}
	private _filterEmployees(value: string): EmployeeModel[] {
		const filterValue = value.toLowerCase();	
		return this.members.filter(employee => employee.first_name.toLowerCase().indexOf(filterValue) === 0 || employee.last_name.toLowerCase().indexOf(filterValue) === 0);
	}
	private _filterCompanies(value: string): CompanyModel[] {
		const filterValue = value.toLowerCase();	
		return this.companies.filter(employee => employee.name.toLowerCase().indexOf(filterValue) === 0);
	}
	getDisplayFn(employee?: EmployeeModel): string | undefined {
		return employee ? employee.first_name + ' ' + employee.last_name: undefined;
	}
   
	selected($event, employee:EmployeeModel) {
		this.selectedEmployeeDisplayName = employee.first_name + ' ' + employee.last_name;
		this.selectedEmployeeId = employee.id;
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
	selectedCompany($event, company:CompanyModel) {
		this.company_id = company.id;
	}	
	getDisplayCompanyFn(company?: CompanyModel): string | undefined {
		return company ? company.name: undefined;
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
		if (this.contract.id > 0) {
			return `Edit contract '${this.contract.employee.first_name} ${
				this.contract.employee.last_name
			}`;
		}
		if(this.proposal_id) return `New contract for '${this.selectedEmployeeDisplayName}'`;
		return `New contract`;
	}
	
	/**
	 * Create form
	 */
	createForm() {
		if(this.contract.department_id){
			if(this.company_id){
				this.contractForm = this.contractFB.group({
					start_date: [this.contract.start_date, Validators.required],
					position: [this.contract.position, Validators.required],
					//company_id:[this.contract.company_id, Validators.required],
					department_id: [this.contract.department_id.toString(), Validators.required],
					work_location: [this.contract.work_location, Validators.required],
					employment_type: [this.contract.employment_type, Validators.required],
					employment_status: [this.contract.employment_status, Validators.required],
					manager: [this.contract.manager, Validators.required],
					worksnap_id: [this.contract.worksnap_id, Validators.required],
					pay_days: [this.contract.pay_days, Validators.required],
					deduction_item: [this.contract.deduction_item, Validators.required],
					compensation: [this.contract.compensation, Validators.required],
					hourly_rate: [this.contract.hourly_rate, Validators.required],
					hours_per_day_period: [this.contract.hours_per_day_period, Validators.required],
				});
			}else{
				this.contractForm = this.contractFB.group({
					start_date: [this.contract.start_date, Validators.required],
					position: [this.contract.position, Validators.required],
					//company_id:[this.contract.company_id, Validators.required],
					department_id: [this.contract.department_id.toString(), Validators.required],
					work_location: [this.contract.work_location, Validators.required],
					employment_type: [this.contract.employment_type, Validators.required],
					employment_status: [this.contract.employment_status, Validators.required],
					manager: [this.contract.manager, Validators.required],
					worksnap_id: [this.contract.worksnap_id, Validators.required],
					pay_days: [this.contract.pay_days, Validators.required],
					deduction_item: [this.contract.deduction_item, Validators.required],
					compensation: [this.contract.compensation, Validators.required],
					hourly_rate: [this.contract.hourly_rate, Validators.required],
					hours_per_day_period: [this.contract.hours_per_day_period, Validators.required],
				});	
			}
		}else{
			if(this.company_id){
				this.contractForm = this.contractFB.group({
					start_date: [this.contract.start_date, Validators.required],
					position: [this.contract.position, Validators.required],
					//company_id:[this.contract.company_id, Validators.required],
					department_id: [this.contract.department_id, Validators.required],
					work_location: [this.contract.work_location, Validators.required],
					employment_type: [this.contract.employment_type, Validators.required],
					employment_status: [this.contract.employment_status, Validators.required],
					manager: [this.contract.manager, Validators.required],
					worksnap_id: [this.contract.worksnap_id, Validators.required],
					pay_days: [this.contract.pay_days, Validators.required],
					deduction_item: [this.contract.deduction_item, Validators.required],
					compensation: [this.contract.compensation, Validators.required],
					hourly_rate: [this.contract.hourly_rate, Validators.required],
					hours_per_day_period: [this.contract.hours_per_day_period, Validators.required],
				});
			}else{
				this.contractForm = this.contractFB.group({
					start_date: [this.contract.start_date, Validators.required],
					position: [this.contract.position, Validators.required],
					//company_id:[this.contract.company_id, Validators.required],
					department_id: [this.contract.department_id, Validators.required],
					work_location: [this.contract.work_location, Validators.required],
					employment_type: [this.contract.employment_type, Validators.required],
					employment_status: [this.contract.employment_status, Validators.required],
					manager: [this.contract.manager, Validators.required],
					worksnap_id: [this.contract.worksnap_id, Validators.required],
					pay_days: [this.contract.pay_days, Validators.required],
					deduction_item: [this.contract.deduction_item, Validators.required],
					compensation: [this.contract.compensation, Validators.required],
					hourly_rate: [this.contract.hourly_rate, Validators.required],
					hours_per_day_period: [this.contract.hours_per_day_period, Validators.required],
				});
			}
		}
	}



	/**
	 * Save data
	 *
	 */
	onSubmit() {
		this.hasFormErrors = false;
		const controls = this.contractForm.controls;
		/** check form */
		if (this.contractForm.invalid) {
			Object.keys(controls).forEach(controlName =>
				controls[controlName].markAsTouched()
			);
			this.hasFormErrors = true;
			return;
		}
		if(this.selectedEmployeeId>0){
			// tslint:disable-next-line:prefer-const
			let editedContract = this.prepareContract();
			if (editedContract.id > 0) {
				this.updateContract(editedContract);
			} else {
				this.createContract(editedContract);
			}

			this.dialogRef.close(editedContract);
		}else{
			this.hasFormErrors = true;
			this.employeeCtrl.setErrors({'incorrect': true,'unique':true});
			this.employeeCtrl.markAsTouched();
		}
	}

	/**
	 * Returns object for saving
	 */
	prepareContract(): ContractModel {
		const controls = this.contractForm.controls;
		const _contract = new ContractModel();
		_contract.id = this.contract.id;
		_contract.employee_id = this.selectedEmployeeId;
		_contract.company_id = this.company_id;
		if(this.proposal_id)_contract.proposal_id = this.proposal_id;
		if(typeof controls['start_date'].value.getMonth === 'function'){
			_contract.start_date = controls['start_date'].value.toDateString();
		}else _contract.start_date = controls['start_date'].value;
		_contract.position = controls['position'].value;
		_contract.department_id = controls['department_id'].value;
		_contract.work_location = controls['work_location'].value;
		_contract.employment_type = controls['employment_type'].value;
		_contract.employment_status = controls['employment_status'].value;
		_contract.manager = controls['manager'].value;
		_contract.worksnap_id = controls['worksnap_id'].value;
		_contract.pay_days = controls['pay_days'].value;
		_contract.deduction_item = controls['deduction_item'].value;
		_contract.compensation = controls['compensation'].value;
		_contract.hourly_rate = controls['hourly_rate'].value;
		_contract.hours_per_day_period = controls['hours_per_day_period'].value;
		return _contract;
	}
	/**
	 * Checking control validation
	 *
	 * @param validationType: string => Equals to valitors name
	 */
	isEmployeeHasError(validationType:string): boolean {
		const control = this.employeeCtrl;
		if (!control) {
			return false;
		}
		const result = control.hasError(validationType) && (control.dirty || control.touched);
		return result;
	}
	/**
	 * Checking control validation
	 *
	 * @param controlName: string => Equals to formControlName
	 * @param validationType: string => Equals to valitors name
	 */
	isControlHasError(controlName: string, validationType: string): boolean {
		const control = this.contractForm.controls[controlName];
		if (!control) {
			return false;
		}
		const result = control.hasError(validationType) && (control.dirty || control.touched);
		return result;
	}

	/**
	 * Update contract
	 *
	 * @param _contract: ContractModel
	 */
	updateContract(_contract: ContractModel) {
		const updateContract: Update<ContractModel> = {
			id: _contract.id,
			changes: _contract
		};
		this.store.dispatch(new ContractUpdated({
			partialContract: updateContract,
			contract: _contract
		}));

		// Remove this line
		of(undefined).pipe(delay(1000)).subscribe(() => this.dialogRef.close({ _contract, isEdit: true }));
		// Uncomment this line
		// this.dialogRef.close({ _contract, isEdit: true }
	}
	onSelectionChanged($event){
		console.log($event);
	}
	employeeFocusOut(){
		let nameValue = this.employeeCtrl.value;
		if(nameValue!=null&&nameValue!="" ){
			setTimeout(()=>{
				nameValue = this.employeeCtrl.value;
				const filterValue = nameValue.toLowerCase();
				let employee = this.members.find((employee)=>{
					return (employee.first_name.toLowerCase().indexOf(filterValue) === 0 || employee.last_name.toLowerCase().indexOf(filterValue) === 0);
				});
				if(employee){
					this.selectedEmployeeId = employee.id;
					this.employeeCtrl.setValue(employee);
				}else{
					this.employeeCtrl.setValue("");
				}
			},150);
		}
	}
	worksnapFocusOut(){
		if(this.contractForm.controls['worksnap_id'].value!=""){
			this.companyService.findWorkSnap(this.contractForm.controls['worksnap_id'].value).subscribe(
				res=>{
					if(res.status == 'ok')this.worksnapName=res.user.name;
					if(res.status == 'failed'){
						this.contractForm.controls['worksnap_id'].setErrors({'incorrect': true,'unique':true});
						this.contractForm.controls['worksnap_id'].markAsTouched();
						this.worksnapName = "";
					}
					this.cdr.detectChanges();
				}
			)
		}
	}
	/**
	 * Create contract
	 *
	 * @param _contract: ContractModel
	 */
	createContract(_contract: ContractModel) {
		this.store.dispatch(new ContractOnServerCreated({ contract: _contract }));
		const createSubscription = this.store.pipe(
			select(selectLastCreatedContractId),
			delay(1000), // Remove this line
		).subscribe(res => {
			if (!res) {
				return;
			}

			this.dialogRef.close({ _contract, isEdit: false });
		});
		this.componentSubscriptions.push(createSubscription);
	}

	/** Alect Close event */
	onAlertClose($event) {
	}
}