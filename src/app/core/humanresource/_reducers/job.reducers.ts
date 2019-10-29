// NGRX
import { createFeatureSelector } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter, Update } from '@ngrx/entity';
// Actions
import { JobActions, JobActionTypes } from '../_actions/job.actions';
// Models
import { JobModel } from '../_models/job.model';
import { QueryParamsModel } from '../../_base/crud';

export interface JobsState extends EntityState<JobModel> {
    listLoading: boolean;
    backProcessFailed:boolean;
    backProcessSuccess:boolean;
    actionsloading: boolean;
    totalCount: number;
    errors:any;
    lastCreatedJobId: number;
    lastQuery: QueryParamsModel;
    showInitWaitingMessage: boolean;
}

export const adapter: EntityAdapter<JobModel> = createEntityAdapter<JobModel>();

export const initialJobsState: JobsState = adapter.getInitialState({
    jobForEdit: null,
    listLoading: false,
    backProcessFailed:false,
    backProcessSuccess:false,
    actionsloading: false,
    totalCount: 0,
    errors:null,
    lastCreatedJobId: undefined,
    lastQuery: new QueryParamsModel({}),
    showInitWaitingMessage: true
});

export function jobsReducer(state = initialJobsState, action: JobActions): JobsState {
    switch  (action.type) {
        case JobActionTypes.JobsPageToggleLoading: {
            return {
                ...state, listLoading: action.payload.isLoading, lastCreatedJobId: undefined
            };
        }
        case JobActionTypes.JobActionToggleLoading: {
            return {
                ...state, actionsloading: action.payload.isLoading
            };
        }
        case JobActionTypes.JobOnServerCreated: return {
            ...state
        };
        case JobActionTypes.JobCreated: return adapter.addOne(action.payload.job, {
            ...state, lastCreatedJobId: action.payload.job.id
        });
        case JobActionTypes.JobUpdated: return adapter.updateOne(action.payload.partialJob, state);
        case JobActionTypes.OneJobDeleted: return adapter.removeOne(action.payload.id, state);
        case JobActionTypes.ManyJobsDeleted: return adapter.removeMany(action.payload.ids, state);
        case JobActionTypes.JobsPageCancelled: {
            return {
                ...state, listLoading: false, lastQuery: new QueryParamsModel({})
            };
        }
        case JobActionTypes.JobsPageLoaded: {
            return adapter.addMany(action.payload.jobs, {
                ...initialJobsState,
                totalCount: action.payload.totalCount,
                listLoading: false,
                lastQuery: action.payload.page,
                showInitWaitingMessage: false
            });
        }
        case JobActionTypes.JobBackProcessFailed:{
            return {
                ...state,backProcessFailed:action.payload.isFailed,errors:action.payload.errors
            }
        }
        case JobActionTypes.JobBackProcessSuccess:{
            return {
                ...state,backProcessSuccess:action.payload.isSuccess
            }
        }
        default: return state;
    }
}

export const getJobState = createFeatureSelector<JobModel>('jobs');

export const {
    selectAll,
    selectEntities,
    selectIds,
    selectTotal
} = adapter.getSelectors();
