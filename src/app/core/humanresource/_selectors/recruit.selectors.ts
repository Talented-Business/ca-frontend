// NGRX
import { createFeatureSelector, createSelector } from '@ngrx/store';
// Lodash
import { each } from 'lodash';
// CRUD
import { QueryResultsModel, HttpExtenstionsModel } from '../../_base/crud';
// State
import { RecruitsState } from '../_reducers/recruit.reducers';
import { EmployeeModel } from '../_models/employee.model';

export const selectRecruitsState = createFeatureSelector<RecruitsState>('recruits');

export const selectRecruitById = (recruitId: number) => createSelector(
    selectRecruitsState,
    recruitsState => recruitsState.entities[recruitId]
);

export const selectRecruitsPageLoading = createSelector(
    selectRecruitsState,
    recruitsState => recruitsState.listLoading
);

export const selectRecruitsActionLoading = createSelector(
    selectRecruitsState,
    recruitsState => recruitsState.actionsloading
);

export const selectLastCreatedRecruitId = createSelector(
    selectRecruitsState,
    recruitsState => recruitsState.lastCreatedRecruitId
);

export const selectRecruitsShowInitWaitingMessage = createSelector(
    selectRecruitsState,
    recruitsState => recruitsState.showInitWaitingMessage
);

export const selectRecruitsInStore = createSelector(
    selectRecruitsState,
    recruitsState => {
        const items: EmployeeModel[] = [];
        each(recruitsState.entities, element => {
            items.push(element);
        });
        const httpExtension = new HttpExtenstionsModel();
        const result: EmployeeModel[] = httpExtension.sortArray(items, recruitsState.lastQuery.sortField, recruitsState.lastQuery.sortOrder);
        return new QueryResultsModel(result, recruitsState.totalCount, '');
    }
);
