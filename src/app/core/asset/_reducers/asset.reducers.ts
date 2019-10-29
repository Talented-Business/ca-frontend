// NGRX
import { createFeatureSelector } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter, Update } from '@ngrx/entity';
// Actions
import { AssetActions, AssetActionTypes } from '../_actions/asset.actions';
// Models
import { AssetModel } from '../_models/asset.model';
import { QueryParamsModel } from '../../_base/crud';

export interface AssetsState extends EntityState<AssetModel> {
    listLoading: boolean;
    backProcessFailed:boolean;
    backProcessSuccess:boolean;
    actionsloading: boolean;
    totalCount: number;
    errors:any;
    lastCreatedAssetId: number;
    lastQuery: QueryParamsModel;
    showInitWaitingMessage: boolean;
}

export const adapter: EntityAdapter<AssetModel> = createEntityAdapter<AssetModel>();

export const initialAssetsState: AssetsState = adapter.getInitialState({
    assetForEdit: null,
    listLoading: false,
    backProcessFailed:false,
    backProcessSuccess:false,
    actionsloading: false,
    totalCount: 0,
    errors:null,
    lastCreatedAssetId: undefined,
    lastQuery: new QueryParamsModel({}),
    showInitWaitingMessage: true
});

export function assetsReducer(state = initialAssetsState, action: AssetActions): AssetsState {
    switch  (action.type) {
        case AssetActionTypes.AssetsPageToggleLoading: {
            return {
                ...state, listLoading: action.payload.isLoading, lastCreatedAssetId: undefined
            };
        }
        case AssetActionTypes.AssetActionToggleLoading: {
            return {
                ...state, actionsloading: action.payload.isLoading
            };
        }
        case AssetActionTypes.AssetOnServerCreated: return {
            ...state
        };
        case AssetActionTypes.AssetCreated: return adapter.addOne(action.payload.asset, {
            ...state, lastCreatedAssetId: action.payload.asset.id
        });
        case AssetActionTypes.AssetUpdated: return adapter.updateOne(action.payload.partialAsset, state);
        case AssetActionTypes.OneAssetDeleted: return adapter.removeOne(action.payload.id, state);
        case AssetActionTypes.ManyAssetsDeleted: return adapter.removeMany(action.payload.ids, state);
        case AssetActionTypes.AssetsPageCancelled: {
            return {
                ...state, listLoading: false, lastQuery: new QueryParamsModel({})
            };
        }
        case AssetActionTypes.AssetsPageLoaded: {
            return adapter.addMany(action.payload.assets, {
                ...initialAssetsState,
                totalCount: action.payload.totalCount,
                listLoading: false,
                lastQuery: action.payload.page,
                showInitWaitingMessage: false
            });
        }
        case AssetActionTypes.AssetBackProcessFailed:{
            return {
                ...state,backProcessFailed:action.payload.isFailed,errors:action.payload.errors
            }
        }
        case AssetActionTypes.AssetBackProcessSuccess:{
            return {
                ...state,backProcessSuccess:action.payload.isSuccess
            }
        }
        default: return state;
    }
}

export const getAssetState = createFeatureSelector<AssetModel>('assets');

export const {
    selectAll,
    selectEntities,
    selectIds,
    selectTotal
} = adapter.getSelectors();
