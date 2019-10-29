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
import { AppState } from '../../../../../../core/reducers';

// Services and Models
import { 
	AttributeModel, 
	selectAttributesActionLoading,
	AttributeOnServerCreated,
	selectLastCreatedAttributeId,
	AttributeOnServerUpdated,
	AttributeListingChanged,
} from '../../../../../../core/humanresource';
@Component({
	// tslint:disable-next-line:component-selector
	selector: 'kt-attribute-edit',
	templateUrl: './attribute-edit.dialog.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
	encapsulation: ViewEncapsulation.None
})
export class AttributeEditDialogComponent implements OnInit, OnDestroy {
	// Public properties
	attribute: AttributeModel;
	attributeForm: FormGroup;
	hasFormErrors: boolean = false;
	viewLoading: boolean = false;

	// Private properties
	private componentSubscriptions: Subscription[]=[];
	private company_id:number;

	/**
	 * Component constructor
	 *
	 * @param dialogRef: MatDialogRef<AttributeEditDialogComponent>
	 * @param fb: FormBuilder
	 * @param store: Store<AppState>
	 * @param typesUtilsService: TypesUtilsService
	 */
	constructor(
		@Inject(MAT_DIALOG_DATA) public data: any,
		public dialogRef:MatDialogRef<AttributeEditDialogComponent>,
		private store: Store<AppState>,
		private attributeFB: FormBuilder,
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
		this.store.pipe(select(selectAttributesActionLoading)).subscribe(res => this.viewLoading = res);
		this.attribute = this.data.attribute;
		this.company_id = this.data.company_id;
		this.createForm();
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
		if (this.attribute.id > 0) {
			return `Edit attribute '${this.attribute.name}'`;
		}

		return 'New attribute';
	}
	
	/**
	 * Create form
	 */
	createForm() {
		this.attributeForm = this.attributeFB.group({
			name: [this.attribute.name, Validators.required],
		});
	}

	/**
	 * Save data
	 *
	 */
	onSubmit() {
		this.hasFormErrors = false;
		const controls = this.attributeForm.controls;
		/** check form */
		if (this.attributeForm.invalid) {
			Object.keys(controls).forEach(controlName =>
				controls[controlName].markAsTouched()
			);

			this.hasFormErrors = true;
			return;
		}
		this.store.dispatch(new AttributeListingChanged());
		// tslint:disable-next-line:prefer-const
		let editedAttribute = this.prepareAttribute();
		if (editedAttribute.id >0) {
			this.updateAttribute(editedAttribute);
		} else {
			this.createAttribute(editedAttribute);
		}

		this.dialogRef.close(editedAttribute);
	}

	/**
	 * Returns object for saving
	 */
	prepareAttribute(): AttributeModel {
		const controls = this.attributeForm.controls;
		const _attribute = new AttributeModel();
		_attribute.id = this.attribute.id;
		_attribute.name = controls['name'].value;
		return _attribute;
	}

	/**
	 * Update attribute
	 *
	 * @param _attribute: AttributeModel
	 */
	updateAttribute(_attribute: AttributeModel) {
		const updateAttribute: Update<AttributeModel> = {
			id: _attribute.id,
			changes: _attribute
		};
		this.store.dispatch(new AttributeOnServerUpdated({
			partialAttribute: updateAttribute,
			attribute: _attribute
		}));

		// Uncomment this line
		// this.dialogRef.close({ _attribute, isEdit: true }
	}
	/**
	 * Create attribute
	 *
	 * @param _attribute: AttributeModel
	 */
	createAttribute(_attribute: AttributeModel) {
		this.store.dispatch(new AttributeOnServerCreated({ attribute: _attribute }));
		const createSubscription = this.store.pipe(
			select(selectLastCreatedAttributeId),
			delay(1000), // Remove this line
		).subscribe(res => {
			if (!res) {
				return;
			}
		});
		this.componentSubscriptions.push(createSubscription);
	}

	/** Alect Close event */
	onAlertClose($event) {
	}
}