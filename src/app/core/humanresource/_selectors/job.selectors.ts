// NGRX
import { createFeatureSelector, createSelector } from '@ngrx/store';
// Lodash
import { each } from 'lodash';
// CRUD
import { QueryResultsModel, HttpExtenstionsModel } from '../../_base/crud';
// State
import { JobsState } from '../_reducers/job.reducers';
import { JobModel } from '../_models/job.model';

export const selectJobsState = createFeatureSelector<JobsState>('jobs');

export const selectJobById = (jobId: number) => createSelector(
    selectJobsState,
    jobsState => jobsState.entities[jobId]
);

export const selectJobsPageLoading = createSelector(
    selectJobsState,
    jobsState => jobsState.listLoading
);

export const selectJobsActionLoading = createSelector(
    selectJobsState,
    jobsState => jobsState.actionsloading
);

export const selectJobsBackProcessingFailed = createSelector(
    selectJobsState,
    jobsState => jobsState.errors
);

export const selectJobsBackProcessingSuccess = createSelector(
    selectJobsState,
    jobsState => jobsState.backProcessSuccess
);

export const selectLastCreatedJobId = createSelector(
    selectJobsState,
    jobsState => jobsState.lastCreatedJobId
);

export const selectJobsShowInitWaitingMessage = createSelector(
    selectJobsState,
    jobsState => jobsState.showInitWaitingMessage
);

export const selectJobsInStore = createSelector(
    selectJobsState,
    jobsState => {
        const items: JobModel[] = [];
        each(jobsState.entities, element => {
            items.push(element);
        });
        const httpExtension = new HttpExtenstionsModel();
        const result: JobModel[] = httpExtension.sortArray(items, jobsState.lastQuery.sortField, jobsState.lastQuery.sortOrder);
        return new QueryResultsModel(result, jobsState.totalCount, '');
    }
);
