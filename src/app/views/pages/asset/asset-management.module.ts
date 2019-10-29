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
	AssetService,AssetAssignService,
} from '../../../core/asset';
import {
	EmployeesService,
} from '../../../core/humanresource';
// Shared
import { ActionNotificationComponent } from '../../partials/content/crud';
// Components
import { AssetManagementComponent } from './asset-management.component';
import { AssetListComponent } from './assets/list/asset-list.component';
import { AssetEditDialogComponent } from './assets/edit/asset-edit.dialog.component';
import { AssetReadComponent } from './assets/read/asset-read.component';
import { AssetAssignListComponent } from './assigns/list/assign-list.component';
import { AssetAssignEditDialogComponent } from './assigns/edit/assign-edit.dialog.component';
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
import { MaterialFileInputModule } from 'ngx-material-file-input';
import {
	AuthGuard
} from '../../../core/auth';
import {
	assetsReducer,
	AssetEffects,
	assetAssignsReducer,
	AssetAssignEffects
} from '../../../core/asset';
import { NgxPermissionsModule } from 'ngx-permissions';

const routes: Routes = [
	{
		path: '',
		component: AssetManagementComponent,
		children: [
			{
				path: '',
				canActivate: [AuthGuard],
				redirectTo: 'assets',
				pathMatch: 'full',
				data: { roles: [1,2],menus:['Assets'] }
			},
			{
				path: 'assets',
				canActivate: [AuthGuard],
				component: AssetListComponent,
				data: { roles: [1,2],menus:['Assets'] }
			},
			{
				path: 'assets/view/:id',
				canActivate: [AuthGuard],
				component: AssetReadComponent,
				data: { roles: [1,2],menus:['Assets'] }
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
		StoreModule.forFeature('assets', assetsReducer),
		StoreModule.forFeature('assetAssigns', assetAssignsReducer),
		EffectsModule.forFeature([AssetEffects,AssetAssignEffects]),
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
		MatGridListModule
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
		AssetService,
		EmployeesService,
		AssetAssignService,
		HttpUtilsService,
		TypesUtilsService,
		LayoutUtilsService
	],
	entryComponents: [
		ActionNotificationComponent,
		AssetEditDialogComponent,
		AssetReadComponent,
		AssetAssignEditDialogComponent,
	],
	declarations: [
		AssetManagementComponent,
		AssetListComponent,
		AssetEditDialogComponent,
		AssetReadComponent,
		AssetAssignListComponent,
		AssetAssignEditDialogComponent
	]
})
export class AssetManagementModule {}
