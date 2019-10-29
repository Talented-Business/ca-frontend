// NGRX
import { Action } from '@ngrx/store';
import { Update } from '@ngrx/entity';
// CRUD
import { QueryParamsModel } from '../../_base/crud';
// Models
import { TimeoffModel } from '../_models/timeoff.model';

export enum TimeoffActionTypes {
    TimeoffOnServerCreated = '[Edit Timeoff Component] Timeoff On Server Created',    
    TimeoffCreated = '[Edit Timeoff Dialog] Timeoff Created',
    TimeoffOnServerUpdated = '[Edit Timeoff Component] Timeoff On Server Updated',    
    TimeoffUpdated = '[Edit Timeoff Dialog] Timeoff Updated',
    OneTimeoffDeleted = '[Timeoffs List Page] One Timeoff Deleted',
    ManyTimeoffsDeleted = '[Timeoffs List Page] Many Timeoff Deleted',
    TimeoffsPageRequested = '[Timeoffs List Page] Timeoffs Page Requested',
    TimeoffsPageLoaded = '[Timeoffs API] Timeoffs Page Loaded',
    TimeoffsPageCancelled = '[Timeoffs API] Timeoffs Page Cancelled',
    TimeoffsPageToggleLoading = '[Timeoffs] Timeoffs Page Toggle Loading',
    TimeoffActionToggleLoading = '[Timeoffs] Timeoffs Action Toggle Loading',
    TimeoffBackProcessFailed = '[Timeoffs Back] Timeoffs Back Process Failed',
    TimeoffBackProcessSuccess = '[Timeoffs Back] Timeoffs Back Process Success',
}

export class TimeoffOnServerCreated implements Action {
    readonly type = TimeoffActionTypes.TimeoffOnServerCreated;
    constructor(public payload: { timeoff: TimeoffModel }) { }
}

export class TimeoffCreated implements Action {
    readonly type = TimeoffActionTypes.TimeoffCreated;
    constructor(public payload: { timeoff: TimeoffModel }) { }
}

export class TimeoffOnServerUpdated implements Action {
    readonly type = TimeoffActionTypes.TimeoffOnServerUpdated;
    constructor(public payload: {
        partialTimeoff: Update<TimeoffModel>, // For State update
        timeoff: TimeoffModel // For Server update (through service)
    }) { }
}

export class TimeoffUpdated implements Action {
    readonly type = TimeoffActionTypes.TimeoffUpdated;
    constructor(public payload: {
        partialTimeoff: Update<TimeoffModel>, // For State update
        timeoff: TimeoffModel // For Server update (through service)
    }) { }
}

export class OneTimeoffDeleted implements Action {
    readonly type = TimeoffActionTypes.OneTimeoffDeleted;
    constructor(public payload: { id: number }) {}
}

export class ManyTimeoffsDeleted implements Action {
    readonly type = TimeoffActionTypes.ManyTimeoffsDeleted;
    constructor(public payload: { ids: number[] }) {}
}

export class TimeoffsPageRequested implements Action {
    readonly type = TimeoffActionTypes.TimeoffsPageRequested;
    constructor(public payload: { page: QueryParamsModel }) { }
}

export class TimeoffsPageLoaded implements Action {
    readonly type = TimeoffActionTypes.TimeoffsPageLoaded;
    constructor(public payload: { timeoffs: TimeoffModel[], totalCount: number, page: QueryParamsModel }) { }
}

export class TimeoffsPageCancelled implements Action {
    readonly type = TimeoffActionTypes.TimeoffsPageCancelled;
}

export class TimeoffsPageToggleLoading implements Action {
    readonly type = TimeoffActionTypes.TimeoffsPageToggleLoading;
    constructor(public payload: { isLoading: boolean }) { }
}

export class TimeoffActionToggleLoading implements Action {
    readonly type = TimeoffActionTypes.TimeoffActionToggleLoading;
    constructor(public payload: { isLoading: boolean }) { }
}
export class TimeoffBackProcessFailed implements Action {
    readonly type = TimeoffActionTypes.TimeoffBackProcessFailed;
    constructor(public payload: { isFailed: boolean;errors:any }) { }
}
export class TimeoffBackProcessSuccess implements Action {
    readonly type = TimeoffActionTypes.TimeoffBackProcessSuccess;
    constructor(public payload: { isSuccess: boolean }) { }
}

export type TimeoffActions = TimeoffOnServerCreated
| TimeoffCreated
| TimeoffOnServerUpdated
| TimeoffUpdated
| OneTimeoffDeleted
| ManyTimeoffsDeleted
| TimeoffsPageRequested
| TimeoffsPageLoaded
| TimeoffsPageCancelled
| TimeoffsPageToggleLoading
| TimeoffActionToggleLoading
| TimeoffBackProcessSuccess
| TimeoffBackProcessFailed;
