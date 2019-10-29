// NGRX
import { createFeatureSelector, createSelector } from '@ngrx/store';
// Lodash
import { each } from 'lodash';
// CRUD
import { QueryResultsModel, HttpExtenstionsModel } from '../../_base/crud';
// State
import { EventsState } from '../_reducers/event.reducers';
import { EventModel } from '../_models/event.model';

export const selectEventsState = createFeatureSelector<EventsState>('events');

export const selectEventById = (eventId: number) => createSelector(
    selectEventsState,
    eventsState => eventsState.entities[eventId]
);

export const selectEventsPageLoading = createSelector(
    selectEventsState,
    eventsState => eventsState.listLoading
);

export const selectEventsActionLoading = createSelector(
    selectEventsState,
    eventsState => eventsState.actionsloading
);

export const selectEventsBackProcessingFailed = createSelector(
    selectEventsState,
    eventsState => eventsState.errors
);

export const selectEventsBackProcessingSuccess = createSelector(
    selectEventsState,
    eventsState => eventsState.backProcessSuccess
);

export const selectLastCreatedEventId = createSelector(
    selectEventsState,
    eventsState => eventsState.lastCreatedEventId
);

export const selectEventsShowInitWaitingMessage = createSelector(
    selectEventsState,
    eventsState => eventsState.showInitWaitingMessage
);

export const selectEventsInStore = createSelector(
    selectEventsState,
    eventsState => {
        const items: EventModel[] = [];
        each(eventsState.entities, element => {
            items.push(element);
        });
        const httpExtension = new HttpExtenstionsModel();
        const result: EventModel[] = httpExtension.sortArray(items, eventsState.lastQuery.sortField, eventsState.lastQuery.sortOrder);
        return new QueryResultsModel(result, eventsState.totalCount, '');
    }
);
