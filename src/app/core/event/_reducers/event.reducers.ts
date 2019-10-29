// NGRX
import { createFeatureSelector } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter, Update } from '@ngrx/entity';
// Actions
import { EventActions, EventActionTypes } from '../_actions/event.actions';
// Models
import { EventModel } from '../_models/event.model';
import { QueryParamsModel } from '../../_base/crud';

export interface EventsState extends EntityState<EventModel> {
    listLoading: boolean;
    backProcessFailed:boolean;
    backProcessSuccess:boolean;
    actionsloading: boolean;
    totalCount: number;
    errors:any;
    lastCreatedEventId: number;
    lastQuery: QueryParamsModel;
    showInitWaitingMessage: boolean;
}

export const adapter: EntityAdapter<EventModel> = createEntityAdapter<EventModel>();

export const initialEventsState: EventsState = adapter.getInitialState({
    eventForEdit: null,
    listLoading: false,
    backProcessFailed:false,
    backProcessSuccess:false,
    actionsloading: false,
    totalCount: 0,
    errors:null,
    lastCreatedEventId: undefined,
    lastQuery: new QueryParamsModel({}),
    showInitWaitingMessage: true
});

export function eventsReducer(state = initialEventsState, action: EventActions): EventsState {
    switch  (action.type) {
        case EventActionTypes.EventsPageToggleLoading: {
            return {
                ...state, listLoading: action.payload.isLoading, lastCreatedEventId: undefined
            };
        }
        case EventActionTypes.EventActionToggleLoading: {
            return {
                ...state, actionsloading: action.payload.isLoading
            };
        }
        case EventActionTypes.EventOnServerCreated: return {
            ...state
        };
        case EventActionTypes.EventCreated: return adapter.addOne(action.payload.event, {
            ...state, lastCreatedEventId: action.payload.event.id
        });
        case EventActionTypes.EventUpdated: return adapter.updateOne(action.payload.partialEvent, state);
        case EventActionTypes.OneEventDeleted: return adapter.removeOne(action.payload.id, state);
        case EventActionTypes.ManyEventsDeleted: return adapter.removeMany(action.payload.ids, state);
        case EventActionTypes.EventsPageCancelled: {
            return {
                ...state, listLoading: false, lastQuery: new QueryParamsModel({})
            };
        }
        case EventActionTypes.EventsPageLoaded: {
            return adapter.addMany(action.payload.events, {
                ...initialEventsState,
                totalCount: action.payload.totalCount,
                listLoading: false,
                lastQuery: action.payload.page,
                showInitWaitingMessage: false
            });
        }
        case EventActionTypes.EventBackProcessFailed:{
            return {
                ...state,backProcessFailed:action.payload.isFailed,errors:action.payload.errors
            }
        }
        case EventActionTypes.EventBackProcessSuccess:{
            return {
                ...state,backProcessSuccess:action.payload.isSuccess
            }
        }
        default: return state;
    }
}

export const getEventState = createFeatureSelector<EventModel>('events');

export const {
    selectAll,
    selectEntities,
    selectIds,
    selectTotal
} = adapter.getSelectors();
