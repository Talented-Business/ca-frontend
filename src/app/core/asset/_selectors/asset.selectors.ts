// NGRX
import { createFeatureSelector, createSelector } from '@ngrx/store';
// Lodash
import { each } from 'lodash';
// CRUD
import { QueryResultsModel, HttpExtenstionsModel } from '../../_base/crud';
// State
import { AssetsState } from '../_reducers/asset.reducers';
import { AssetModel } from '../_models/asset.model';

export const selectAssetsState = createFeatureSelector<AssetsState>('assets');

export const selectAssetById = (assetId: number) => createSelector(
    selectAssetsState,
    assetsState => assetsState.entities[assetId]
);

export const selectAssetsPageLoading = createSelector(
    selectAssetsState,
    assetsState => assetsState.listLoading
);

export const selectAssetsActionLoading = createSelector(
    selectAssetsState,
    assetsState => assetsState.actionsloading
);

export const selectAssetsBackProcessingFailed = createSelector(
    selectAssetsState,
    assetsState => assetsState.errors
);

export const selectAssetsBackProcessingSuccess = createSelector(
    selectAssetsState,
    assetsState => assetsState.backProcessSuccess
);

export const selectLastCreatedAssetId = createSelector(
    selectAssetsState,
    assetsState => assetsState.lastCreatedAssetId
);

export const selectAssetsShowInitWaitingMessage = createSelector(
    selectAssetsState,
    assetsState => assetsState.showInitWaitingMessage
);

export const selectAssetsInStore = createSelector(
    selectAssetsState,
    assetsState => {
        const items: AssetModel[] = [];
        each(assetsState.entities, element => {
            items.push(element);
        });
        const httpExtension = new HttpExtenstionsModel();
        const result: AssetModel[] = httpExtension.sortArray(items, assetsState.lastQuery.sortField, assetsState.lastQuery.sortOrder);
        return new QueryResultsModel(result, assetsState.totalCount, '');
    }
);
