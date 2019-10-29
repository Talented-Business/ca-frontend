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
	EmployeesService,
	AttributeService,
	DepartmentService,
	CompanyService,
	ContractService,
	CompanyUserService,
	JobService,
	ProposalService,
	TimeoffService,
	CommissionGroupService,
	CommissionService,
	InvoiceService,
	ConfigService,
	InvoiceItemService,
} from '../../../core/humanresource';
import {
    AssetAssignService
} from '../../../core/asset';

// Shared
import { ActionNotificationComponent } from '../../partials/content/crud';
// Components
import { EmployeeManagementComponent } from './employee-management.component';
import { EmployeesListComponent } from './employees/employees-list/employees-list.component';
import { CompanyEmployeesListComponent } from './employees/company/employees-list.component';
import { CompanyEmployeeView } from './employees/company-employee-view/employee-view.component';
import { EmployeeEditComponent } from './employees/employee-edit/employee-edit.component';
import { EmployeeReadComponent } from './employees/employee-read/employee-read.component';
import { RecruitsListComponent } from './employees/recruit/list/recruit-list.component';
import { RecruitLayoutComponent } from './employees/recruit/layout/recruit-layout.component';
import { RecruitAddComponent } from './employees/recruit/add/recruit-add.component';
import { RecruitEditComponent,RecruitRejectDialogComponent } from './employees/recruit/edit/recruit-edit.component';
import { RecruitApproveDialogComponent } from './employees/recruit/approve/recruit-approve.dialog.component';
import { CompanyListComponent } from './companies/list/company-list.component';
import { CompanyReadComponent } from './companies/read/company-read.component';
import { CompanyEditDialogComponent } from './companies/edit/company-edit.dialog.component';
import { CompanyAddComponent } from './companies/add/company-add.component';
import { ContractListComponent } from './contracts/list/contract-list.component';
import { ContractEditDialogComponent } from './contracts/edit/contract-edit.dialog.component';
import { CompanyUserListComponent } from './company-users/list/company-user-list.component';
import { CompanyUserEditDialogComponent } from './company-users/edit/company-user-edit.dialog.component';
import { JobListComponent } from './jobs/list/job-list.component';
import { JobViewComponent } from './jobs/view-jobs/job-view.component';
import { JobEditDialogComponent } from './jobs/edit/job-edit.dialog.component';
import { ProposalApplyDialogComponent } from './jobs/apply-proposal/proposal-apply.dialog.component';
import { JobReadComponent } from './jobs/read/job-read.component';
import { SettingsComponent } from './settings/settings.component';
import { DepartmentListComponent } from './settings/departments/list/department-list.component';
import { DepartmentEditDialogComponent } from './settings/departments/edit/department-edit.dialog.component';
import { AttributeListComponent } from './settings/skills/list/attribute-list.component';
import { AttributeEditDialogComponent } from './settings/skills/edit/attribute-edit.dialog.component';
import { ProposalListComponent } from './proposal/list/proposal-list.component';
import { ProposalStatusDialogComponent } from './proposal/update-status/proposal-status.dialog.component';
import { ProfileDialogComponent } from './proposal/view-profile/profile.dialog.component'
import { TimeoffEditDialogComponent } from './timeoffs/edit/timeoff-edit.dialog.component';
import { TimeoffListComponent } from './timeoffs/list/timeoff-list.component';
import { TimeoffReadDialogComponent } from './timeoffs/read/timeoff-read.dialog.component';
import { ImagePopupComponent } from './employees/recruit/image-modal/image-popup.component'
import { PhotoAddDialogComponent } from './employees/photos/photo-add.dialog.component';
import { DocumentListComponent } from './employees/documents/list/document-list.component';
import { DocumentEditDialogComponent } from './employees/documents/edit/document-edit.dialog.component';
import { BasicUserProfileComponent } from './profile/basic/profile.component';
import { MetaUserProfileComponent } from './profile/meta/meta-profile.component';
import { HoursUserProfileComponent } from './profile/hours/hours.component'
import { BankUserProfileComponent } from './profile/bank/bank.component'
import { AssetsUserProfileComponent } from './profile/assets/assets.component'
import { HoursListComponent } from './companies/hours/list/hours-list.component';
import { HoursEditDialogComponent } from './companies/hours/edit/hours-edit.dialog.component';
import { EmployeeAssetAssignListComponent } from './employees/asset/view-assets.component';
import { EmploymentListComponent } from './employees/employment/employment-list.component';
import { ContractViewDialogComponent } from './contracts/read/contract-read.dialog.component';
import { CommissionListComponent } from './commissions/list/commission-list.component';
import { CommissionEditDialogComponent } from './commissions/edit/commission-edit.dialog.component';
import { InvoiceListComponent } from './invoices/list/invoice-list.component';
import { InvoiceCompanyListComponent } from './invoices/company-list/invoice-company-list.component';
import { InvoiceMemberListComponent } from './invoices/member-list/invoice-member-list.component';
import { InvoiceEditComponent } from './invoices/edit/invoice-edit.component';
import { InvoiceReadDialogComponent } from './invoices/read/invoice-read.dialog.component';
import { InvoiceCompanyReadDialogComponent } from './invoices/company-read/invoice-company-read.dialog.component';
import { InvoiceItemAddDialogComponent } from './invoices/add/invoice-item-add.dialog.component';
import { SettingEditDialogComponent } from './settings/edit/setting-edit.dialog.component';
import { ReportsComponent } from './reports/reports.component';
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
import { LightboxModule } from 'ngx-lightbox';
import { MaterialFileInputModule } from 'ngx-material-file-input';
import {
	AuthGuard
} from '../../../core/auth';
import {
	employeesReducer,
	EmployeeEffects,
	recruitsReducer,
	RecruitEffects,
	attributesReducer,
	AttributeEffects,
	departmentsReducer,
	DepartmentEffects,
	companiesReducer,
	CompanyEffects,
	contractsReducer,
	ContractEffects,
	companyUsersReducer,
	CompanyUserEffects,
	jobsReducer,
	JobEffects,
	proposalsReducer,
	ProposalEffects,
	timeoffsReducer,
	TimeoffEffects,
	commissionGroupsReducer,
	CommissionGroupEffects,
	invoicesReducer,
	InvoiceEffects,
} from '../../../core/humanresource';
import {
	assetAssignsReducer,
	AssetAssignEffects
} from '../../../core/asset';

import { NgxPermissionsModule } from 'ngx-permissions';
import { SanitizeHtmlPipe } from '../../../pipe/sanitize-html.pipe';
const routes: Routes = [
	{
		path: 'new',
		component: RecruitLayoutComponent
	},
	{
		path: '',
		component: EmployeeManagementComponent,
		children: [
			{
				path: '',
				canActivate: [AuthGuard],
				redirectTo: 'employees',
				pathMatch: 'full',
				data: { roles: [1,2],menus:['Employees'] }
			},
			{
				path: 'employees',
				canActivate: [AuthGuard],
				component: EmployeesListComponent,
				data: { roles: [1,2],menus:['Employees'] }
			},
			{
				path: 'recruits',
				canActivate: [AuthGuard],
				component: RecruitsListComponent,
				data: { roles: [1,2],menus:['Employees'] }
			},
			{
				path: 'recruits/view',
				canActivate: [AuthGuard],
				component: RecruitEditComponent,
				data: { roles: [1,2],menus:['Employees'] }
			},
			{
				path: 'recruits/view/:id',
				canActivate: [AuthGuard],
				component: RecruitEditComponent,
				data: { roles: [1,2],menus:['Employees'] }
			},
			{
				path: 'employees',
				canActivate: [AuthGuard],
				component: EmployeesListComponent,
				data: { roles: [1,2],menus:['Employees'] }
			},
			{
				path: 'employees/edit',
				canActivate: [AuthGuard],
				component: EmployeeEditComponent,
				data: { roles: [1,2],menus:['Employees'] }
			},
			{
				path: 'employees/edit/:id',
				canActivate: [AuthGuard],
				component: EmployeeEditComponent,
				data: { roles: [1,2],menus:['Employees'] }
			},
			{
				path: 'employees/view/:id',
				canActivate: [AuthGuard],
				component: EmployeeReadComponent,
				data: { roles: [1,2],menus:['Employees'] }
			},
			{
				path: 'companies',
				canActivate: [AuthGuard],
				component: CompanyListComponent,
				data: { roles: [1,2],menus:['Companies'] }
			},
			{
				path: 'companies/view',
				canActivate: [AuthGuard],
				component: CompanyReadComponent,
				data: { roles: [1,2],menus:['Companies'] }
			},
			{
				path: 'companies/view/:id',
				canActivate: [AuthGuard],
				component: CompanyReadComponent,
				data: { roles: [1,2],menus:['Companies'] }
			},
			{
				path: 'companies/add',
				canActivate: [AuthGuard],
				component: CompanyAddComponent,
				data: { roles: [1,2],menus:['Companies'] }
			},
			{
				path: 'companies/hours',
				canActivate: [AuthGuard],
				component: HoursListComponent,
				data: { roles: [3] }
			},
			{
				path: 'jobs',
				canActivate: [AuthGuard],
				component: JobListComponent,
				data: { roles: [1,2],menus:['Jobs'] }
			},
			{
				path: 'jobs/list',
				canActivate: [AuthGuard],
				component: JobViewComponent,
				data: { roles: [4],menus:['Jobs'] }
			},
			{
				path: 'jobs/view/:id',
				canActivate: [AuthGuard],
				component: JobReadComponent,
				data: { roles: [1,2],menus:['Jobs'] }
			},
			{
				path: 'proposals',
				canActivate: [AuthGuard],
				component: ProposalListComponent,
				data: { roles: [3] }
			},
			{
				path: 'companyEmployees',
				canActivate: [AuthGuard],
				component: CompanyEmployeesListComponent,
				data: { roles: [3] }
			},
			{
				path: 'companyEmployees/view/:id',
				canActivate: [AuthGuard],
				component: CompanyEmployeeView,
				data: { roles: [3] }
			},
			{
				path: 'timeoffs',
				canActivate: [AuthGuard],
				component: TimeoffListComponent,
				data: { roles: [3,4,5] }
			},
			{
				path: 'settings',
				canActivate: [AuthGuard],
				component: SettingsComponent,
				data: { roles: [1,2] }
			},
			{
				path: 'profile',
				canActivate: [AuthGuard],
				component: BasicUserProfileComponent,
				data: { roles: [4,5] }
			},
			{
				path: 'profile/assets',
				canActivate: [AuthGuard],
				component: AssetsUserProfileComponent,
				data: { roles: [4,5] }
			},
			{
				path: 'profile/bank',
				canActivate: [AuthGuard],
				component: BankUserProfileComponent,
				data: { roles: [4,5] }
			},
			{
				path: 'profile/hours',
				canActivate: [AuthGuard],
				component: HoursUserProfileComponent,
				data: { roles: [4,5] }
			},
			{
				path: 'commissions',
				canActivate: [AuthGuard],
				component: CommissionListComponent,
				data: { roles: [4,5] }
			},
			{
				path: 'billings',
				canActivate: [AuthGuard],
				component: InvoiceListComponent,
				data: { roles: [1,2],menus:['Invoices'] }
			},
			{
				path: 'billings/add',
				canActivate: [AuthGuard],
				component: InvoiceEditComponent,
				data: { roles: [1,2] }
			},
			{
				path: 'billings/edit/:id',
				canActivate: [AuthGuard],
				component: InvoiceEditComponent,
				data: { roles: [1,2] }
			},
			{
				path: 'invoices',
				canActivate: [AuthGuard],
				component: InvoiceCompanyListComponent,
				data: { roles: [3] }
			},
			{
				path: 'payments',
				canActivate: [AuthGuard],
				component: InvoiceMemberListComponent,
				data: { roles: [4,5] }
			},
			{
				path: 'reports',
				canActivate: [AuthGuard],
				component: ReportsComponent,
				data: { roles: [1,2] }
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
		StoreModule.forFeature('employees', employeesReducer),
		StoreModule.forFeature('recruits', recruitsReducer),
		StoreModule.forFeature('attributes', attributesReducer),
		StoreModule.forFeature('departments', departmentsReducer),
		StoreModule.forFeature('companies', companiesReducer),
		StoreModule.forFeature('contracts', contractsReducer),
		StoreModule.forFeature('companyUsers', companyUsersReducer),
		StoreModule.forFeature('jobs', jobsReducer),
		StoreModule.forFeature('proposals', proposalsReducer),
		StoreModule.forFeature('timeoffs', timeoffsReducer),
		StoreModule.forFeature('commissionGroups', commissionGroupsReducer),
		StoreModule.forFeature('assetAssigns', assetAssignsReducer),
		StoreModule.forFeature('invoices', invoicesReducer),
		EffectsModule.forFeature([EmployeeEffects,RecruitEffects,AttributeEffects,DepartmentEffects,CompanyEffects,ContractEffects,CompanyUserEffects]),
		EffectsModule.forFeature([JobEffects,ProposalEffects,TimeoffEffects,InvoiceEffects,CommissionGroupEffects,AssetAssignEffects]),
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
		LightboxModule
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
		EmployeesService,
		AttributeService,
		DepartmentService,
		CompanyService,
		ContractService,
		CompanyUserService,
		JobService,
		ProposalService,
		TimeoffService,
		CommissionGroupService,
		HttpUtilsService,
		TypesUtilsService,
		LayoutUtilsService,
		AssetAssignService,
		CommissionGroupService,
		CommissionService,
		InvoiceService,
		InvoiceItemService,
		ConfigService,
	],
	entryComponents: [
		ActionNotificationComponent,
		RecruitEditComponent,
		EmployeeEditComponent,
		RecruitApproveDialogComponent,
		RecruitRejectDialogComponent,
		CompanyEditDialogComponent,
		CompanyAddComponent,
		ContractEditDialogComponent,
		CompanyUserEditDialogComponent,
		JobEditDialogComponent,
		JobReadComponent,
		SettingsComponent,
		DepartmentEditDialogComponent,
		AttributeEditDialogComponent,
		ProposalApplyDialogComponent,
		ProposalStatusDialogComponent,
		ProfileDialogComponent,
		TimeoffEditDialogComponent,
		TimeoffReadDialogComponent,
		ImagePopupComponent,
		PhotoAddDialogComponent,
		DocumentEditDialogComponent,
		BasicUserProfileComponent,
		MetaUserProfileComponent,
		HoursEditDialogComponent,
		ContractViewDialogComponent,
		CommissionEditDialogComponent,
		InvoiceEditComponent,
		SettingEditDialogComponent,
		InvoiceItemAddDialogComponent,
		InvoiceReadDialogComponent,
		InvoiceCompanyReadDialogComponent,
	],
	declarations: [
		EmployeeManagementComponent,
		EmployeesListComponent,
		EmployeeEditComponent,
		EmployeeReadComponent,
		RecruitAddComponent,
		RecruitsListComponent,
		RecruitLayoutComponent,
		RecruitEditComponent,
		RecruitApproveDialogComponent,
		RecruitRejectDialogComponent,
		CompanyListComponent,
		CompanyReadComponent,
		CompanyAddComponent,
		CompanyEditDialogComponent,
		ContractListComponent,
		ContractEditDialogComponent,
		CompanyUserListComponent,
		CompanyUserEditDialogComponent,
		JobListComponent,
		JobEditDialogComponent,
		JobReadComponent,
		SettingsComponent,
		DepartmentListComponent,
		DepartmentEditDialogComponent,
		AttributeListComponent,
		AttributeEditDialogComponent,
		JobViewComponent,
		ProposalApplyDialogComponent,
		ProposalListComponent,
		ProposalStatusDialogComponent,
		ProfileDialogComponent,
		TimeoffListComponent,
		TimeoffEditDialogComponent,
		TimeoffReadDialogComponent,
		ImagePopupComponent,
		PhotoAddDialogComponent,
		DocumentListComponent,
		DocumentEditDialogComponent,
		BasicUserProfileComponent,
		MetaUserProfileComponent,
		SanitizeHtmlPipe,
		BankUserProfileComponent,
		AssetsUserProfileComponent,
		HoursUserProfileComponent,
		HoursListComponent,
		HoursEditDialogComponent,
		CompanyEmployeesListComponent,
		CompanyEmployeeView,
		EmployeeAssetAssignListComponent,
		EmploymentListComponent,
		ContractViewDialogComponent,
		CommissionListComponent,
		CommissionEditDialogComponent,
		InvoiceListComponent,
		InvoiceCompanyListComponent,
		InvoiceMemberListComponent,
		InvoiceEditComponent,
		SettingEditDialogComponent,
		InvoiceReadDialogComponent,
		InvoiceItemAddDialogComponent,
		InvoiceCompanyReadDialogComponent,
		ReportsComponent,
	]
})
export class EmployeeManagementModule {}
