// Angular
import { Component, OnInit, Inject, ChangeDetectionStrategy, ViewEncapsulation, OnDestroy } from '@angular/core';
import { FormBuilder, } from '@angular/forms';
// Material
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
// RxJS
import { Subscription, of } from 'rxjs';
import { delay,tap,catchError } from 'rxjs/operators';
// NGRX
import { Update } from '@ngrx/entity';
import { Store, select } from '@ngrx/store';
// State
import { AppState } from '../../../../../../core/reducers';
// CRUD
import {  } from '../../../../../../core/_base/crud';
// Services and Models
import { EmployeeModel,AttributeModel } from '../../../../../../core/humanresource';

@Component({
	// tslint:disable-next-line:component-selector
	selector: 'kt-recruit-approve-dialog',
    templateUrl: './recruit-approve.dialog.component.html',
    styleUrls:['./recruit-approve.dialog.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
	encapsulation: ViewEncapsulation.None
})
export class RecruitApproveDialogComponent implements OnInit, OnDestroy {
	// Public properties
	recruit: EmployeeModel;
    viewLoading: boolean = false;
    attributes:AttributeModel[];
    addAttribute:AttributeModel;
    tags:AttributeModel[];
	// Private properties
	private componentSubscriptions: Subscription;

	/**
	 * Component constructor
	 *
	 * @param dialogRef: MatDialogRef<RecruitApproveDialogComponent>
	 * @param data: any
	 * @param fb: FormBuilder
	 * @param store: Store<AppState>
	 * @param typesUtilsService: TypesUtilsService
	 */
	constructor(public dialogRef: MatDialogRef<RecruitApproveDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		private store: Store<AppState>,
		) {
	}

	/**
	 * @ Lifecycle sequences => https://angular.io/guide/lifecycle-hooks
	 */

	/**
	 * On init
	 */
	ngOnInit() {
        this.recruit = this.data.recruit;
        this.attributes = [];
        this.tags = [];
        this.store.subscribe((state:any)=>{
            if(this.tags.length==0){
				let attributes:AttributeModel[] = Object.values(state.attributes.entities);
				this.attributes = attributes.filter(attribute=>attribute.status);
			}
        });
	}

	/**
	 * On destroy
	 */
	ngOnDestroy() {
		if (this.componentSubscriptions) {
			this.componentSubscriptions.unsubscribe();
		}
	}

	/**
	 * Returns page title
	 */
	getTitle(): string {
		if (this.recruit.id > 0) {
			return `Please select '${this.recruit.first_name} ${this.recruit.last_name}' attributes `;
		}

		return '';
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
	/**
	 * On Submit
	 */
	onSubmit() {
		let recruit = new EmployeeModel;
		let attributes:number[] = [];
		recruit.id = this.recruit.id;
		this.tags.forEach((tag)=>{
			attributes.push(tag.id)
		});
		recruit.skills = attributes;
		this.dialogRef.close({recruit});
	}
}
