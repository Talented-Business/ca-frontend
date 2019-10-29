// NGRX
import { createFeatureSelector, createSelector } from '@ngrx/store';
// Lodash
import { each } from 'lodash';
// CRUD
import { QueryResultsModel, HttpExtenstionsModel } from '../../_base/crud';
// State
import { CompanyUsersState } from '../_reducers/company-user.reducers';
import { CompanyUserModel } from '../_models/company-user.model';

export const selectCompanyUsersState = createFeatureSelector<CompanyUsersState>('companyUsers');

export const selectCompanyUserById = (companyUserId: number) => createSelector(
    selectCompanyUsersState,
    companyUsersState => companyUsersState.entities[companyUserId]
);

export const selectCompanyUsersPageLoading = createSelector(
    selectCompanyUsersState,
    companyUsersState => companyUsersState.listLoading
);

export const selectCompanyUsersActionLoading = createSelector(
    selectCompanyUsersState,
    companyUsersState => companyUsersState.actionsloading
);

export const selectCompanyUsersBackProcessingFailed = createSelector(
    selectCompanyUsersState,
    companyUsersState => companyUsersState.errors
);

export const selectCompanyUsersBackProcessingSuccess = createSelector(
    selectCompanyUsersState,
    companyUsersState => companyUsersState.backProcessSuccess
);

export const selectLastCreatedCompanyUserId = createSelector(
    selectCompanyUsersState,
    companyUsersState => companyUsersState.lastCreatedCompanyUserId
);

export const selectCompanyUsersShowInitWaitingMessage = createSelector(
    selectCompanyUsersState,
    companyUsersState => companyUsersState.showInitWaitingMessage
);

export const selectCompanyUsersInStore = createSelector(
    selectCompanyUsersState,
    companyUsersState => {
        const items: CompanyUserModel[] = [];
        each(companyUsersState.entities, element => {
            items.push(element);
        });
        const httpExtension = new HttpExtenstionsModel();
        const result: CompanyUserModel[] = httpExtension.sortArray(items, companyUsersState.lastQuery.sortField, companyUsersState.lastQuery.sortOrder);
        return new QueryResultsModel(result, companyUsersState.totalCount, '');
    }
);
