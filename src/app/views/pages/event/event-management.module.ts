// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
// NGRX
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
// Translate
import { TranslateModule } from '@ngx-translate/core';
import { PartialsModule } from '../../partials/partials.module';
// Services
import { HttpUtilsService, TypesUtilsService, InterceptService, LayoutUtilsService} from '../../../core/_base/crud';
// Core => Services
import {
	EventService,
} from '../../../core/event';
import {
	EmployeesService,
} from '../../../core/humanresource';
// Shared
import { ActionNotificationComponent } from '../../partials/content/crud';
// Components
import { EventManagementComponent } from './event-management.component';
import { EventListComponent } from './events/list/event-list.component';
import { EventEditDialogComponent } from './events/edit/event-edit.dialog.component';
import { EventReadComponent } from './events/read/event-read.component';
// Material
import {
	MatInputModule,
	MatPaginatorModule,
	MatProgressSpinnerModule,
	MatSortModule,
	MatTableModule,
	MatSelectModule,
	MatMenuModule,
	MatProgressBarModule,
	MatButtonModule,
	MatCheckboxModule,
	MatDialogModule,
	MatTabsModule,
	MatNativeDateModule,
	MatCardModule,
	MatRadioModule,
	MatIconModule,
	MatDatepickerModule,
	MatExpansionModule,
	MatAutocompleteModule,
	MAT_DIALOG_DEFAULT_OPTIONS,
	MatSnackBarModule,
	MatTooltipModule,
	MatGridListModule 
} from '@angular/material';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { MaterialFileInputModule } from 'ngx-material-file-input';
import {
	AuthGuard
} from '../../../core/auth';
import {
	eventsReducer,
	EventEffects,
} from '../../../core/event';
import { NgxPermissionsModule } from 'ngx-permissions';

const routes: Routes = [
	{
		path: '',
		component: EventManagementComponent,
		children: [
			{
				path: '',
				canActivate: [AuthGuard],
				component: EventListComponent,
				data: { roles: [1,2],menus:['Events'] }
			},
			{
				path: 'view/:id',
				canActivate: [AuthGuard],
				component: EventReadComponent,
				data: { roles: [1,2,4,5],menus:['Events'] }
			},
		]
	}
];

@NgModule({
	imports: [
		CommonModule,
		HttpClientModule,
		PartialsModule,
		NgxPermissionsModule.forChild(),
		RouterModule.forChild(routes),
		StoreModule.forFeature('events', eventsReducer),
		EffectsModule.forFeature([EventEffects]),
		FormsModule,
		ReactiveFormsModule,
		TranslateModule.forChild(),
		MatButtonModule,
		MatMenuModule,
		MatSelectModule,
        MatInputModule,
		MatTableModule,
		MatAutocompleteModule,
		MatRadioModule,
		MatIconModule,
		MatNativeDateModule,
		MatProgressBarModule,
		MatDatepickerModule,
		MatCardModule,
		MatPaginatorModule,
		MatSortModule,
		MatCheckboxModule,
		MatProgressSpinnerModule,
		MatSnackBarModule,
		MatExpansionModule,
		MatTabsModule,
		MatTooltipModule,
		MatDialogModule,
		MaterialFileInputModule,
		MatGridListModule,
		CKEditorModule
	],
	providers: [
		InterceptService,
		{
        	provide: HTTP_INTERCEPTORS,
       	 	useClass: InterceptService,
			multi: true
		},
		{
			provide: MAT_DIALOG_DEFAULT_OPTIONS,
			useValue: {
				hasBackdrop: true,
				panelClass: 'kt-mat-dialog-container__wrapper',
				height: 'auto',
				width: '900px'
			}
		},
		EventService,
		EmployeesService,
		HttpUtilsService,
		TypesUtilsService,
		LayoutUtilsService
	],
	entryComponents: [
		ActionNotificationComponent,
		EventEditDialogComponent,
		EventReadComponent,
	],
	declarations: [
		EventManagementComponent,
		EventListComponent,
		EventEditDialogComponent,
		EventReadComponent,
	]
})
export class EventManagementModule {}
