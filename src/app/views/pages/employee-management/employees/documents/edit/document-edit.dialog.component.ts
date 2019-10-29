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
	EmployeesService, EmployeeModel,
} from '../../../../../../core/humanresource';

@Component({
	// tslint:disable-next-line:component-selector
	selector: 'kt-document-edit',
	templateUrl: './document-edit.dialog.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
	encapsulation: ViewEncapsulation.None
})
export class DocumentEditDialogComponent implements OnInit, OnDestroy {
	// Public properties
	documentForm: FormGroup;
	hasFormErrors: boolean = false;
	viewLoading: boolean = false;
    employeeCtrl:FormControl = new FormControl();
    document:any;

	// Private properties
	private componentSubscriptions: Subscription[]=[];
	private employee_id:number;
	private error:string;

	/**
	 * Component constructor
	 *
	 * @param dialogRef: MatDialogRef<DocumentEditDialogComponent>
	 * @param fb: FormBuilder
	 * @param store: Store<AppState>
	 * @param typesUtilsService: TypesUtilsService
	 */
	constructor(
		@Inject(MAT_DIALOG_DATA) public data: any,
		public dialogRef:MatDialogRef<DocumentEditDialogComponent>,
		private employeesService:EmployeesService,
		private documentFB: FormBuilder,
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
		this.document = this.data.document;
		this.employee_id = this.data.employee_id;
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
        this.documentForm = this.documentFB.group({
			name:[this.document.name, Validators.required],
            document: [null, Validators.required],
        });
	}



	/**
	 * Save data
	 *
	 */
	onSubmit() {
        this.hasFormErrors = false;
        this.viewLoading = true;
		const controls = this.documentForm.controls;
		/** check form */
		if (this.documentForm.invalid) {
			Object.keys(controls).forEach(controlName =>
				controls[controlName].markAsTouched()
			);

            this.hasFormErrors = true;
            this.viewLoading = false;
			return;
        }
		let newDocument = this.documentForm.controls['document'].value;
		let _document:any = {};
		_document.id = this.document.id;
		_document.name = this.documentForm.controls['name'].value;
		_document.member_id = this.document.member_id;
        /*const validImageTypes = ['image/gif', 'image/jpeg', 'image/png'];
        if (!validImageTypes.includes(newDocument._files[0].type)) {
            this.hasFormErrors = true;
            this.viewLoading = false;
            this.documentForm.controls['document'].setErrors({'incorrect': true,'type':true});
            return;
        }*/
		if(this.document.id>0)this.uploadDocument(_document,newDocument);
		else this.uploadNewDocument(_document,newDocument);
	}
	/**
	 * Checking control validation
	 *
	 * @param controlName: string => Equals to formControlName
	 * @param validationType: string => Equals to valitors name
	 */
	isControlHasError(controlName: string, validationType: string): boolean {
		const control = this.documentForm.controls[controlName];
		if (!control) {
			return false;
		}
		const result = control.hasError(validationType) && (control.dirty || control.touched);
		return result;
	}

	/**
	 * Update document
	 *
	 * @param _document: DocumentModel
	 */
	uploadDocument(document,file) {
		this.employeesService.uploadDocument(document,file).pipe().subscribe(
            res=>{
                this.viewLoading = false;
                if(res.status == "ok"){
                    this.dialogRef.close(res.documents);
				}
				if(res.status == "failed"){
					this.hasFormErrors = true;
					this.documentForm.controls['document'].setErrors({'incorrect': true,'error':true});
					if(res.errors.path)this.error = res.errors.path[0];
					else this.error = res.errors;
					this.cdr.detectChanges();
				}					
            }
        );
	}
	/**
	 * Add document
	 *
	 * @param _document: DocumentModel
	 */
	uploadNewDocument(document,file) {
		this.employeesService.uploadNewDocument(document,file).pipe().subscribe(
            res=>{
                this.viewLoading = false;
                if(res.status == "ok"){
                    this.dialogRef.close(res.documents);
				}
				if(res.status == "failed"){
					this.hasFormErrors = true;
					this.documentForm.controls['document'].setErrors({'incorrect': true,'error':true});
					if(res.errors.path)this.error = res.errors.path[0];
					else this.error = res.errors;
					this.cdr.detectChanges();
				}					
            }
        );
	}

	/** Alect Close event */
	onAlertClose($event) {
	}
}