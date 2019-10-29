// NGRX
import { createFeatureSelector, createSelector } from '@ngrx/store';
// Lodash
import { each } from 'lodash';
// CRUD
import { QueryResultsModel, HttpExtenstionsModel } from '../../_base/crud';
// State
import { CommissionGroupsState } from '../_reducers/commission-group.reducers';
import { CommissionGroupModel } from '../_models/commission-group.model';

export const selectCommissionGroupsState = createFeatureSelector<CommissionGroupsState>('commissionGroups');

export const selectCommissionGroupById = (commissionGroupId: number) => createSelector(
    selectCommissionGroupsState,
    commissionGroupsState => commissionGroupsState.entities[commissionGroupId]
);

export const selectCommissionGroupsPageLoading = createSelector(
    selectCommissionGroupsState,
    commissionGroupsState => commissionGroupsState.listLoading
);

export const selectCommissionGroupsActionLoading = createSelector(
    selectCommissionGroupsState,
    commissionGroupsState => commissionGroupsState.actionsloading
);

export const selectCommissionGroupsBackProcessingFailed = createSelector(
    selectCommissionGroupsState,
    commissionGroupsState => commissionGroupsState.errors
);

export const selectCommissionGroupsBackProcessingSuccess = createSelector(
    selectCommissionGroupsState,
    commissionGroupsState => commissionGroupsState.backProcessSuccess
);

export const selectLastCreatedCommissionGroupId = createSelector(
    selectCommissionGroupsState,
    commissionGroupsState => commissionGroupsState.lastCreatedCommissionGroupId
);

export const selectCommissionGroupsShowInitWaitingMessage = createSelector(
    selectCommissionGroupsState,
    commissionGroupsState => commissionGroupsState.showInitWaitingMessage
);

export const selectCommissionGroupsInStore = createSelector(
    selectCommissionGroupsState,
    commissionGroupsState => {
        const items: CommissionGroupModel[] = [];
        each(commissionGroupsState.entities, element => {
            items.push(element);
        });
        const httpExtension = new HttpExtenstionsModel();
        const result: CommissionGroupModel[] = httpExtension.sortArray(items, commissionGroupsState.lastQuery.sortField, commissionGroupsState.lastQuery.sortOrder);
        return new QueryResultsModel(result, commissionGroupsState.totalCount, '');
    }
);
