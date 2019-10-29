// Angular
import { Component, OnInit, Inject, ChangeDetectionStrategy, ViewEncapsulation, OnDestroy,ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
// Material
import { MatDialog,MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
// RxJS
import { Observable,BehaviorSubject,Subscription, of } from 'rxjs';
import { delay } from 'rxjs/operators';
// Translate Module
import { TranslateService } from '@ngx-translate/core';
// NGRX
import { Update } from '@ngrx/entity';
import { Store, select } from '@ngrx/store';
// State
import { AppState } from '../../../../../core/reducers';
// CRUD
import { LayoutUtilsService,MessageType,TypesUtilsService } from '../../../../../core/_base/crud';
// Services and Models
import { 
	selectEmployeeById,
	AttributeModel,
	EmployeeModel, 
	EmployeeUpdated,
	EmployeesService,
	EmployeeBackProcessFailed,
	selectEmployeesBackProcessingFailed, 
	selectEmployeesBackProcessingSuccess,
} from '../../../../../core/humanresource';
import { EMAIL_REG,AVAILABLE_NATIONALITY_LIST } from '../../../../../core/humanresource/_consts/specification';
import { environment } from '../../../../../../environments/environment';
import { PhotoAddDialogComponent } from '../photos/photo-add.dialog.component';
import { ImagePopupComponent } from '../recruit/image-modal/image-popup.component';
@Component({
	// tslint:disable-next-line:component-selector
	selector: 'kt-employees-edit',
	templateUrl: './employee-edit.component.html',
	styleUrls:['./employee-edit.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
	encapsulation: ViewEncapsulation.None
})
export class EmployeeEditComponent implements OnInit, OnDestroy {
	// Public properties
	employee: EmployeeModel;
	employeeId$: Observable<number>;
	employee$: Observable<EmployeeModel>;
	selectedTab: number = 0;
	loadingSubject = new BehaviorSubject<boolean>(true);
	loading$: Observable<boolean>;
	employeeForm: FormGroup;
	hasFormErrors: boolean = false;
	availableNationalities:string[];
    attributes:AttributeModel[];
    addAttribute:AttributeModel;
	tags:AttributeModel[]=[];
	photo_error:string;

	// Private properties
	private componentSubscriptions: Subscription[]=[];
	private viewStatus:any;
	private employeeStatus:string;
	private hostingUrl:string;
	private oldEmployee:EmployeeModel;

	/**
	 * Component constructor
	 *
	 * @param dialogRef: MatDialogRef<EmployeeEditComponent>
	 * @param fb: FormBuilder
	 * @param store: Store<AppState>
	 * @param typesUtilsService: TypesUtilsService
	 */
	constructor(
		private employeeFB: FormBuilder,
		private store: Store<AppState>,
		private activatedRoute: ActivatedRoute,
		private router: Router,
		public dialog: MatDialog,
		private employeeService: EmployeesService,
		private layoutUtilsService: LayoutUtilsService,
		private translate: TranslateService,
		private typesUtilsService: TypesUtilsService,
		private cdr: ChangeDetectorRef) {
	}

	/**
	 * @ Lifecycle sequences => https://angular.io/guide/lifecycle-hooks
	 */

	/**
	 * On init
	 */
	ngOnInit() {
		//this.store.pipe(select(selectEmployeesActionLoading)).subscribe(res => this.viewLoading = res);
		this.loading$ = this.loadingSubject.asObservable();
		this.loadingSubject.next(true);
		this.viewStatus = false;
		this.hostingUrl = environment.host_url;
		this.activatedRoute.params.subscribe(params => {
			const id = params['id'];
			if (id && id > 0) {

				/*this.store.pipe(
					select(selectEmployeeById(id))
				).subscribe(result => {
					if (!result) {*/
						this.loadEmployeeFromService(id);
						/*return;
					}
					this.loadEmployee(result);
				});*/
			} else {
				alert('error');
			}
		});
		this.attributes = [];
        const updateAttributeSubscription = this.store.subscribe((state:any)=>{
			let attributes:AttributeModel[] = Object.values(state.attributes.entities);
			this.attributes = attributes.filter(attribute=>attribute.status);
			if(this.employee && (this.tags.length==0))this.updateAttributes(this.employee.skills, true);
		});		
		this.componentSubscriptions.push(updateAttributeSubscription);
		const updateSuccessSubscription = this.store.pipe(
			select(selectEmployeesBackProcessingSuccess),
			delay(1000), // Remove this line
		).subscribe(res => {
			if (!res) {
				return;
			}
			const message = `Employee successfully has been saved.`;
			this.layoutUtilsService.showActionNotification(message, MessageType.Update, 10000, true, true);
			//this.refreshEmployee(false);
			//setTimeout(()=>{
				this.router.navigate(['/employee-management/employees/view', this.employee.id], { relativeTo: this.activatedRoute });
			//},100);	
		});
		this.componentSubscriptions.push(updateSuccessSubscription);
		const updateFailedSubscription = this.store.pipe(
			select(selectEmployeesBackProcessingFailed),
			delay(1000), // Remove this line
		).subscribe(res => {
			if (!res) {
				return;
			}
			if(res){
				this.hasFormErrors=true;
				if(res.personal_email!=undefined)this.employeeForm.controls['personal_email'].setErrors({'incorrect': true,'unique':true});
				if(res.id_number!=undefined)this.employeeForm.controls['id_number'].setErrors({'incorrect': true,'unique':true});
				if(res.photo!=undefined){
					this.employeeForm.controls['photo'].setErrors({'incorrect': true,'error':true});
					this.photo_error = res.photo;
				}
			}
			this.viewStatus = false;
			this.cdr.detectChanges();
		});		
		this.componentSubscriptions.push(updateFailedSubscription);
		this.setNationalies();
		this.hostingUrl = environment.host_url;
	}

	/**
	 * On destroy
	 */
	ngOnDestroy() {
		this.store.dispatch(new EmployeeBackProcessFailed({ isFailed: false,errors:null }));
		this.componentSubscriptions.forEach(el => el.unsubscribe());
	}

	/**
	 * Returns page title
	 */
	getTitle(): string {
		if (this.employee.id > 0) {
			return `Edit employee '${this.employee.first_name}  ${
				this.employee.last_name
			}'`;
		}

		return 'New employee';
	}
	updateAttributes(skills, load:boolean){
		if(load){
			let status = load;
		}
        this.tags = [];
		skills.forEach(skill=>{
			let key:number;
			this.tags.push(skill);
			this.attributes.forEach((attribute,index)=>{
				if(attribute.id == skill.id){
					key = index;
				}
			});
			this.attributes.splice(key,1);		
		});
	}
	loadEmployee(_employee, fromService: boolean = false) {
		if (!_employee) {
			this.goBack('');
		}
		this.employee = _employee;
		this.employeeStatus = _employee.status;
		if(_employee.skills&&_employee.skills.length>0){
			if(this.attributes)this.updateAttributes(_employee.skills,false);
		}
		this.employeeId$ = of(_employee.id);
		this.employee$ = of(_employee);
		this.loadingSubject.next(false);
		this.oldEmployee =  Object.assign({}, this.employee);
		this.initEmployee();
		if (fromService) {
			this.cdr.detectChanges();
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
			available_works: [this.employee.available_works, Validators.required],
			have_computer: [this.employee.have_computer, Validators.required],
			have_monitor: [this.employee.have_monitor, Validators.required],
			have_headset: [this.employee.have_headset, Validators.required],
			have_ethernet: [this.employee.have_ethernet, Validators.required],
			visit: [this.employee.visit],
			approve_date: [this.employee.approve_date],
			photo:[''],
		});
	}


	// If employee didn't find in store
	loadEmployeeFromService(employeeId) {
		this.employeeService.getEmployeeById(employeeId).subscribe(res => {
			this.loadEmployee(res, true);
		});
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
	 * Returns component title
	 */
	getComponentTitle() {
		let result;
		if(this.employee)result= this.employee.first_name + ' ' + this.employee.last_name + '  |  ' + this.employee.created_date;
		return result;
	}
	showBolean(status:boolean){
		if(status){
			return "YES";
		}else{
			return "NO";
		}
	}
	showAvailableWorks(status:string){
		let label;
		switch(status){
			case 'Less_20':
				label = 'Less than 20 hours per week';
				break;
			case '40':
				label = '40 hours per week';
				break;
			case 'over_40':
				label = 'more than 40 hours per week';
				break;
		}
		return label;
	}	
	/**
	 * Go back to the list
	 *
	 * @param id: any
	 */
	goBack(id) {
		this.loadingSubject.next(false);
		const url = `../employees`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}
	goBackWithoutId	() {
		this.router.navigateByUrl('/employee-management/employees', { relativeTo: this.activatedRoute });
	}
	/** ACTIONS */

	/**
	 * Save data
	 *
	 * @param withBack: boolean
	 */
	onSumbit(withBack: boolean = false) {
		this.hasFormErrors = false;
		const controls = this.employeeForm.controls;
		/** check form */
		if (this.employeeForm.invalid) {
			Object.keys(controls).forEach(controlName =>
				controls[controlName].markAsTouched()
			);

			this.hasFormErrors = true;
			this.selectedTab = 0;
			return;
		}
		let newPhoto = this.employeeForm.controls['photo'].value;
		if(newPhoto){
			const validImageTypes = ['image/gif', 'image/jpeg', 'image/png'];
			if (!validImageTypes.includes(newPhoto._files[0].type)) {
				this.hasFormErrors = true;
				this.employeeForm.controls['photo'].setErrors({'incorrect': true,'type':true});
				return;
			}
		}

		// tslint:disable-next-line:prefer-const
		let editedEmployee = this.prepareEmployee();
		let attributes:number[] = [];
		this.tags.forEach((tag)=>{
			attributes.push(tag.id)
		});
		editedEmployee.skills = attributes;
		
		if (editedEmployee.id > 0) {
			this.updateEmployee(editedEmployee, withBack);
			return;
		}
	}

	/**
	 * Returns object for saving
	 */
	prepareEmployee(): EmployeeModel {
		const controls = this.employeeForm.controls;
		const _employee = new EmployeeModel();
		_employee.id = this.employee.id;
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
		if(controls['passport_path'])_employee.passport_path = controls['passport_path'].value;
		if(controls['reference_path'])_employee.reference_path = controls['reference_path'].value;
		if(controls['cv_path'])_employee.cv_path = controls['cv_path'].value;
		if(controls['police_path'])_employee.police_path = controls['police_path'].value;
		_employee.available_works = controls['available_works'].value;
		_employee.have_computer = controls['have_computer'].value;
		_employee.have_monitor = controls['have_monitor'].value;
		_employee.have_headset = controls['have_headset'].value;
		_employee.have_ethernet = controls['have_ethernet'].value;
		_employee.approve_date = controls['approve_date'].value;
		_employee.visit = controls['visit'].value;
		if(controls['photo'].value)_employee.photo = controls['photo'].value;
		return _employee;
	}
	openImage(path:string){
		let url:string = this.hostingUrl + 'storage/' + path;
		let config = {
			height: 'auto',
			width: 'auto',
			hasBackdrop:true,
			backdropClass:'modal-black-background',
			'margin-right':'auto',
			'margin-left':'auto',
			panelClass: 'full-screen-modal',
			data:{image:url}
		  };		
		const dialogRef = this.dialog.open(ImagePopupComponent, config);
	}
	removeImage(photo){
		if(confirm('Are you sure to delete this photo?')){
			this.employeeService.deletePhoto(photo.id).pipe().subscribe(
				res=>{
					if(res){
						let index = this.employee.photos.indexOf(photo);
						this.employee.photos.splice(index,1);
						this.cdr.detectChanges();
					}
				}
			);			
		}
	}
	/**
	 * Returns Item Status in string
	 * @param status: number
	 */
	getItemStatusString(status: string): string {
		switch (status) {
			case 'disabled':
				return 'Disabled';
			case 'hired':
				return 'Hired';
			case 'approved':
				return 'Available';
		}
		return '';
	}
	/**
	 * Update employee
	 *
	 * @param _employee: EmployeeModel
	 */
	updateEmployee(_employee: EmployeeModel, withBack: boolean = false) {
		const updateEmployee: Update<EmployeeModel> = {
			id: _employee.id,
			changes: _employee
		};
		this.store.dispatch(new EmployeeUpdated({
			partialEmployee: updateEmployee,
			employee: _employee
		}));

		/*if (withBack) {
			this.goBack(_employee.id);
		} else {
		}*/
	}
	reset(){
		this.employee = Object.assign({}, this.oldEmployee);
		this.createForm();
	}
/**
	 * Refresh employee
	 *
	 * @param isNew: boolean
	 * @param id: number
	 */
	refreshEmployee(isNew: boolean = false, id = 0) {
		this.loadingSubject.next(false);
		let url = this.router.url;
		if (!isNew) {
			this.loadEmployeeFromService(this.employee.id);
			//this.router.navigate([url], { relativeTo: this.activatedRoute });
			return;
		}

		url = `/employee-management/employees/edit/${id}`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}
	/** Alect Close event */
	onAlertClose($event) {
	}
	setNationalies(){
		this.availableNationalities = AVAILABLE_NATIONALITY_LIST;
	}
    contain(attribute:any){
        return attribute.id != this;
    }
    onAddAttribute(){
        if(this.tags.length == 0 || this.tags.every(this.contain,this.addAttribute.id)){
            this.tags.push(this.addAttribute);
            var index = this.attributes.indexOf(this.addAttribute);
            this.attributes.splice(index,1);
        }
	}
	remove(attribute:any){
		var index = this.tags.indexOf(attribute);
		var tag:any = this.tags.splice(index,1);
		this.attributes.push(tag[0]);
	}

}