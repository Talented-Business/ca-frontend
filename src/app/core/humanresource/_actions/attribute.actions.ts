// NGRX
import { Action } from '@ngrx/store';
import { Update } from '@ngrx/entity';
// CRUD
import { QueryParamsModel } from '../../_base/crud';
// Models
import { AttributeModel } from '../_models/attribute.model';

export enum AttributeActionTypes {
    AllAttributesRequested = '[Attributes Home Page] All Attributes Requested',
    AllAttributesLoaded = '[Attributes API] All Attributes Loaded',
    AttributeOnServerCreated = '[Edit Attribute Dialog] Attribute On Server Created',
    AttributeOnServerUpdated = '[Edit Attribute Dialog] Attribute On Server Updated',
    AttributeCreated = '[Edit Attributes Dialog] Attributes Created',
    AttributeUpdated = '[Edit Attribute Dialog] Attribute Updated',
    AttributeDeleted = '[Attributes List Page] Attribute Deleted',
    AttributeActionToggleLoading = '[Attributes] Attributes Action Toggle Loading',
    AttributeListingChanged = '[Attributes Changed] Attributes Changed',
}

export class AttributeOnServerCreated implements Action {
    readonly type = AttributeActionTypes.AttributeOnServerCreated;
    constructor(public payload: { attribute: AttributeModel }) { }
}

export class AttributeCreated implements Action {
    readonly type = AttributeActionTypes.AttributeCreated;
    constructor(public payload: { attribute: AttributeModel }) { }
}

export class AttributeOnServerUpdated implements Action {
    readonly type = AttributeActionTypes.AttributeOnServerUpdated;
    constructor(public payload: {
        partialAttribute: Update<AttributeModel>, // For State update
        attribute: AttributeModel // For Server update (through service)
    }) { }
}

export class AttributeUpdated implements Action {
    readonly type = AttributeActionTypes.AttributeUpdated;
    constructor(public payload: {
        partialattribute: Update<AttributeModel>,
        attribute: AttributeModel
    }) { }
}

export class AttributeDeleted implements Action {
    readonly type = AttributeActionTypes.AttributeDeleted;
    constructor(public payload: { id: number }) {}
}

export class AllAttributesRequested implements Action {
    readonly type = AttributeActionTypes.AllAttributesRequested;
}

export class AllAttributesLoaded implements Action {
    readonly type = AttributeActionTypes.AllAttributesLoaded;
    constructor(public payload: { attributes: AttributeModel[] }) { }
}

export class AttributeActionToggleLoading implements Action {
    readonly type = AttributeActionTypes.AttributeActionToggleLoading;
    constructor(public payload: { isLoading: boolean }) { }
}

export class AttributeListingChanged implements Action {
    readonly type = AttributeActionTypes.AttributeListingChanged;
}


export type AttributeActions = AttributeCreated
| AttributeOnServerUpdated
| AttributeUpdated
| AttributeDeleted
| AllAttributesLoaded
| AllAttributesRequested
| AttributeActionToggleLoading
| AttributeListingChanged
| AttributeOnServerCreated;
