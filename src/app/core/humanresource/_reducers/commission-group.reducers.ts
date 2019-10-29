// NGRX
import { createFeatureSelector } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter, Update } from '@ngrx/entity';
// Actions
import { CommissionGroupActions, CommissionGroupActionTypes } from '../_actions/commission-group.actions';
// Models
import { CommissionGroupModel } from '../_models/commission-group.model';
import { QueryParamsModel } from '../../_base/crud';

export interface CommissionGroupsState extends EntityState<CommissionGroupModel> {
    listLoading: boolean;
    backProcessFailed:boolean;
    backProcessSuccess:boolean;
    actionsloading: boolean;
    totalCount: number;
    errors:any;
    lastCreatedCommissionGroupId: number;
    lastQuery: QueryParamsModel;
    showInitWaitingMessage: boolean;
}

export const adapter: EntityAdapter<CommissionGroupModel> = createEntityAdapter<CommissionGroupModel>();

export const initialCommissionGroupsState: CommissionGroupsState = adapter.getInitialState({
    commissionGroupForEdit: null,
    listLoading: false,
    backProcessFailed:false,
    backProcessSuccess:false,
    actionsloading: false,
    totalCount: 0,
    errors:null,
    lastCreatedCommissionGroupId: undefined,
    lastQuery: new QueryParamsModel({}),
    showInitWaitingMessage: true
});

export function commissionGroupsReducer(state = initialCommissionGroupsState, action: CommissionGroupActions): CommissionGroupsState {
    switch  (action.type) {
        case CommissionGroupActionTypes.CommissionGroupsPageToggleLoading: {
            return {
                ...state, listLoading: action.payload.isLoading, lastCreatedCommissionGroupId: undefined
            };
        }
        case CommissionGroupActionTypes.CommissionGroupActionToggleLoading: {
            return {
                ...state, actionsloading: action.payload.isLoading
            };
        }
        case CommissionGroupActionTypes.CommissionGroupOnServerCreated: return {
            ...state
        };
        case CommissionGroupActionTypes.CommissionGroupCreated: return adapter.addOne(action.payload.commissionGroup, {
            ...state, lastCreatedCommissionGroupId: action.payload.commissionGroup.id
        });
        case CommissionGroupActionTypes.CommissionGroupUpdated: return adapter.updateOne(action.payload.partialCommissionGroup, state);
        case CommissionGroupActionTypes.OneCommissionGroupDeleted: return adapter.removeOne(action.payload.id, state);
        case CommissionGroupActionTypes.ManyCommissionGroupsDeleted: return adapter.removeMany(action.payload.ids, state);
        case CommissionGroupActionTypes.CommissionGroupsPageCancelled: {
            return {
                ...state, listLoading: false, lastQuery: new QueryParamsModel({})
            };
        }
        case CommissionGroupActionTypes.CommissionGroupsPageLoaded: {
            return adapter.addMany(action.payload.commissionGroups, {
                ...initialCommissionGroupsState,
                totalCount: action.payload.totalCount,
                listLoading: false,
                lastQuery: action.payload.page,
                showInitWaitingMessage: false
            });
        }
        case CommissionGroupActionTypes.CommissionGroupBackProcessFailed:{
            return {
                ...state,backProcessFailed:action.payload.isFailed,errors:action.payload.errors
            }
        }
        case CommissionGroupActionTypes.CommissionGroupBackProcessSuccess:{
            return {
                ...state,backProcessSuccess:action.payload.isSuccess
            }
        }
        default: return state;
    }
}

export const getCommissionGroupState = createFeatureSelector<CommissionGroupModel>('commissionGroups');

export const {
    selectAll,
    selectEntities,
    selectIds,
    selectTotal
} = adapter.getSelectors();
