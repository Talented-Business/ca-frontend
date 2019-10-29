// NGRX
import { createFeatureSelector } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter, Update } from '@ngrx/entity';
// Actions
import { AssetAssignActions, AssetAssignActionTypes } from '../_actions/asset-assign.actions';
// Models
import { AssetAssignModel } from '../_models/asset-assign.model';
import { QueryParamsModel } from '../../_base/crud';

export interface AssetAssignsState extends EntityState<AssetAssignModel> {
    listLoading: boolean;
    backProcessFailed:boolean;
    backProcessSuccess:boolean;
    actionsloading: boolean;
    totalCount: number;
    errors:any;
    lastCreatedAssetAssignId: number;
    lastQuery: QueryParamsModel;
    showInitWaitingMessage: boolean;
}

export const adapter: EntityAdapter<AssetAssignModel> = createEntityAdapter<AssetAssignModel>();

export const initialAssetAssignsState: AssetAssignsState = adapter.getInitialState({
    assetAssignForEdit: null,
    listLoading: false,
    backProcessFailed:false,
    backProcessSuccess:false,
    actionsloading: false,
    totalCount: 0,
    errors:null,
    lastCreatedAssetAssignId: undefined,
    lastQuery: new QueryParamsModel({}),
    showInitWaitingMessage: true
});

export function assetAssignsReducer(state = initialAssetAssignsState, action: AssetAssignActions): AssetAssignsState {
    switch  (action.type) {
        case AssetAssignActionTypes.AssetAssignsPageToggleLoading: {
            return {
                ...state, listLoading: action.payload.isLoading, lastCreatedAssetAssignId: undefined
            };
        }
        case AssetAssignActionTypes.AssetAssignActionToggleLoading: {
            return {
                ...state, actionsloading: action.payload.isLoading
            };
        }
        case AssetAssignActionTypes.AssetAssignOnServerCreated: return {
            ...state
        };
        case AssetAssignActionTypes.AssetAssignCreated: return adapter.addOne(action.payload.assetAssign, {
            ...state, lastCreatedAssetAssignId: action.payload.assetAssign.id
        });
        case AssetAssignActionTypes.AssetAssignUpdated: return adapter.updateOne(action.payload.partialAssetAssign, state);
        case AssetAssignActionTypes.OneAssetAssignDeleted: return adapter.removeOne(action.payload.id, state);
        case AssetAssignActionTypes.ManyAssetAssignsDeleted: return adapter.removeMany(action.payload.ids, state);
        case AssetAssignActionTypes.AssetAssignsPageCancelled: {
            return {
                ...state, listLoading: false, lastQuery: new QueryParamsModel({})
            };
        }
        case AssetAssignActionTypes.AssetAssignsPageLoaded: {
            return adapter.addMany(action.payload.assetAssigns, {
                ...initialAssetAssignsState,
                totalCount: action.payload.totalCount,
                listLoading: false,
                lastQuery: action.payload.page,
                showInitWaitingMessage: false
            });
        }
        case AssetAssignActionTypes.AssetAssignBackProcessFailed:{
            return {
                ...state,backProcessFailed:action.payload.isFailed,errors:action.payload.errors
            }
        }
        case AssetAssignActionTypes.AssetAssignBackProcessSuccess:{
            return {
                ...state,backProcessSuccess:action.payload.isSuccess
            }
        }
        default: return state;
    }
}

export const getAssetAssignState = createFeatureSelector<AssetAssignModel>('assetAssigns');

export const {
    selectAll,
    selectEntities,
    selectIds,
    selectTotal
} = adapter.getSelectors();
