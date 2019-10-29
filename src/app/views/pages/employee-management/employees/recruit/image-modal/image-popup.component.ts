// Angular
import { Component, OnInit, Inject, ChangeDetectionStrategy, ViewEncapsulation, OnDestroy } from '@angular/core';
import { FormBuilder, } from '@angular/forms';
// Material
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
// RxJS
import { Subscription, of } from 'rxjs';
// CRUD
import {  } from '../../../../../../core/_base/crud';

@Component({
	// tslint:disable-next-line:component-selector
	selector: 'kt-image-popup',
    templateUrl: './image-popup.component.html',
    styleUrls:['./image-popup.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
	encapsulation: ViewEncapsulation.None
})
export class ImagePopupComponent implements OnInit, OnDestroy {
	// Public properties
    viewLoading: boolean = false;
    image:string;

	/**
	 * Component constructor
	 *
	 * @param dialogRef: MatDialogRef<ImagePopupComponent>
	 * @param data: any
	 * @param fb: FormBuilder
	 * @param store: Store<AppState>
	 * @param typesUtilsService: TypesUtilsService
	 */
	constructor(public dialogRef: MatDialogRef<ImagePopupComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		) {
	}

	/**
	 * @ Lifecycle sequences => https://angular.io/guide/lifecycle-hooks
	 */

	/**
	 * On init
	 */
	ngOnInit() {
        this.image = this.data.image;
	}

	/**
	 * On destroy
	 */
	ngOnDestroy() {
	}
    close(){
        this.dialogRef.close();
    }
}
