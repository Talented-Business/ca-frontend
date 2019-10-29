// NGRX
import { Action } from '@ngrx/store';
import { Update } from '@ngrx/entity';
// CRUD
import { QueryParamsModel } from '../../_base/crud';
// Models
import { EmployeeModel } from '../_models/employee.model';

export enum RecruitActionTypes {
    RecruitUpdated = '[Edit Recruit Dialog] Recruit Updated',//convert Employee
    RecruitsStatusUpdated = '[Recruit List Page] Recruits Status Updated',// rejected
    RecruitsPageRequested = '[Recruits List Page] Recruits Page Requested',
    RecruitsPageLoaded = '[Recruits API] Recruits Page Loaded',
    RecruitsPageCancelled = '[Recruits API] Recruits Page Cancelled',
    RecruitsPageToggleLoading = '[Recruits] Recruits Page Toggle Loading',
    RecruitActionToggleLoading = '[Recruits] Recruits Action Toggle Loading'
}

export class RecruitUpdated implements Action {
    readonly type = RecruitActionTypes.RecruitUpdated;
    constructor(public payload: {
        partialRecruit: Update<EmployeeModel>, // For State update
        recruit: EmployeeModel // For Server update (through service)
    }) { }
}

export class RecruitsStatusUpdated implements Action {
    readonly type = RecruitActionTypes.RecruitsStatusUpdated;
    constructor(public payload: {
        recruits: EmployeeModel[],
        status: string
    }) { }
}

export class RecruitsPageRequested implements Action {
    readonly type = RecruitActionTypes.RecruitsPageRequested;
    constructor(public payload: { page: QueryParamsModel }) { }
}

export class RecruitsPageLoaded implements Action {
    readonly type = RecruitActionTypes.RecruitsPageLoaded;
    constructor(public payload: { recruits: EmployeeModel[], totalCount: number, page: QueryParamsModel }) { }
}

export class RecruitsPageCancelled implements Action {
    readonly type = RecruitActionTypes.RecruitsPageCancelled;
}

export class RecruitsPageToggleLoading implements Action {
    readonly type = RecruitActionTypes.RecruitsPageToggleLoading;
    constructor(public payload: { isLoading: boolean }) { }
}

export class RecruitActionToggleLoading implements Action {
    readonly type = RecruitActionTypes.RecruitActionToggleLoading;
    constructor(public payload: { isLoading: boolean }) { }
}

export type RecruitActions = RecruitUpdated
| RecruitsStatusUpdated
| RecruitsPageRequested
| RecruitsPageLoaded
| RecruitsPageCancelled
| RecruitsPageToggleLoading
| RecruitActionToggleLoading;
