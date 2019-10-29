// NGRX
import { createFeatureSelector } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter, Update } from '@ngrx/entity';
// Actions
import { TimeoffActions, TimeoffActionTypes } from '../_actions/timeoff.actions';
// Models
import { TimeoffModel } from '../_models/timeoff.model';
import { QueryParamsModel } from '../../_base/crud';

export interface TimeoffsState extends EntityState<TimeoffModel> {
    listLoading: boolean;
    backProcessFailed:boolean;
    backProcessSuccess:boolean;
    actionsloading: boolean;
    totalCount: number;
    errors:any;
    lastCreatedTimeoffId: number;
    lastQuery: QueryParamsModel;
    showInitWaitingMessage: boolean;
}

export const adapter: EntityAdapter<TimeoffModel> = createEntityAdapter<TimeoffModel>();

export const initialTimeoffsState: TimeoffsState = adapter.getInitialState({
    timeoffForEdit: null,
    listLoading: false,
    backProcessFailed:false,
    backProcessSuccess:false,
    actionsloading: false,
    totalCount: 0,
    errors:null,
    lastCreatedTimeoffId: undefined,
    lastQuery: new QueryParamsModel({}),
    showInitWaitingMessage: true
});

export function timeoffsReducer(state = initialTimeoffsState, action: TimeoffActions): TimeoffsState {
    switch  (action.type) {
        case TimeoffActionTypes.TimeoffsPageToggleLoading: {
            return {
                ...state, listLoading: action.payload.isLoading, lastCreatedTimeoffId: undefined
            };
        }
        case TimeoffActionTypes.TimeoffActionToggleLoading: {
            return {
                ...state, actionsloading: action.payload.isLoading
            };
        }
        case TimeoffActionTypes.TimeoffOnServerCreated: return {
            ...state
        };
        case TimeoffActionTypes.TimeoffCreated: return adapter.addOne(action.payload.timeoff, {
            ...state, lastCreatedTimeoffId: action.payload.timeoff.id
        });
        case TimeoffActionTypes.TimeoffUpdated: return adapter.updateOne(action.payload.partialTimeoff, state);
        case TimeoffActionTypes.OneTimeoffDeleted: return adapter.removeOne(action.payload.id, state);
        case TimeoffActionTypes.ManyTimeoffsDeleted: return adapter.removeMany(action.payload.ids, state);
        case TimeoffActionTypes.TimeoffsPageCancelled: {
            return {
                ...state, listLoading: false, lastQuery: new QueryParamsModel({})
            };
        }
        case TimeoffActionTypes.TimeoffsPageLoaded: {
            return adapter.addMany(action.payload.timeoffs, {
                ...initialTimeoffsState,
                totalCount: action.payload.totalCount,
                listLoading: false,
                lastQuery: action.payload.page,
                showInitWaitingMessage: false
            });
        }
        case TimeoffActionTypes.TimeoffBackProcessFailed:{
            return {
                ...state,backProcessFailed:action.payload.isFailed,errors:action.payload.errors
            }
        }
        case TimeoffActionTypes.TimeoffBackProcessSuccess:{
            return {
                ...state,backProcessSuccess:action.payload.isSuccess
            }
        }
        default: return state;
    }
}

export const getTimeoffState = createFeatureSelector<TimeoffModel>('timeoffs');

export const {
    selectAll,
    selectEntities,
    selectIds,
    selectTotal
} = adapter.getSelectors();
