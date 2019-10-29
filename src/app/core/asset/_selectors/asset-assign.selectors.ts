// NGRX
import { createFeatureSelector, createSelector } from '@ngrx/store';
// Lodash
import { each } from 'lodash';
// CRUD
import { QueryResultsModel, HttpExtenstionsModel } from '../../_base/crud';
// State
import { AssetAssignsState } from '../_reducers/asset-assign.reducers';
import { AssetAssignModel } from '../_models/asset-assign.model';

export const selectAssetAssignsState = createFeatureSelector<AssetAssignsState>('assetAssigns');

export const selectAssetAssignById = (assetAssignId: number) => createSelector(
    selectAssetAssignsState,
    assetAssignsState => assetAssignsState.entities[assetAssignId]
);

export const selectAssetAssignsPageLoading = createSelector(
    selectAssetAssignsState,
    assetAssignsState => assetAssignsState.listLoading
);

export const selectAssetAssignsActionLoading = createSelector(
    selectAssetAssignsState,
    assetAssignsState => assetAssignsState.actionsloading
);

export const selectAssetAssignsBackProcessingFailed = createSelector(
    selectAssetAssignsState,
    assetAssignsState => assetAssignsState.errors
);

export const selectAssetAssignsBackProcessingSuccess = createSelector(
    selectAssetAssignsState,
    assetAssignsState => assetAssignsState.backProcessSuccess
);

export const selectLastCreatedAssetAssignId = createSelector(
    selectAssetAssignsState,
    assetAssignsState => assetAssignsState.lastCreatedAssetAssignId
);

export const selectAssetAssignsShowInitWaitingMessage = createSelector(
    selectAssetAssignsState,
    assetAssignsState => assetAssignsState.showInitWaitingMessage
);

export const selectAssetAssignsInStore = createSelector(
    selectAssetAssignsState,
    assetAssignsState => {
        const items: AssetAssignModel[] = [];
        if(assetAssignsState == undefined){
            return assetAssignsState;
        }
        each(assetAssignsState.entities, element => {
            items.push(element);
        });
        const httpExtension = new HttpExtenstionsModel();
        const result: AssetAssignModel[] = httpExtension.sortArray(items, assetAssignsState.lastQuery.sortField, assetAssignsState.lastQuery.sortOrder);
        return new QueryResultsModel(result, assetAssignsState.totalCount, '');
    }
);
