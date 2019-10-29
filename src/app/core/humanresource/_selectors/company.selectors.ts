// NGRX
import { createFeatureSelector, createSelector } from '@ngrx/store';
// Lodash
import { each } from 'lodash';
// CRUD
import { QueryResultsModel, HttpExtenstionsModel } from '../../_base/crud';
// State
import { CompaniesState } from '../_reducers/company.reducers';
import { CompanyModel } from '../_models/company.model';

export const selectCompaniesState = createFeatureSelector<CompaniesState>('companies');

export const selectCompanyById = (companyId: number) => createSelector(
    selectCompaniesState,
    companiesState => companiesState.entities[companyId]
);

export const selectCompaniesPageLoading = createSelector(
    selectCompaniesState,
    companiesState => companiesState.listLoading
);

export const selectCompaniesActionLoading = createSelector(
    selectCompaniesState,
    companiesState => companiesState.actionsloading
);

export const selectCompaniesBackProcessingFailed = createSelector(
    selectCompaniesState,
    companiesState => companiesState.backProcessFailed
);

export const selectCompaniesBackProcessingSuccess = createSelector(
    selectCompaniesState,
    companiesState => companiesState.backProcessSuccess
);

export const selectLastCreatedCompanyId = createSelector(
    selectCompaniesState,
    companiesState => companiesState.lastCreatedCompanyId
);

export const selectCompaniesShowInitWaitingMessage = createSelector(
    selectCompaniesState,
    companiesState => companiesState.showInitWaitingMessage
);

export const selectCompaniesInStore = createSelector(
    selectCompaniesState,
    companiesState => {
        const items: CompanyModel[] = [];
        each(companiesState.entities, element => {
            items.push(element);
        });
        const httpExtension = new HttpExtenstionsModel();
        const result: CompanyModel[] = httpExtension.sortArray(items, companiesState.lastQuery.sortField, companiesState.lastQuery.sortOrder);
        return new QueryResultsModel(result, companiesState.totalCount, '');
    }
);
