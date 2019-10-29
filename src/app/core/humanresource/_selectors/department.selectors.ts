import { DepartmentModel } from './../_models/department.model';

// NGRX
import { createFeatureSelector, createSelector } from '@ngrx/store';
// CRUD
import { QueryResultsModel, HttpExtenstionsModel } from '../../_base/crud';
// State
import { DepartmentsState } from '../_reducers/department.reducers';
import * as fromDepartment from '../_reducers/department.reducers';
import { each } from 'lodash';

export const selectDepartmentsState = createFeatureSelector<DepartmentsState>('departments');

export const selectDepartmentById = (departmentId: number) => createSelector(
    selectDepartmentsState,
    departmentsState => departmentsState.entities[departmentId]
);

export const selectAllDepartments = createSelector(
    selectDepartmentsState,
    fromDepartment.selectAll
);

export const selectAllDepartmentsIds = createSelector(
    selectDepartmentsState,
    fromDepartment.selectIds
);

export const allDepartmentsLoaded = createSelector(
    selectDepartmentsState,
    departmentsState => departmentsState.isAllDepartmentsLoaded
);


export const selectDepartmentsPageLoading = createSelector(
    selectDepartmentsState,
    departmentsState => departmentsState.listLoading
);

export const selectDepartmentsActionLoading = createSelector(
    selectDepartmentsState,
    departmentsState => departmentsState.actionsloading
);

export const selectLastCreatedDepartmentId = createSelector(
    selectDepartmentsState,
    departmentsState => departmentsState.lastCreatedDepartmentId
);

export const selectDepartmentsShowInitWaitingMessage = createSelector(
    selectDepartmentsState,
    departmentsState => departmentsState.showInitWaitingMessage
);


export const selectQueryResult = createSelector(
    selectDepartmentsState,
    departmentsState => {
        const items: DepartmentModel[] = [];
        each(departmentsState.entities, element => {
            items.push(element);
        });
        return new QueryResultsModel(items);
    }
);
