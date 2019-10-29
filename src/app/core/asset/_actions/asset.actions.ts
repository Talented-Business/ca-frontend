// NGRX
import { Action } from '@ngrx/store';
import { Update } from '@ngrx/entity';
// CRUD
import { QueryParamsModel } from '../../_base/crud';
// Models
import { AssetModel } from '../_models/asset.model';

export enum AssetActionTypes {
    AssetOnServerCreated = '[Edit Asset Component] Asset On Server Created',    
    AssetCreated = '[Edit Asset Dialog] Asset Created',
    AssetOnServerUpdated = '[Edit Asset Component] Asset On Server Updated',    
    AssetOnServerDeleted = '[Assets List Page] One Asset On Server Deleted',
    AssetUpdated = '[Edit Asset Dialog] Asset Updated',
    OneAssetDeleted = '[Assets List Page] One Asset Deleted',
    ManyAssetsDeleted = '[Assets List Page] Many Asset Deleted',
    AssetsPageRequested = '[Assets List Page] Assets Page Requested',
    AssetsPageLoaded = '[Assets API] Assets Page Loaded',
    AssetsPageCancelled = '[Assets API] Assets Page Cancelled',
    AssetsPageToggleLoading = '[Assets] Assets Page Toggle Loading',
    AssetActionToggleLoading = '[Assets] Assets Action Toggle Loading',
    AssetBackProcessFailed = '[Assets Back] Assets Back Process Failed',
    AssetBackProcessSuccess = '[Assets Back] Assets Back Process Success',
}

export class AssetOnServerCreated implements Action {
    readonly type = AssetActionTypes.AssetOnServerCreated;
    constructor(public payload: { asset: AssetModel }) { }
}

export class AssetCreated implements Action {
    readonly type = AssetActionTypes.AssetCreated;
    constructor(public payload: { asset: AssetModel }) { }
}

export class AssetOnServerUpdated implements Action {
    readonly type = AssetActionTypes.AssetOnServerUpdated;
    constructor(public payload: {
        partialAsset: Update<AssetModel>, // For State update
        asset: AssetModel // For Server update (through service)
    }) { }
}

export class AssetUpdated implements Action {
    readonly type = AssetActionTypes.AssetUpdated;
    constructor(public payload: {
        partialAsset: Update<AssetModel>, // For State update
        asset: AssetModel // For Server update (through service)
    }) { }
}

export class AssetOnServerDeleted implements Action {
    readonly type = AssetActionTypes.AssetOnServerDeleted;
    constructor(public payload: { id: number }) {}
}
export class OneAssetDeleted implements Action {
    readonly type = AssetActionTypes.OneAssetDeleted;
    constructor(public payload: { id: number }) {}
}

export class ManyAssetsDeleted implements Action {
    readonly type = AssetActionTypes.ManyAssetsDeleted;
    constructor(public payload: { ids: number[] }) {}
}

export class AssetsPageRequested implements Action {
    readonly type = AssetActionTypes.AssetsPageRequested;
    constructor(public payload: { page: QueryParamsModel }) { }
}

export class AssetsPageLoaded implements Action {
    readonly type = AssetActionTypes.AssetsPageLoaded;
    constructor(public payload: { assets: AssetModel[], totalCount: number, page: QueryParamsModel }) { }
}

export class AssetsPageCancelled implements Action {
    readonly type = AssetActionTypes.AssetsPageCancelled;
}

export class AssetsPageToggleLoading implements Action {
    readonly type = AssetActionTypes.AssetsPageToggleLoading;
    constructor(public payload: { isLoading: boolean }) { }
}

export class AssetActionToggleLoading implements Action {
    readonly type = AssetActionTypes.AssetActionToggleLoading;
    constructor(public payload: { isLoading: boolean }) { }
}
export class AssetBackProcessFailed implements Action {
    readonly type = AssetActionTypes.AssetBackProcessFailed;
    constructor(public payload: { isFailed: boolean;errors:any }) { }
}
export class AssetBackProcessSuccess implements Action {
    readonly type = AssetActionTypes.AssetBackProcessSuccess;
    constructor(public payload: { isSuccess: boolean }) { }
}

export type AssetActions = AssetOnServerCreated
| AssetCreated
| AssetOnServerUpdated
| AssetUpdated
| OneAssetDeleted
| ManyAssetsDeleted
| AssetsPageRequested
| AssetsPageLoaded
| AssetsPageCancelled
| AssetsPageToggleLoading
| AssetActionToggleLoading
| AssetBackProcessSuccess
| AssetBackProcessFailed;
