// NGRX
import { Action } from '@ngrx/store';
import { Update } from '@ngrx/entity';
// CRUD
import { QueryParamsModel } from '../../_base/crud';
// Models
import { ContractModel } from '../_models/contract.model';

export enum ContractActionTypes {
    ContractOnServerCreated = '[Edit Contract Component] Contract On Server Created',    
    ContractCreated = '[Edit Contract Dialog] Contract Created',
    ContractUpdated = '[Edit Contract Dialog] Contract Updated',
    OneContractDeleted = '[Contracts List Page] One Contract Deleted',
    ManyContractsDeleted = '[Contracts List Page] Many Contract Deleted',
    ContractsPageRequested = '[Contracts List Page] Contracts Page Requested',
    ContractsPageLoaded = '[Contracts API] Contracts Page Loaded',
    ContractsPageCancelled = '[Contracts API] Contracts Page Cancelled',
    ContractsPageToggleLoading = '[Contracts] Contracts Page Toggle Loading',
    ContractActionToggleLoading = '[Contracts] Contracts Action Toggle Loading',
    ContractBackProcessFailed = '[Contracts Back] Contracts Back Process Failed',
    ContractBackProcessSuccess = '[Contracts Back] Contracts Back Process Success',
}

export class ContractOnServerCreated implements Action {
    readonly type = ContractActionTypes.ContractOnServerCreated;
    constructor(public payload: { contract: ContractModel }) { }
}

export class ContractCreated implements Action {
    readonly type = ContractActionTypes.ContractCreated;
    constructor(public payload: { contract: ContractModel }) { }
}

export class ContractUpdated implements Action {
    readonly type = ContractActionTypes.ContractUpdated;
    constructor(public payload: {
        partialContract: Update<ContractModel>, // For State update
        contract: ContractModel // For Server update (through service)
    }) { }
}

export class OneContractDeleted implements Action {
    readonly type = ContractActionTypes.OneContractDeleted;
    constructor(public payload: { id: number }) {}
}

export class ManyContractsDeleted implements Action {
    readonly type = ContractActionTypes.ManyContractsDeleted;
    constructor(public payload: { ids: number[] }) {}
}

export class ContractsPageRequested implements Action {
    readonly type = ContractActionTypes.ContractsPageRequested;
    constructor(public payload: { page: QueryParamsModel }) { }
}

export class ContractsPageLoaded implements Action {
    readonly type = ContractActionTypes.ContractsPageLoaded;
    constructor(public payload: { contracts: ContractModel[], totalCount: number, page: QueryParamsModel }) { }
}

export class ContractsPageCancelled implements Action {
    readonly type = ContractActionTypes.ContractsPageCancelled;
}

export class ContractsPageToggleLoading implements Action {
    readonly type = ContractActionTypes.ContractsPageToggleLoading;
    constructor(public payload: { isLoading: boolean }) { }
}

export class ContractActionToggleLoading implements Action {
    readonly type = ContractActionTypes.ContractActionToggleLoading;
    constructor(public payload: { isLoading: boolean }) { }
}
export class ContractBackProcessFailed implements Action {
    readonly type = ContractActionTypes.ContractBackProcessFailed;
    constructor(public payload: { isFailed: boolean }) { }
}
export class ContractBackProcessSuccess implements Action {
    readonly type = ContractActionTypes.ContractBackProcessSuccess;
    constructor(public payload: { isSuccess: boolean }) { }
}

export type ContractActions = ContractOnServerCreated
| ContractCreated
| ContractUpdated
| OneContractDeleted
| ManyContractsDeleted
| ContractsPageRequested
| ContractsPageLoaded
| ContractsPageCancelled
| ContractsPageToggleLoading
| ContractActionToggleLoading
| ContractBackProcessSuccess
| ContractBackProcessFailed;
