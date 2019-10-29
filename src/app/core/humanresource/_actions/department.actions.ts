// NGRX
import { Action } from '@ngrx/store';
import { Update } from '@ngrx/entity';
// CRUD
import { QueryParamsModel } from '../../_base/crud';
// Models
import { DepartmentModel } from '../_models/department.model';

export enum DepartmentActionTypes {
    AllDepartmentsRequested = '[Departments Home Page] All Departments Requested',
    AllDepartmentsLoaded = '[Departments API] All Departments Loaded',
    DepartmentOnServerCreated = '[Edit Department Dialog] Department On Server Created',
    DepartmentOnServerUpdated = '[Edit Department Dialog] Department On Server Updated',
    DepartmentCreated = '[Edit Departments Dialog] Departments Created',
    DepartmentUpdated = '[Edit Department Dialog] Department Updated',
    DepartmentDeleted = '[Departments List Page] Department Deleted',
    DepartmentActionToggleLoading = '[Departments] Departments Action Toggle Loading',
    DepartmentListingChanged = '[Departments Changed] Departments Changed',
}

export class DepartmentOnServerCreated implements Action {
    readonly type = DepartmentActionTypes.DepartmentOnServerCreated;
    constructor(public payload: { department: DepartmentModel }) { }
}

export class DepartmentCreated implements Action {
    readonly type = DepartmentActionTypes.DepartmentCreated;
    constructor(public payload: { department: DepartmentModel }) { }
}

export class DepartmentOnServerUpdated implements Action {
    readonly type = DepartmentActionTypes.DepartmentOnServerUpdated;
    constructor(public payload: {
        partialDepartment: Update<DepartmentModel>, // For State update
        department: DepartmentModel // For Server update (through service)
    }) { }
}

export class DepartmentUpdated implements Action {
    readonly type = DepartmentActionTypes.DepartmentUpdated;
    constructor(public payload: {
        partialdepartment: Update<DepartmentModel>,
        department: DepartmentModel
    }) { }
}

export class DepartmentDeleted implements Action {
    readonly type = DepartmentActionTypes.DepartmentDeleted;
    constructor(public payload: { id: number }) {}
}

export class AllDepartmentsRequested implements Action {
    readonly type = DepartmentActionTypes.AllDepartmentsRequested;
}

export class AllDepartmentsLoaded implements Action {
    readonly type = DepartmentActionTypes.AllDepartmentsLoaded;
    constructor(public payload: { departments: DepartmentModel[] }) { }
}

export class DepartmentActionToggleLoading implements Action {
    readonly type = DepartmentActionTypes.DepartmentActionToggleLoading;
    constructor(public payload: { isLoading: boolean }) { }
}

export class DepartmentListingChanged implements Action {
    readonly type = DepartmentActionTypes.DepartmentListingChanged;
}


export type DepartmentActions = DepartmentCreated
| DepartmentOnServerUpdated
| DepartmentUpdated
| DepartmentDeleted
| AllDepartmentsLoaded
| AllDepartmentsRequested
| DepartmentActionToggleLoading
| DepartmentListingChanged
| DepartmentOnServerCreated;
