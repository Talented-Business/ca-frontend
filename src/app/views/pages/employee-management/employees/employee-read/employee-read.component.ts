// Angular
import { Component, OnInit, Inject, ChangeDetectionStrategy, ViewEncapsulation, OnDestroy,ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
// Material
import { MatDialog,MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
// RxJS
import { Observable,BehaviorSubject,Subscription, of } from 'rxjs';
import { delay } from 'rxjs/operators';
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
	EmployeeBackProcessSuccess,
} from '../../../../../core/humanresource';
import { EMAIL_REG,AVAILABLE_NATIONALITY_LIST } from '../../../../../core/humanresource/_consts/specification';
import { environment } from '../../../../../../environments/environment';
import { PhotoAddDialogComponent } from '../photos/photo-add.dialog.component';
import { ImagePopupComponent } from '../recruit/image-modal/image-popup.component';
@Component({
	// tslint:disable-next-line:component-selector
	selector: 'kt-employees-read',
	templateUrl: './employee-read.component.html',
	styleUrls:['./employee-read.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
	encapsulation: ViewEncapsulation.None
})
export class EmployeeReadComponent implements OnInit, OnDestroy {
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
    tags:AttributeModel[];

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
		private store: Store<AppState>,
		private activatedRoute: ActivatedRoute,
		private router: Router,
		public dialog: MatDialog,
		private employeeService: EmployeesService,
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
		this.hostingUrl = environment.host_url;
	}

	/**
	 * On destroy
	 */
	ngOnDestroy() {
		this.componentSubscriptions.forEach(el => el.unsubscribe());
	}

	loadEmployee(_employee, fromService: boolean = false) {
		if (!_employee) {
			this.goBack('');
		}
		this.employee = _employee;
		this.employeeStatus = _employee.status;
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
		this.loadingSubject.next(false);
	}



	// If employee didn't find in store
	loadEmployeeFromService(employeeId) {
		this.employeeService.getEmployeeById(employeeId).subscribe(res => {
			this.loadEmployee(res, true);
		});
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

	redirectEditEmployee() {
		this.store.dispatch(new EmployeeBackProcessSuccess({ isSuccess: false }));
		this.router.navigate(['/employee-management/employees/edit', this.employee.id], { relativeTo: this.activatedRoute });
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
	/** Alect Close event */
	onAlertClose($event) {
	}

}