// NGRX
import { Action } from '@ngrx/store';
import { Update } from '@ngrx/entity';
// CRUD
import { QueryParamsModel } from '../../_base/crud';
// Models
import { CommissionGroupModel } from '../_models/commission-group.model';

export enum CommissionGroupActionTypes {
    CommissionGroupOnServerCreated = '[Edit CommissionGroup Component] CommissionGroup On Server Created',    
    CommissionGroupCreated = '[Edit CommissionGroup Dialog] CommissionGroup Created',
    CommissionGroupOnServerUpdated = '[Edit CommissionGroup Component] CommissionGroup On Server Updated',    
    CommissionGroupUpdated = '[Edit CommissionGroup Dialog] CommissionGroup Updated',
    OneCommissionGroupDeleted = '[CommissionGroups List Page] One CommissionGroup Deleted',
    ManyCommissionGroupsDeleted = '[CommissionGroups List Page] Many CommissionGroup Deleted',
    CommissionGroupsPageRequested = '[CommissionGroups List Page] CommissionGroups Page Requested',
    CommissionGroupsPageLoaded = '[CommissionGroups API] CommissionGroups Page Loaded',
    CommissionGroupsPageCancelled = '[CommissionGroups API] CommissionGroups Page Cancelled',
    CommissionGroupsPageToggleLoading = '[CommissionGroups] CommissionGroups Page Toggle Loading',
    CommissionGroupActionToggleLoading = '[CommissionGroups] CommissionGroups Action Toggle Loading',
    CommissionGroupBackProcessFailed = '[CommissionGroups Back] CommissionGroups Back Process Failed',
    CommissionGroupBackProcessSuccess = '[CommissionGroups Back] CommissionGroups Back Process Success',
}

export class CommissionGroupOnServerCreated implements Action {
    readonly type = CommissionGroupActionTypes.CommissionGroupOnServerCreated;
    constructor(public payload: { commissionGroup: CommissionGroupModel }) { }
}

export class CommissionGroupCreated implements Action {
    readonly type = CommissionGroupActionTypes.CommissionGroupCreated;
    constructor(public payload: { commissionGroup: CommissionGroupModel }) { }
}

export class CommissionGroupOnServerUpdated implements Action {
    readonly type = CommissionGroupActionTypes.CommissionGroupOnServerUpdated;
    constructor(public payload: {
        partialCommissionGroup: Update<CommissionGroupModel>, // For State update
        commissionGroup: CommissionGroupModel // For Server update (through service)
    }) { }
}

export class CommissionGroupUpdated implements Action {
    readonly type = CommissionGroupActionTypes.CommissionGroupUpdated;
    constructor(public payload: {
        partialCommissionGroup: Update<CommissionGroupModel>, // For State update
        commissionGroup: CommissionGroupModel // For Server update (through service)
    }) { }
}

export class OneCommissionGroupDeleted implements Action {
    readonly type = CommissionGroupActionTypes.OneCommissionGroupDeleted;
    constructor(public payload: { id: number }) {}
}

export class ManyCommissionGroupsDeleted implements Action {
    readonly type = CommissionGroupActionTypes.ManyCommissionGroupsDeleted;
    constructor(public payload: { ids: number[] }) {}
}

export class CommissionGroupsPageRequested implements Action {
    readonly type = CommissionGroupActionTypes.CommissionGroupsPageRequested;
    constructor(public payload: { page: QueryParamsModel }) { }
}

export class CommissionGroupsPageLoaded implements Action {
    readonly type = CommissionGroupActionTypes.CommissionGroupsPageLoaded;
    constructor(public payload: { commissionGroups: CommissionGroupModel[], totalCount: number, page: QueryParamsModel }) { }
}

export class CommissionGroupsPageCancelled implements Action {
    readonly type = CommissionGroupActionTypes.CommissionGroupsPageCancelled;
}

export class CommissionGroupsPageToggleLoading implements Action {
    readonly type = CommissionGroupActionTypes.CommissionGroupsPageToggleLoading;
    constructor(public payload: { isLoading: boolean }) { }
}

export class CommissionGroupActionToggleLoading implements Action {
    readonly type = CommissionGroupActionTypes.CommissionGroupActionToggleLoading;
    constructor(public payload: { isLoading: boolean }) { }
}
export class CommissionGroupBackProcessFailed implements Action {
    readonly type = CommissionGroupActionTypes.CommissionGroupBackProcessFailed;
    constructor(public payload: { isFailed: boolean;errors:any }) { }
}
export class CommissionGroupBackProcessSuccess implements Action {
    readonly type = CommissionGroupActionTypes.CommissionGroupBackProcessSuccess;
    constructor(public payload: { isSuccess: boolean }) { }
}

export type CommissionGroupActions = CommissionGroupOnServerCreated
| CommissionGroupCreated
| CommissionGroupOnServerUpdated
| CommissionGroupUpdated
| OneCommissionGroupDeleted
| ManyCommissionGroupsDeleted
| CommissionGroupsPageRequested
| CommissionGroupsPageLoaded
| CommissionGroupsPageCancelled
| CommissionGroupsPageToggleLoading
| CommissionGroupActionToggleLoading
| CommissionGroupBackProcessSuccess
| CommissionGroupBackProcessFailed;
