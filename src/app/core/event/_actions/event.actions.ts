// NGRX
import { Action } from '@ngrx/store';
import { Update } from '@ngrx/entity';
// CRUD
import { QueryParamsModel } from '../../_base/crud';
// Models
import { EventModel } from '../_models/event.model';

export enum EventActionTypes {
    EventOnServerCreated = '[Edit Event Component] Event On Server Created',    
    EventCreated = '[Edit Event Dialog] Event Created',
    EventOnServerUpdated = '[Edit Event Component] Event On Server Updated',    
    EventUpdated = '[Edit Event Dialog] Event Updated',
    OneEventDeleted = '[Events List Page] One Event Deleted',
    ManyEventsDeleted = '[Events List Page] Many Event Deleted',
    EventsPageRequested = '[Events List Page] Events Page Requested',
    EventsPageLoaded = '[Events API] Events Page Loaded',
    EventsPageCancelled = '[Events API] Events Page Cancelled',
    EventsPageToggleLoading = '[Events] Events Page Toggle Loading',
    EventActionToggleLoading = '[Events] Events Action Toggle Loading',
    EventBackProcessFailed = '[Events Back] Events Back Process Failed',
    EventBackProcessSuccess = '[Events Back] Events Back Process Success',
}

export class EventOnServerCreated implements Action {
    readonly type = EventActionTypes.EventOnServerCreated;
    constructor(public payload: { event: EventModel }) { }
}

export class EventCreated implements Action {
    readonly type = EventActionTypes.EventCreated;
    constructor(public payload: { event: EventModel }) { }
}

export class EventOnServerUpdated implements Action {
    readonly type = EventActionTypes.EventOnServerUpdated;
    constructor(public payload: {
        partialEvent: Update<EventModel>, // For State update
        event: EventModel // For Server update (through service)
    }) { }
}

export class EventUpdated implements Action {
    readonly type = EventActionTypes.EventUpdated;
    constructor(public payload: {
        partialEvent: Update<EventModel>, // For State update
        event: EventModel // For Server update (through service)
    }) { }
}

export class OneEventDeleted implements Action {
    readonly type = EventActionTypes.OneEventDeleted;
    constructor(public payload: { id: number }) {}
}

export class ManyEventsDeleted implements Action {
    readonly type = EventActionTypes.ManyEventsDeleted;
    constructor(public payload: { ids: number[] }) {}
}

export class EventsPageRequested implements Action {
    readonly type = EventActionTypes.EventsPageRequested;
    constructor(public payload: { page: QueryParamsModel }) { }
}

export class EventsPageLoaded implements Action {
    readonly type = EventActionTypes.EventsPageLoaded;
    constructor(public payload: { events: EventModel[], totalCount: number, page: QueryParamsModel }) { }
}

export class EventsPageCancelled implements Action {
    readonly type = EventActionTypes.EventsPageCancelled;
}

export class EventsPageToggleLoading implements Action {
    readonly type = EventActionTypes.EventsPageToggleLoading;
    constructor(public payload: { isLoading: boolean }) { }
}

export class EventActionToggleLoading implements Action {
    readonly type = EventActionTypes.EventActionToggleLoading;
    constructor(public payload: { isLoading: boolean }) { }
}
export class EventBackProcessFailed implements Action {
    readonly type = EventActionTypes.EventBackProcessFailed;
    constructor(public payload: { isFailed: boolean;errors:any }) { }
}
export class EventBackProcessSuccess implements Action {
    readonly type = EventActionTypes.EventBackProcessSuccess;
    constructor(public payload: { isSuccess: boolean }) { }
}

export type EventActions = EventOnServerCreated
| EventCreated
| EventOnServerUpdated
| EventUpdated
| OneEventDeleted
| ManyEventsDeleted
| EventsPageRequested
| EventsPageLoaded
| EventsPageCancelled
| EventsPageToggleLoading
| EventActionToggleLoading
| EventBackProcessSuccess
| EventBackProcessFailed;
