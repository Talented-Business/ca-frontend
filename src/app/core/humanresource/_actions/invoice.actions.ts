// NGRX
import { Action } from '@ngrx/store';
import { Update } from '@ngrx/entity';
// CRUD
import { QueryParamsModel } from '../../_base/crud';
// Models
import { InvoiceModel } from '../_models/invoice.model';

export enum InvoiceActionTypes {
    InvoiceOnServerCreated = '[Edit Invoice Component] Invoice On Server Created',    
    InvoiceCreated = '[Edit Invoice Dialog] Invoice Created',
    InvoiceOnServerUpdated = '[Edit Invoice Component] Invoice On Server Updated',    
    InvoiceUpdated = '[Edit Invoice Dialog] Invoice Updated',
    OneInvoiceDeleted = '[Invoices List Page] One Invoice Deleted',
    ManyInvoicesDeleted = '[Invoices List Page] Many Invoice Deleted',
    InvoicesPageRequested = '[Invoices List Page] Invoices Page Requested',
    InvoicesPageLoaded = '[Invoices API] Invoices Page Loaded',
    InvoicesPageCancelled = '[Invoices API] Invoices Page Cancelled',
    InvoicesPageToggleLoading = '[Invoices] Invoices Page Toggle Loading',
    InvoiceActionToggleLoading = '[Invoices] Invoices Action Toggle Loading',
    InvoiceBackProcessFailed = '[Invoices Back] Invoices Back Process Failed',
    InvoiceBackProcessSuccess = '[Invoices Back] Invoices Back Process Success',
}

export class InvoiceOnServerCreated implements Action {
    readonly type = InvoiceActionTypes.InvoiceOnServerCreated;
    constructor(public payload: { invoice: InvoiceModel }) { }
}

export class InvoiceCreated implements Action {
    readonly type = InvoiceActionTypes.InvoiceCreated;
    constructor(public payload: { invoice: InvoiceModel }) { }
}

export class InvoiceOnServerUpdated implements Action {
    readonly type = InvoiceActionTypes.InvoiceOnServerUpdated;
    constructor(public payload: {
        partialInvoice: Update<InvoiceModel>, // For State update
        invoice: InvoiceModel // For Server update (through service)
    }) { }
}

export class InvoiceUpdated implements Action {
    readonly type = InvoiceActionTypes.InvoiceUpdated;
    constructor(public payload: {
        partialInvoice: Update<InvoiceModel>, // For State update
        invoice: InvoiceModel // For Server update (through service)
    }) { }
}

export class OneInvoiceDeleted implements Action {
    readonly type = InvoiceActionTypes.OneInvoiceDeleted;
    constructor(public payload: { id: number }) {}
}

export class ManyInvoicesDeleted implements Action {
    readonly type = InvoiceActionTypes.ManyInvoicesDeleted;
    constructor(public payload: { ids: number[] }) {}
}

export class InvoicesPageRequested implements Action {
    readonly type = InvoiceActionTypes.InvoicesPageRequested;
    constructor(public payload: { page: QueryParamsModel }) { }
}

export class InvoicesPageLoaded implements Action {
    readonly type = InvoiceActionTypes.InvoicesPageLoaded;
    constructor(public payload: { invoices: InvoiceModel[], totalCount: number, page: QueryParamsModel }) { }
}

export class InvoicesPageCancelled implements Action {
    readonly type = InvoiceActionTypes.InvoicesPageCancelled;
}

export class InvoicesPageToggleLoading implements Action {
    readonly type = InvoiceActionTypes.InvoicesPageToggleLoading;
    constructor(public payload: { isLoading: boolean }) { }
}

export class InvoiceActionToggleLoading implements Action {
    readonly type = InvoiceActionTypes.InvoiceActionToggleLoading;
    constructor(public payload: { isLoading: boolean }) { }
}
export class InvoiceBackProcessFailed implements Action {
    readonly type = InvoiceActionTypes.InvoiceBackProcessFailed;
    constructor(public payload: { isFailed: boolean;errors:any }) { }
}
export class InvoiceBackProcessSuccess implements Action {
    readonly type = InvoiceActionTypes.InvoiceBackProcessSuccess;
    constructor(public payload: { isSuccess: boolean }) { }
}

export type InvoiceActions = InvoiceOnServerCreated
| InvoiceCreated
| InvoiceOnServerUpdated
| InvoiceUpdated
| OneInvoiceDeleted
| ManyInvoicesDeleted
| InvoicesPageRequested
| InvoicesPageLoaded
| InvoicesPageCancelled
| InvoicesPageToggleLoading
| InvoiceActionToggleLoading
| InvoiceBackProcessSuccess
| InvoiceBackProcessFailed;
