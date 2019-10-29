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
	selector: 'kt-contracts-read',
	templateUrl: './contract-read.dialog.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
	encapsulation: ViewEncapsulation.None
})
export class ContractViewDialogComponent implements OnInit, OnDestroy {
	// Public properties
	contract: ContractModel;
	viewLoading: boolean = false;


	/**
	 * Component constructor
	 *
	 * @param dialogRef: MatDialogRef<ContractViewDialogComponent>
	 * @param fb: FormBuilder
	 * @param store: Store<AppState>
	 * @param typesUtilsService: TypesUtilsService
	 */
	constructor(
		@Inject(MAT_DIALOG_DATA) public data: any,
		public dialogRef:MatDialogRef<ContractViewDialogComponent>,
		private store: Store<AppState>,
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
	}
	/**
	 * On destroy
	 */
	ngOnDestroy() {
	}

	/**
	 * Returns page title
	 */
	getTitle(): string {
		return `Employment`;
	}
	

	/** Alect Close event */
	onAlertClose($event) {
	}
}