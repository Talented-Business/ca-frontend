// NGRX
import { Action } from '@ngrx/store';
import { Update } from '@ngrx/entity';
// CRUD
import { QueryParamsModel } from '../../_base/crud';
// Models
import { EmployeeModel } from '../_models/employee.model';

export enum EmployeeActionTypes {
    EmployeeCreated = '[Edit Employee Dialog] Employee Created',
    EmployeeUpdated = '[Edit Employee Dialog] Employee Updated',
    OneEmployeeDeleted = '[Employees List Page] One Employee Deleted',
    ManyEmployeesDeleted = '[Employees List Page] Many Employee Deleted',
    EmployeesPageRequested = '[Employees List Page] Employees Page Requested',
    EmployeesPageLoaded = '[Employees API] Employees Page Loaded',
    EmployeesPageCancelled = '[Employees API] Employees Page Cancelled',
    EmployeesPageToggleLoading = '[Employees] Employees Page Toggle Loading',
    EmployeeActionToggleLoading = '[Employees] Employees Action Toggle Loading',
    EmployeeBackProcessFailed = '[Employees Back] Employees Back Process Failed',
    EmployeeBackProcessSuccess = '[Employees Back] Employees Back Process Success',
}


export class EmployeeCreated implements Action {
    readonly type = EmployeeActionTypes.EmployeeCreated;
    constructor(public payload: { employee: EmployeeModel }) { }
}

export class EmployeeUpdated implements Action {
    readonly type = EmployeeActionTypes.EmployeeUpdated;
    constructor(public payload: {
        partialEmployee: Update<EmployeeModel>, // For State update
        employee: EmployeeModel // For Server update (through service)
    }) { }
}

export class OneEmployeeDeleted implements Action {
    readonly type = EmployeeActionTypes.OneEmployeeDeleted;
    constructor(public payload: { id: number }) {}
}

export class ManyEmployeesDeleted implements Action {
    readonly type = EmployeeActionTypes.ManyEmployeesDeleted;
    constructor(public payload: { ids: number[] }) {}
}

export class EmployeesPageRequested implements Action {
    readonly type = EmployeeActionTypes.EmployeesPageRequested;
    constructor(public payload: { page: QueryParamsModel }) { }
}

export class EmployeesPageLoaded implements Action {
    readonly type = EmployeeActionTypes.EmployeesPageLoaded;
    constructor(public payload: { employees: EmployeeModel[], totalCount: number, page: QueryParamsModel }) { }
}

export class EmployeesPageCancelled implements Action {
    readonly type = EmployeeActionTypes.EmployeesPageCancelled;
}

export class EmployeesPageToggleLoading implements Action {
    readonly type = EmployeeActionTypes.EmployeesPageToggleLoading;
    constructor(public payload: { isLoading: boolean }) { }
}

export class EmployeeActionToggleLoading implements Action {
    readonly type = EmployeeActionTypes.EmployeeActionToggleLoading;
    constructor(public payload: { isLoading: boolean }) { }
}

export class EmployeeBackProcessFailed implements Action {
    readonly type = EmployeeActionTypes.EmployeeBackProcessFailed;
    constructor(public payload: { isFailed: boolean;errors:any }) { }
}
export class EmployeeBackProcessSuccess implements Action {
    readonly type = EmployeeActionTypes.EmployeeBackProcessSuccess;
    constructor(public payload: { isSuccess: boolean }) { }
}

export type EmployeeActions = EmployeeCreated
| EmployeeUpdated
| OneEmployeeDeleted
| ManyEmployeesDeleted
| EmployeesPageRequested
| EmployeesPageLoaded
| EmployeesPageCancelled
| EmployeesPageToggleLoading
| EmployeeActionToggleLoading
| EmployeeBackProcessSuccess
| EmployeeBackProcessFailed;

