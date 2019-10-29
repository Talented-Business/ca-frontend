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

// Services and Models
import { 
	CompanyService,
} from '../../../../../../core/humanresource';

@Component({
	// tslint:disable-next-line:component-selector
	selector: 'kt-hours-edit',
	templateUrl: './hours-edit.dialog.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
	encapsulation: ViewEncapsulation.None
})
export class HoursEditDialogComponent implements OnInit, OnDestroy {
	// Public properties
	hoursForm: FormGroup;
	hasFormErrors: boolean = false;
	viewLoading: boolean = false;
    employeeCtrl:FormControl = new FormControl();
    department_id:number;

	// Private properties
	private componentSubscriptions: Subscription[]=[];
	private company_id:number;
	private error:string;

	/**
	 * Component constructor
	 *
	 * @param dialogRef: MatDialogRef<HoursEditDialogComponent>
	 * @param fb: FormBuilder
	 * @param store: Store<AppState>
	 * @param typesUtilsService: TypesUtilsService
	 */
	constructor(
		@Inject(MAT_DIALOG_DATA) public data: any,
		public dialogRef:MatDialogRef<HoursEditDialogComponent>,
		private companyService:CompanyService,
		private hoursFB: FormBuilder,
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
		this.department_id = this.data.department_id;
		this.company_id = this.data.company_id;
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
        this.hoursForm = this.hoursFB.group({
            hours: [null, Validators.required],
        });
	}



	/**
	 * Save data
	 *
	 */
	onSubmit() {
        this.hasFormErrors = false;
        this.viewLoading = true;
		const controls = this.hoursForm.controls;
		/** check form */
		if (this.hoursForm.invalid) {
			Object.keys(controls).forEach(controlName =>
				controls[controlName].markAsTouched()
			);

            this.hasFormErrors = true;
            this.viewLoading = false;
			return;
        }
        let newHours = this.hoursForm.controls['hours'].value;
        /*const validImageTypes = ['image/gif', 'image/jpeg', 'image/png'];
        if (!validImageTypes.includes(newHours._files[0].type)) {
            this.hasFormErrors = true;
            this.viewLoading = false;
            this.hoursForm.controls['hours'].setErrors({'incorrect': true,'type':true});
            return;
        }*/
        this.uploadHours(newHours);
	}
	/**
	 * Checking control validation
	 *
	 * @param controlName: string => Equals to formControlName
	 * @param validationType: string => Equals to valitors name
	 */
	isControlHasError(controlName: string, validationType: string): boolean {
		const control = this.hoursForm.controls[controlName];
		if (!control) {
			return false;
		}
		const result = control.hasError(validationType) && (control.dirty || control.touched);
		return result;
	}

	/**
	 * Update hours
	 *
	 * @param _hours: Hours
	 */
	uploadHours(hours) {
		this.companyService.uploadHours(this.company_id,this.department_id,hours).pipe().subscribe(
            res=>{
                this.viewLoading = false;
                if(res.status == "ok"){
                    this.dialogRef.close(res);
				}
				if(res.status == "failed"){
					this.hasFormErrors = true;
					this.hoursForm.controls['hours'].setErrors({'incorrect': true,'error':true});
					this.error = res.errors;
					this.cdr.detectChanges();
				}					
            }
        );
	}

	/** Alect Close event */
	onAlertClose($event) {
	}
}