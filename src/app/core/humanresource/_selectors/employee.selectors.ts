// NGRX
import { createFeatureSelector, createSelector } from '@ngrx/store';
// Lodash
import { each } from 'lodash';
// CRUD
import { QueryResultsModel, HttpExtenstionsModel } from '../../_base/crud';
// State
import { EmployeesState } from '../_reducers/employee.reducers';
import { EmployeeModel } from '../_models/employee.model';

export const selectEmployeesState = createFeatureSelector<EmployeesState>('employees');

export const selectEmployeeById = (employeeId: number) => createSelector(
    selectEmployeesState,
    employeesState => employeesState.entities[employeeId]
);

export const selectEmployeesPageLoading = createSelector(
    selectEmployeesState,
    employeesState => employeesState.listLoading
);

export const selectEmployeesActionLoading = createSelector(
    selectEmployeesState,
    employeesState => employeesState.actionsloading
);

export const selectLastCreatedEmployeeId = createSelector(
    selectEmployeesState,
    employeesState => employeesState.lastCreatedEmployeeId
);

export const selectEmployeesShowInitWaitingMessage = createSelector(
    selectEmployeesState,
    employeesState => employeesState.showInitWaitingMessage
);

export const selectEmployeesBackProcessingFailed = createSelector(
    selectEmployeesState,
    employeesState => employeesState.errors
);

export const selectEmployeesBackProcessingSuccess = createSelector(
    selectEmployeesState,
    employeesState => employeesState.backProcessSuccess
);

export const selectEmployeesInStore = createSelector(
    selectEmployeesState,
    employeesState => {
        const items: EmployeeModel[] = [];
        each(employeesState.entities, element => {
            items.push(element);
        });
        const httpExtension = new HttpExtenstionsModel();
        const result: EmployeeModel[] = httpExtension.sortArray(items, employeesState.lastQuery.sortField, employeesState.lastQuery.sortOrder);
        return new QueryResultsModel(result, employeesState.totalCount, '');
    }
);
