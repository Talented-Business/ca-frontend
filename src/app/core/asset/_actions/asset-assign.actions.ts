// NGRX
import { Action } from '@ngrx/store';
import { Update } from '@ngrx/entity';
// CRUD
import { QueryParamsModel } from '../../_base/crud';
// Models
import { AssetAssignModel } from '../_models/asset-assign.model';

export enum AssetAssignActionTypes {
    AssetAssignOnServerCreated = '[Edit AssetAssign Component] AssetAssign On Server Created',    
    AssetAssignCreated = '[Edit AssetAssign Dialog] AssetAssign Created',
    AssetAssignOnServerUpdated = '[Edit AssetAssign Component] AssetAssign On Server Updated',    
    AssetAssignOnServerDeleted = '[AssetAssigns List Page] One AssetAssign On Server Deleted',
    AssetAssignUpdated = '[Edit AssetAssign Dialog] AssetAssign Updated',
    OneAssetAssignDeleted = '[AssetAssigns List Page] One AssetAssign Deleted',
    ManyAssetAssignsDeleted = '[AssetAssigns List Page] Many AssetAssign Deleted',
    AssetAssignsPageRequested = '[AssetAssigns List Page] AssetAssigns Page Requested',
    AssetAssignsPageLoaded = '[AssetAssigns API] AssetAssigns Page Loaded',
    AssetAssignsPageCancelled = '[AssetAssigns API] AssetAssigns Page Cancelled',
    AssetAssignsPageToggleLoading = '[AssetAssigns] AssetAssigns Page Toggle Loading',
    AssetAssignActionToggleLoading = '[AssetAssigns] AssetAssigns Action Toggle Loading',
    AssetAssignBackProcessFailed = '[AssetAssigns Back] AssetAssigns Back Process Failed',
    AssetAssignBackProcessSuccess = '[AssetAssigns Back] AssetAssigns Back Process Success',
}

export class AssetAssignOnServerCreated implements Action {
    readonly type = AssetAssignActionTypes.AssetAssignOnServerCreated;
    constructor(public payload: { assetAssign: AssetAssignModel }) { }
}

export class AssetAssignCreated implements Action {
    readonly type = AssetAssignActionTypes.AssetAssignCreated;
    constructor(public payload: { assetAssign: AssetAssignModel }) { }
}

export class AssetAssignOnServerUpdated implements Action {
    readonly type = AssetAssignActionTypes.AssetAssignOnServerUpdated;
    constructor(public payload: {
        partialAssetAssign: Update<AssetAssignModel>, // For State update
        assetAssign: AssetAssignModel // For Server update (through service)
    }) { }
}

export class AssetAssignUpdated implements Action {
    readonly type = AssetAssignActionTypes.AssetAssignUpdated;
    constructor(public payload: {
        partialAssetAssign: Update<AssetAssignModel>, // For State update
        assetAssign: AssetAssignModel // For Server update (through service)
    }) { }
}

export class AssetAssignOnServerDeleted implements Action {
    readonly type = AssetAssignActionTypes.AssetAssignOnServerDeleted;
    constructor(public payload: { id: number }) {}
}
export class OneAssetAssignDeleted implements Action {
    readonly type = AssetAssignActionTypes.OneAssetAssignDeleted;
    constructor(public payload: { id: number }) {}
}

export class ManyAssetAssignsDeleted implements Action {
    readonly type = AssetAssignActionTypes.ManyAssetAssignsDeleted;
    constructor(public payload: { ids: number[] }) {}
}

export class AssetAssignsPageRequested implements Action {
    readonly type = AssetAssignActionTypes.AssetAssignsPageRequested;
    constructor(public payload: { page: QueryParamsModel }) { }
}

export class AssetAssignsPageLoaded implements Action {
    readonly type = AssetAssignActionTypes.AssetAssignsPageLoaded;
    constructor(public payload: { assetAssigns: AssetAssignModel[], totalCount: number, page: QueryParamsModel }) { }
}

export class AssetAssignsPageCancelled implements Action {
    readonly type = AssetAssignActionTypes.AssetAssignsPageCancelled;
}

export class AssetAssignsPageToggleLoading implements Action {
    readonly type = AssetAssignActionTypes.AssetAssignsPageToggleLoading;
    constructor(public payload: { isLoading: boolean }) { }
}

export class AssetAssignActionToggleLoading implements Action {
    readonly type = AssetAssignActionTypes.AssetAssignActionToggleLoading;
    constructor(public payload: { isLoading: boolean }) { }
}
export class AssetAssignBackProcessFailed implements Action {
    readonly type = AssetAssignActionTypes.AssetAssignBackProcessFailed;
    constructor(public payload: { isFailed: boolean;errors:any }) { }
}
export class AssetAssignBackProcessSuccess implements Action {
    readonly type = AssetAssignActionTypes.AssetAssignBackProcessSuccess;
    constructor(public payload: { isSuccess: boolean }) { }
}

export type AssetAssignActions = AssetAssignOnServerCreated
| AssetAssignCreated
| AssetAssignOnServerUpdated
| AssetAssignUpdated
| OneAssetAssignDeleted
| ManyAssetAssignsDeleted
| AssetAssignsPageRequested
| AssetAssignsPageLoaded
| AssetAssignsPageCancelled
| AssetAssignsPageToggleLoading
| AssetAssignActionToggleLoading
| AssetAssignBackProcessSuccess
| AssetAssignBackProcessFailed;
