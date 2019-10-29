// NGRX
import { Action } from '@ngrx/store';
import { Update } from '@ngrx/entity';
// CRUD
import { QueryParamsModel } from '../../_base/crud';
// Models
import { CompanyModel } from '../_models/company.model';

export enum CompanyActionTypes {
    CompanyCreated = '[Edit Company Dialog] Company Created',
    CompanyUpdated = '[Edit Company Dialog] Company Updated',
    OneCompanyDeleted = '[Companies List Page] One Company Deleted',
    ManyCompaniesDeleted = '[Companies List Page] Many Company Deleted',
    CompaniesPageRequested = '[Companies List Page] Companies Page Requested',
    CompaniesPageLoaded = '[Companies API] Companies Page Loaded',
    CompaniesPageCancelled = '[Companies API] Companies Page Cancelled',
    CompaniesPageToggleLoading = '[Companies] Companies Page Toggle Loading',
    CompanyActionToggleLoading = '[Companies] Companies Action Toggle Loading',
    CompanyBackProcessFailed = '[Companies Back] Companies Back Process Failed',
    CompanyBackProcessSuccess = '[Companies Back] Companies Back Process Success',
}


export class CompanyCreated implements Action {
    readonly type = CompanyActionTypes.CompanyCreated;
    constructor(public payload: { company: CompanyModel }) { }
}

export class CompanyUpdated implements Action {
    readonly type = CompanyActionTypes.CompanyUpdated;
    constructor(public payload: {
        partialCompany: Update<CompanyModel>, // For State update
        company: CompanyModel // For Server update (through service)
    }) { }
}

export class OneCompanyDeleted implements Action {
    readonly type = CompanyActionTypes.OneCompanyDeleted;
    constructor(public payload: { id: number }) {}
}

export class ManyCompaniesDeleted implements Action {
    readonly type = CompanyActionTypes.ManyCompaniesDeleted;
    constructor(public payload: { ids: number[] }) {}
}

export class CompaniesPageRequested implements Action {
    readonly type = CompanyActionTypes.CompaniesPageRequested;
    constructor(public payload: { page: QueryParamsModel }) { }
}

export class CompaniesPageLoaded implements Action {
    readonly type = CompanyActionTypes.CompaniesPageLoaded;
    constructor(public payload: { companies: CompanyModel[], totalCount: number, page: QueryParamsModel }) { }
}

export class CompaniesPageCancelled implements Action {
    readonly type = CompanyActionTypes.CompaniesPageCancelled;
}

export class CompaniesPageToggleLoading implements Action {
    readonly type = CompanyActionTypes.CompaniesPageToggleLoading;
    constructor(public payload: { isLoading: boolean }) { }
}

export class CompanyActionToggleLoading implements Action {
    readonly type = CompanyActionTypes.CompanyActionToggleLoading;
    constructor(public payload: { isLoading: boolean }) { }
}
export class CompanyBackProcessFailed implements Action {
    readonly type = CompanyActionTypes.CompanyBackProcessFailed;
    constructor(public payload: { isFailed: boolean }) { }
}
export class CompanyBackProcessSuccess implements Action {
    readonly type = CompanyActionTypes.CompanyBackProcessSuccess;
    constructor(public payload: { isSuccess: boolean }) { }
}

export type CompanyActions = CompanyCreated
| CompanyUpdated
| OneCompanyDeleted
| ManyCompaniesDeleted
| CompaniesPageRequested
| CompaniesPageLoaded
| CompaniesPageCancelled
| CompaniesPageToggleLoading
| CompanyActionToggleLoading
| CompanyBackProcessSuccess
| CompanyBackProcessFailed;
