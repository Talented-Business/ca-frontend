// NGRX
import { createFeatureSelector, createSelector } from '@ngrx/store';
// Lodash
import { each } from 'lodash';
// CRUD
import { QueryResultsModel, HttpExtenstionsModel } from '../../_base/crud';
// State
import { TimeoffsState } from '../_reducers/timeoff.reducers';
import { TimeoffModel } from '../_models/timeoff.model';

export const selectTimeoffsState = createFeatureSelector<TimeoffsState>('timeoffs');

export const selectTimeoffById = (timeoffId: number) => createSelector(
    selectTimeoffsState,
    timeoffsState => timeoffsState.entities[timeoffId]
);

export const selectTimeoffsPageLoading = createSelector(
    selectTimeoffsState,
    timeoffsState => timeoffsState.listLoading
);

export const selectTimeoffsActionLoading = createSelector(
    selectTimeoffsState,
    timeoffsState => timeoffsState.actionsloading
);

export const selectTimeoffsBackProcessingFailed = createSelector(
    selectTimeoffsState,
    timeoffsState => timeoffsState.errors
);

export const selectTimeoffsBackProcessingSuccess = createSelector(
    selectTimeoffsState,
    timeoffsState => timeoffsState.backProcessSuccess
);

export const selectLastCreatedTimeoffId = createSelector(
    selectTimeoffsState,
    timeoffsState => timeoffsState.lastCreatedTimeoffId
);

export const selectTimeoffsShowInitWaitingMessage = createSelector(
    selectTimeoffsState,
    timeoffsState => timeoffsState.showInitWaitingMessage
);

export const selectTimeoffsInStore = createSelector(
    selectTimeoffsState,
    timeoffsState => {
        const items: TimeoffModel[] = [];
        each(timeoffsState.entities, element => {
            items.push(element);
        });
        const httpExtension = new HttpExtenstionsModel();
        const result: TimeoffModel[] = httpExtension.sortArray(items, timeoffsState.lastQuery.sortField, timeoffsState.lastQuery.sortOrder);
        return new QueryResultsModel(result, timeoffsState.totalCount, '');
    }
);
