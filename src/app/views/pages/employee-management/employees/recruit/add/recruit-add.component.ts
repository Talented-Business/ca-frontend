// Angular
import { Component, OnInit, ChangeDetectionStrategy,ElementRef, OnDestroy, ChangeDetectorRef,ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators,FormControl } from '@angular/forms';
// Material
import { MatDialog } from '@angular/material';
// RxJS
import { Observable, BehaviorSubject, Subscription, of } from 'rxjs';
import { delay,startWith,map } from 'rxjs/operators';
// RxJS
import { tap,catchError } from 'rxjs/operators';
import {MatInput} from '@angular/material/input';
import { LayoutUtilsService, TypesUtilsService,MessageType } from '../../../../../../core/_base/crud';
// Services and Models
import {
	EmployeeModel,
	EmployeesService,
} from '../../../../../../core/humanresource';
import { EMAIL_REG,AVAILABLE_NATIONALITY_LIST } from '../../../../../../core/humanresource/_consts/specification';

@Component({
	// tslint:disable-next-line:component-selector
	selector: 'recruit-add',
	templateUrl: './recruit-add.component.html',
	styleUrls:['./recruit-add.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RecruitAddComponent implements OnInit {
	@ViewChild('id_number', {static: false} ) id_number: MatInput;
	@ViewChild('last_name', {static: false}) last_name: MatInput;
	@ViewChild('personal_email', {static: false}) personal_email: MatInput;
	// Public properties
	employee: EmployeeModel;
	oldEmployee: EmployeeModel;
	selectedTab: number = 0;
	loadingSubject = new BehaviorSubject<boolean>(true);
	loading$: Observable<boolean>;
	savingSubject = new BehaviorSubject<boolean>(false);
	saving$: Observable<boolean>;
	employeeForm: FormGroup;
	hasFormErrors: boolean = false;
	availableYears: number[] = [];
	filteredColors: Observable<string[]>;
	filteredManufactures: Observable<string[]>;
	availableNationalities:string[];
	passport_path_error:string;
	reference_path_error:string;
	cv_path_error:string;
	police_path_error:string;
	filteredNationalities: Observable<string[]>;
	showWaitMessage:boolean = false;
	sent:boolean = false;
	// sticky portlet header margin
	
	/**
	 * Component constructor
	 *
	 * @param employeeFB: FormBuilder
	 */
	constructor(
		private employeesService:EmployeesService,
		private employeeFB: FormBuilder,
		private route:Router,
		private layoutUtilsService: LayoutUtilsService,
		private cdr: ChangeDetectorRef,
		) {
		this.oldEmployee =  new EmployeeModel;
		this.oldEmployee.clear();
	}

	/**
	 * @ Lifecycle sequences => https://angular.io/guide/lifecycle-hooks
	 */

	/**
	 * On init
	 */
	ngOnInit() {
		this.loading$ = this.loadingSubject.asObservable();
		this.saving$ = this.savingSubject.asObservable();
        this.reset();
		this.loadingSubject.next(false);
		this.availableNationalities = AVAILABLE_NATIONALITY_LIST;
		this.filteredNationalities = this.employeeForm.controls['nationality'].valueChanges
		.pipe(
		  startWith(''),
		  map(value => value ),
		  map(name => name ? this._filteredNationalities(name) : this.availableNationalities.slice())
		);
	}
	private _filteredNationalities(value: string): string[] {
		const filterValue = value.toLowerCase();	
		return this.availableNationalities.filter(nationality => nationality.toLowerCase().indexOf(filterValue) === 0 );
	}
	nationalFocusOut(){
		let nationality = this.employeeForm.controls['nationality'].value;
		if(nationality!=null&&nationality!="" ){
			setTimeout(()=>{
				nationality = this.employeeForm.controls['nationality'].value;
				const searchValue = nationality.toLowerCase();
				let index = this.availableNationalities.findIndex((item)=>{
					return item.toLowerCase().indexOf(searchValue) === 0
				});
				if(index >-1){
					this.employeeForm.controls['nationality'].setValue(this.availableNationalities[index]);
				}else{
					this.employeeForm.controls['nationality'].setValue("");
				}
			},150);
		}
	}
	/**
	 * Init employee
	 */
	initEmployee() {
		this.createForm();
		this.loadingSubject.next(false);
	}

	/**
	 * Create form
	 */
	createForm() {
		this.employeeForm = this.employeeFB.group({
			first_name: [this.employee.first_name, Validators.required],
			last_name: [this.employee.last_name, Validators.required],
			id_number: [this.employee.id_number, [Validators.required,Validators.pattern(/^\b\w+\b$/)]],
			gender: [this.employee.gender, Validators.required],
			birthday: [this.employee.birthday, Validators.required],
			nationality: [this.employee.nationality, Validators.required],
			home_phone_number: [this.employee.home_phone_number, Validators.required],
			mobile_phone_number: [this.employee.mobile_phone_number, Validators.required],
			personal_email: [this.employee.personal_email,[Validators.required,Validators.pattern(EMAIL_REG)]],
			marital: [this.employee.marital, Validators.required],
			skype_id: [this.employee.skype_id, Validators.required],
			referal_name: [this.employee.referal_name],
			country: [this.employee.country, Validators.required],
			state: [this.employee.state, Validators.required],
			home_address: [this.employee.home_address, Validators.required],
			deport_america: [this.employee.deport_america, Validators.required],
			check_america: [this.employee.check_america, Validators.required],
			check_background: [this.employee.check_background, Validators.required],
			english_level: [this.employee.english_level, Validators.required],
			passport_path: [this.employee.passport_path, Validators.required],
			reference_path: [this.employee.reference_path, Validators.required],
			cv_path: [this.employee.cv_path, Validators.required],
			police_path: [this.employee.police_path, Validators.required],
			available_works: [this.employee.available_works, Validators.required],
			have_computer: [this.employee.have_computer, Validators.required],
			have_monitor: [this.employee.have_monitor, Validators.required],
			have_headset: [this.employee.have_headset, Validators.required],
			have_ethernet: [this.employee.have_ethernet, Validators.required],
		});

	}




	/**
	 * Reset
	 */
	reset() {
		this.employee = Object.assign({}, this.oldEmployee);
		this.createForm();
		this.hasFormErrors = false;
	}

	/**
	 * Save data
	 *
	 * @param withBack: boolean
	 */
	onSumbit(withBack: boolean = false) {
		this.savingSubject.next(true);
		this.hasFormErrors = false;
		const controls = this.employeeForm.controls;
		//debugger;
		/** check form */
		if (this.employeeForm.invalid) {
			Object.keys(controls).forEach(controlName =>
				controls[controlName].markAsTouched()
			);

			this.hasFormErrors = true;
			this.selectedTab = 0;
			this.savingSubject.next(false);
			return;
		}

		// tslint:disable-next-line:prefer-const
		let editedEmployee = this.prepareEmployee();

		this.addEmployee(editedEmployee, withBack);
	}

	/**
	 * Returns object for saving
	 */
	prepareEmployee(): EmployeeModel {
		const controls = this.employeeForm.controls;
		const _employee = new EmployeeModel();
		_employee.first_name = controls['first_name'].value;
		_employee.last_name = controls['last_name'].value;
		_employee.id_number = controls['id_number'].value;
		_employee.gender = controls['gender'].value;
		if(controls['birthday'].value.toDateString == undefined){
			_employee.birthday = controls['birthday'].value;
		}else{
			_employee.birthday = controls['birthday'].value.toDateString();
		}
		_employee.nationality = controls['nationality'].value;
		_employee.home_phone_number = controls['home_phone_number'].value;
		_employee.mobile_phone_number = controls['mobile_phone_number'].value;
		_employee.personal_email = controls['personal_email'].value;
		_employee.marital = controls['marital'].value;
		_employee.skype_id = controls['skype_id'].value;
		_employee.referal_name = controls['referal_name'].value;
		_employee.country = controls['country'].value;
		_employee.state = controls['state'].value;
		_employee.home_address = controls['home_address'].value;
		_employee.deport_america = controls['deport_america'].value;
		_employee.check_america = controls['check_america'].value;
		_employee.check_background = controls['check_background'].value;
		_employee.english_level = controls['english_level'].value;
		_employee.passport_path = controls['passport_path'].value;
		_employee.reference_path = controls['reference_path'].value;
		_employee.cv_path = controls['cv_path'].value;
		_employee.police_path = controls['police_path'].value;
		_employee.available_works = controls['available_works'].value;
		_employee.have_computer = controls['have_computer'].value;
		_employee.have_monitor = controls['have_monitor'].value;
		_employee.have_headset = controls['have_headset'].value;
		_employee.have_ethernet = controls['have_ethernet'].value;
		return _employee;
	}
	/**
	 * Checking control validation
	 *
	 * @param controlName: string => Equals to formControlName
	 * @param validationType: string => Equals to valitors name
	 */
	isControlHasError(controlName: string, validationType: string): boolean {
		const control = this.employeeForm.controls[controlName];
		if (!control) {
			return false;
		}
		const result = control.hasError(validationType) && (control.dirty || control.touched);
		return result;
	}

	/**
	 * Add employee
	 *
	 * @param _employee: EmployeeModel
	 * @param withBack: boolean
	 */
	addEmployee(_employee: EmployeeModel, withBack: boolean = false) {
		this.loadingSubject.next(false);
		this.showWaitMessage = true;
		this.employeesService.createEmployee(_employee).pipe(
			tap(res => {
				console.log(res);
			}),
			catchError(this.handleError<EmployeeModel>('addEmployee'))
		).subscribe(res=>{
			this.showWaitMessage = false;
			if(res.status == 'failed'){
				var response = res;
				this.hasFormErrors=true;
				if(response.errors.personal_email!=undefined){
					this.employeeForm.controls['personal_email'].setErrors({'incorrect': true,'unique':true});
					this.personal_email.focus();
					this.last_name.focus();
					this.personal_email.focus();
					this.savingSubject.next(false);
				}
				if(response.errors.id_number!=undefined){
					this.employeeForm.controls['id_number'].setErrors({'incorrect': true,'unique':true});
					this.id_number.focus();
					this.last_name.focus();
					this.id_number.focus();
					this.savingSubject.next(false);
				}
				if(response.errors.passport_path){
					this.employeeForm.controls['passport_path'].setErrors({'incorrect': true,'error':true});
					this.passport_path_error = response.errors.passport_path;
					this.savingSubject.next(false);
				}
				if(response.errors.reference_path){
					this.employeeForm.controls['reference_path'].setErrors({'incorrect': true,'error':true});
					this.reference_path_error = response.errors.reference_path;
					this.savingSubject.next(false);
				}
				if(response.errors.cv_path){
					this.employeeForm.controls['cv_path'].setErrors({'incorrect': true,'error':true});
					this.cv_path_error = response.errors.cv_path;
					this.savingSubject.next(false);
				}
				if(response.errors.police_path){
					this.employeeForm.controls['police_path'].setErrors({'incorrect': true,'error':true});
					this.police_path_error = response.errors.police_path;
					this.savingSubject.next(false);
				}
			}else if(res.status =='ok'){
				const _saveMessage = `Your application has just be sent successfully. Please wait while checking your application`;
				this.layoutUtilsService.showActionNotification(_saveMessage, MessageType.Create, 10000, true, false);
				this.sent = true;
			}
			this.cdr.detectChanges();
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

	/**
	 * Returns component title
	 */
	getComponentTitle() {
		let result = 'Apply to be a freelancer on Castellum Pro';
		if(this.sent) result = 'Application Submitted Successfully!';
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
