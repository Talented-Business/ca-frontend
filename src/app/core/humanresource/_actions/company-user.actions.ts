// NGRX
import { Action } from '@ngrx/store';
import { Update } from '@ngrx/entity';
// CRUD
import { QueryParamsModel } from '../../_base/crud';
// Models
import { CompanyUserModel } from '../_models/company-user.model';

export enum CompanyUserActionTypes {
    CompanyUserOnServerCreated = '[Edit CompanyUser Component] CompanyUser On Server Created',    
    CompanyUserCreated = '[Edit CompanyUser Dialog] CompanyUser Created',
    CompanyUserOnServerUpdated = '[Edit CompanyUser Component] CompanyUser On Server Updated',    
    CompanyUserUpdated = '[Edit CompanyUser Dialog] CompanyUser Updated',
    OneCompanyUserDeleted = '[CompanyUsers List Page] One CompanyUser Deleted',
    ManyCompanyUsersDeleted = '[CompanyUsers List Page] Many CompanyUser Deleted',
    CompanyUsersPageRequested = '[CompanyUsers List Page] CompanyUsers Page Requested',
    CompanyUsersPageLoaded = '[CompanyUsers API] CompanyUsers Page Loaded',
    CompanyUsersPageCancelled = '[CompanyUsers API] CompanyUsers Page Cancelled',
    CompanyUsersPageToggleLoading = '[CompanyUsers] CompanyUsers Page Toggle Loading',
    CompanyUserActionToggleLoading = '[CompanyUsers] CompanyUsers Action Toggle Loading',
    CompanyUserBackProcessFailed = '[CompanyUsers Back] CompanyUsers Back Process Failed',
    CompanyUserBackProcessSuccess = '[CompanyUsers Back] CompanyUsers Back Process Success',
}

export class CompanyUserOnServerCreated implements Action {
    readonly type = CompanyUserActionTypes.CompanyUserOnServerCreated;
    constructor(public payload: { companyUser: CompanyUserModel }) { }
}

export class CompanyUserCreated implements Action {
    readonly type = CompanyUserActionTypes.CompanyUserCreated;
    constructor(public payload: { companyUser: CompanyUserModel }) { }
}

export class CompanyUserOnServerUpdated implements Action {
    readonly type = CompanyUserActionTypes.CompanyUserOnServerUpdated;
    constructor(public payload: {
        partialCompanyUser: Update<CompanyUserModel>, // For State update
        companyUser: CompanyUserModel // For Server update (through service)
    }) { }
}

export class CompanyUserUpdated implements Action {
    readonly type = CompanyUserActionTypes.CompanyUserUpdated;
    constructor(public payload: {
        partialCompanyUser: Update<CompanyUserModel>, // For State update
        companyUser: CompanyUserModel // For Server update (through service)
    }) { }
}

export class OneCompanyUserDeleted implements Action {
    readonly type = CompanyUserActionTypes.OneCompanyUserDeleted;
    constructor(public payload: { id: number }) {}
}

export class ManyCompanyUsersDeleted implements Action {
    readonly type = CompanyUserActionTypes.ManyCompanyUsersDeleted;
    constructor(public payload: { ids: number[] }) {}
}

export class CompanyUsersPageRequested implements Action {
    readonly type = CompanyUserActionTypes.CompanyUsersPageRequested;
    constructor(public payload: { page: QueryParamsModel }) { }
}

export class CompanyUsersPageLoaded implements Action {
    readonly type = CompanyUserActionTypes.CompanyUsersPageLoaded;
    constructor(public payload: { companyUsers: CompanyUserModel[], totalCount: number, page: QueryParamsModel }) { }
}

export class CompanyUsersPageCancelled implements Action {
    readonly type = CompanyUserActionTypes.CompanyUsersPageCancelled;
}

export class CompanyUsersPageToggleLoading implements Action {
    readonly type = CompanyUserActionTypes.CompanyUsersPageToggleLoading;
    constructor(public payload: { isLoading: boolean }) { }
}

export class CompanyUserActionToggleLoading implements Action {
    readonly type = CompanyUserActionTypes.CompanyUserActionToggleLoading;
    constructor(public payload: { isLoading: boolean }) { }
}
export class CompanyUserBackProcessFailed implements Action {
    readonly type = CompanyUserActionTypes.CompanyUserBackProcessFailed;
    constructor(public payload: { isFailed: boolean;errors:any }) { }
}
export class CompanyUserBackProcessSuccess implements Action {
    readonly type = CompanyUserActionTypes.CompanyUserBackProcessSuccess;
    constructor(public payload: { isSuccess: boolean }) { }
}

export type CompanyUserActions = CompanyUserOnServerCreated
| CompanyUserCreated
| CompanyUserOnServerUpdated
| CompanyUserUpdated
| OneCompanyUserDeleted
| ManyCompanyUsersDeleted
| CompanyUsersPageRequested
| CompanyUsersPageLoaded
| CompanyUsersPageCancelled
| CompanyUsersPageToggleLoading
| CompanyUserActionToggleLoading
| CompanyUserBackProcessSuccess
| CompanyUserBackProcessFailed;
