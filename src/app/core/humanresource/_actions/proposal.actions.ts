// NGRX
import { Action } from '@ngrx/store';
import { Update } from '@ngrx/entity';
// CRUD
import { QueryParamsModel } from '../../_base/crud';
// Models
import { ProposalModel } from '../_models/proposal.model';

export enum ProposalActionTypes {
    ProposalOnServerCreated = '[Edit Proposal Component] Proposal On Server Created',    
    ProposalCreated = '[Edit Proposal Dialog] Proposal Created',
    ProposalOnServerUpdated = '[Edit Proposal Component] Proposal On Server Updated',    
    ProposalUpdated = '[Edit Proposal Dialog] Proposal Updated',
    OneProposalDeleted = '[Proposals List Page] One Proposal Deleted',
    ManyProposalsDeleted = '[Proposals List Page] Many Proposal Deleted',
    ProposalsPageRequested = '[Proposals List Page] Proposals Page Requested',
    ProposalsPageLoaded = '[Proposals API] Proposals Page Loaded',
    ProposalsPageCancelled = '[Proposals API] Proposals Page Cancelled',
    ProposalsPageToggleLoading = '[Proposals] Proposals Page Toggle Loading',
    ProposalActionToggleLoading = '[Proposals] Proposals Action Toggle Loading',
    ProposalBackProcessFailed = '[Proposals Back] Proposals Back Process Failed',
    ProposalBackProcessSuccess = '[Proposals Back] Proposals Back Process Success',
}

export class ProposalOnServerCreated implements Action {
    readonly type = ProposalActionTypes.ProposalOnServerCreated;
    constructor(public payload: { proposal: ProposalModel }) { }
}

export class ProposalCreated implements Action {
    readonly type = ProposalActionTypes.ProposalCreated;
    constructor(public payload: { proposal: ProposalModel }) { }
}

export class ProposalOnServerUpdated implements Action {
    readonly type = ProposalActionTypes.ProposalOnServerUpdated;
    constructor(public payload: {
        partialProposal: Update<ProposalModel>, // For State update
        proposal: ProposalModel // For Server update (through service)
    }) { }
}

export class ProposalUpdated implements Action {
    readonly type = ProposalActionTypes.ProposalUpdated;
    constructor(public payload: {
        partialProposal: Update<ProposalModel>, // For State update
        proposal: ProposalModel // For Server update (through service)
    }) { }
}

export class OneProposalDeleted implements Action {
    readonly type = ProposalActionTypes.OneProposalDeleted;
    constructor(public payload: { id: number }) {}
}

export class ManyProposalsDeleted implements Action {
    readonly type = ProposalActionTypes.ManyProposalsDeleted;
    constructor(public payload: { ids: number[] }) {}
}

export class ProposalsPageRequested implements Action {
    readonly type = ProposalActionTypes.ProposalsPageRequested;
    constructor(public payload: { page: QueryParamsModel }) { }
}

export class ProposalsPageLoaded implements Action {
    readonly type = ProposalActionTypes.ProposalsPageLoaded;
    constructor(public payload: { proposals: ProposalModel[], totalCount: number, page: QueryParamsModel }) { }
}

export class ProposalsPageCancelled implements Action {
    readonly type = ProposalActionTypes.ProposalsPageCancelled;
}

export class ProposalsPageToggleLoading implements Action {
    readonly type = ProposalActionTypes.ProposalsPageToggleLoading;
    constructor(public payload: { isLoading: boolean }) { }
}

export class ProposalActionToggleLoading implements Action {
    readonly type = ProposalActionTypes.ProposalActionToggleLoading;
    constructor(public payload: { isLoading: boolean }) { }
}
export class ProposalBackProcessFailed implements Action {
    readonly type = ProposalActionTypes.ProposalBackProcessFailed;
    constructor(public payload: { isFailed: boolean;errors:any }) { }
}
export class ProposalBackProcessSuccess implements Action {
    readonly type = ProposalActionTypes.ProposalBackProcessSuccess;
    constructor(public payload: { isSuccess: boolean }) { }
}

export type ProposalActions = ProposalOnServerCreated
| ProposalCreated
| ProposalOnServerUpdated
| ProposalUpdated
| OneProposalDeleted
| ManyProposalsDeleted
| ProposalsPageRequested
| ProposalsPageLoaded
| ProposalsPageCancelled
| ProposalsPageToggleLoading
| ProposalActionToggleLoading
| ProposalBackProcessSuccess
| ProposalBackProcessFailed;
