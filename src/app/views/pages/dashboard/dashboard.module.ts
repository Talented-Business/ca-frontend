// Angular
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
// NGRX
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';

import {
	AuthGuard
} from '../../../core/auth';

// Core Module
import { CoreModule } from '../../../core/core.module';
import { PartialsModule } from '../../partials/partials.module';
import { DashboardComponent } from './dashboard.component';
import { AdminDashboardComponent } from './admin/admin-dashboard.component';
import { CompanyDashboardComponent } from './company/company-dashboard.component';
import { MemberDashboardComponent } from './member/member-dashboard.component';
import { EventIndexComponent } from '../event/events/index/event-index.component';


// Core => Services
import {
	ConfigService,
} from '../../../core/humanresource';
import {
	EventService,
} from '../../../core/event';
// Material
import {
	MatPaginatorModule,
	MatProgressSpinnerModule,
	MatSortModule,
} from '@angular/material';
import {
	eventsReducer,
	EventEffects,
} from '../../../core/event';

@NgModule({
	imports: [
		CommonModule,
		PartialsModule,
		CoreModule,
		FormsModule,
		RouterModule.forChild([
			{
				path: '',
				component: DashboardComponent
			},
		]),
		StoreModule.forFeature('events', eventsReducer),
		EffectsModule.forFeature([EventEffects]),
		MatPaginatorModule,
		MatSortModule,
		MatProgressSpinnerModule,
	],
	providers: [ConfigService,EventService],
	declarations: [
		DashboardComponent,
		AdminDashboardComponent,
		CompanyDashboardComponent,
		MemberDashboardComponent,
		EventIndexComponent,
	]
})
export class DashboardModule {
}
