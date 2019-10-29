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
	EmployeesService, EmployeeModel,
} from '../../../../../core/humanresource';

@Component({
	// tslint:disable-next-line:component-selector
	selector: 'kt-photos-add',
	templateUrl: './photo-add.dialog.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
	encapsulation: ViewEncapsulation.None
})
export class PhotoAddDialogComponent implements OnInit, OnDestroy {
	// Public properties
	photoForm: FormGroup;
	hasFormErrors: boolean = false;
	viewLoading: boolean = false;
    employeeCtrl:FormControl = new FormControl();
    employee:EmployeeModel;

	// Private properties
	private componentSubscriptions: Subscription[]=[];
	private selectedEmployeeDisplayName:string;
	private selectedEmployeeId:number;
	private company_id:number;
	private proposal_id:number;

	/**
	 * Component constructor
	 *
	 * @param dialogRef: MatDialogRef<PhotoAddDialogComponent>
	 * @param fb: FormBuilder
	 * @param store: Store<AppState>
	 * @param typesUtilsService: TypesUtilsService
	 */
	constructor(
		@Inject(MAT_DIALOG_DATA) public data: any,
		public dialogRef:MatDialogRef<PhotoAddDialogComponent>,
		private store: Store<AppState>,
		private employeesService:EmployeesService,
		private photoFB: FormBuilder,
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
		this.employee = this.data.employee;
		this.createForm();
	}
	/**
	 * On destroy
	 */
	ngOnDestroy() {
	}

	/**
	 * Create form
	 */
	createForm() {
        this.photoForm = this.photoFB.group({
            photo: [null, Validators.required],
        });
	}



	/**
	 * Save data
	 *
	 */
	onSubmit() {
        this.hasFormErrors = false;
        this.viewLoading = true;
		const controls = this.photoForm.controls;
		/** check form */
		if (this.photoForm.invalid) {
			Object.keys(controls).forEach(controlName =>
				controls[controlName].markAsTouched()
			);

            this.hasFormErrors = true;
            this.viewLoading = false;
			return;
        }
        let newPhoto = this.photoForm.controls['photo'].value;
        const validImageTypes = ['image/gif', 'image/jpeg', 'image/png'];
        if (!validImageTypes.includes(newPhoto._files[0].type)) {
            this.hasFormErrors = true;
            this.viewLoading = false;
            this.photoForm.controls['photo'].setErrors({'incorrect': true,'type':true});
            return;
        }
        this.uploadPhoto(newPhoto);
	}
	/**
	 * Checking control validation
	 *
	 * @param controlName: string => Equals to formControlName
	 * @param validationType: string => Equals to valitors name
	 */
	isControlHasError(controlName: string, validationType: string): boolean {
		const control = this.photoForm.controls[controlName];
		if (!control) {
			return false;
		}
		const result = control.hasError(validationType) && (control.dirty || control.touched);
		return result;
	}

	/**
	 * Update photo
	 *
	 * @param _photo: PhotoModel
	 */
	uploadPhoto(image) {
		this.employeesService.uploadPhoto(this.employee.id,image).pipe().subscribe(
            res=>{
                this.viewLoading = false;
                if(res){
                    this.dialogRef.close(res);
                }
            }
        );
	}

	/** Alect Close event */
	onAlertClose($event) {
	}
}