import { QueryParamsModel } from '../../_base/crud/models/query-models/query-params.model';
import { forkJoin } from 'rxjs';
// Angular
import { Injectable } from '@angular/core';
// RxJS
import { mergeMap, map, tap, delay,catchError } from 'rxjs/operators';
// NGRX
import { Effect, Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
// CRUD
import { QueryResultsModel } from '../../_base/crud';
// Services
import { EventService } from '../_services/';
// State
import { AppState } from '../../reducers';
// Actions
import {
    EventActionTypes,
    EventsPageRequested,
    EventsPageLoaded,
    EventActionToggleLoading,
    EventsPageToggleLoading,
    EventCreated,
    EventUpdated,
    EventOnServerUpdated,
    EventBackProcessFailed,
    EventBackProcessSuccess,
    EventOnServerCreated
} from '../_actions/event.actions';
import { of } from 'rxjs';

@Injectable()
export class EventEffects {
    showPageLoadingDistpatcher = new EventsPageToggleLoading({ isLoading: true });
    showActionLoadingDistpatcher = new EventActionToggleLoading({ isLoading: true });
    hideActionLoadingDistpatcher = new EventActionToggleLoading({ isLoading: false });
    hideBackProcessFailedDistpatcher = new EventBackProcessFailed({ isFailed: false,errors:null });
    showBackProcessSuccessDistpatcher = new EventBackProcessSuccess({ isSuccess: true });
    hideBackProcessSuccessDistpatcher = new EventBackProcessSuccess({ isSuccess: false });

    @Effect()
    loadEventsPage$ = this.actions$.pipe(
        ofType<EventsPageRequested>(EventActionTypes.EventsPageRequested),
        mergeMap(( { payload } ) => {
            this.store.dispatch(this.showPageLoadingDistpatcher);
            const requestToServer = this.eventService.findEvents(payload.page);
            const lastQuery = of(payload.page);
            return forkJoin(requestToServer, lastQuery);
        }),
        map(response => {
            const result: QueryResultsModel = response[0];
            const lastQuery: QueryParamsModel = response[1];
            const pageLoadedDispatch = new EventsPageLoaded({
                events: result.data,
                totalCount: result.total,
                page: lastQuery
            });
            return pageLoadedDispatch;
        })
    );

    @Effect()
    updateEvent$ = this.actions$
        .pipe(
            ofType<EventOnServerUpdated>(EventActionTypes.EventOnServerUpdated),
            mergeMap(( { payload } ) => {
                this.store.dispatch(this.showActionLoadingDistpatcher);
                this.store.dispatch(this.hideBackProcessFailedDistpatcher);
                this.store.dispatch(this.hideBackProcessSuccessDistpatcher);
                return this.eventService.updateEvent(payload.event);
            }),
            tap(res => {
                if(res.status=="ok"){
                    this.store.dispatch(this.showBackProcessSuccessDistpatcher);
                }
                if(res.status=="failed"){
                    this.store.dispatch(new EventBackProcessFailed({ isFailed: true,errors:res.errors }));
                }
            }),    
            map((res) => {
                return this.hideActionLoadingDistpatcher;
            }),
            catchError((err,caught) => {
                this.store.dispatch(new EventBackProcessFailed({ isFailed: true,errors:null }));
                    return of(new QueryResultsModel([], err))
                }
            ),
    );
    @Effect()
    createEvent$ = this.actions$
        .pipe(
            ofType<EventOnServerCreated>(EventActionTypes.EventOnServerCreated),
            mergeMap(( { payload } ) => {
                this.store.dispatch(this.showActionLoadingDistpatcher);
                return this.eventService.createEvent(payload.event).pipe(
                    tap(res => {
                        var response:any = res;
                        if(response.status=="ok"){
                            this.store.dispatch(this.showBackProcessSuccessDistpatcher);
                            this.store.dispatch(new EventCreated({ event: response.event }));
                        }
                        if(response.status=="failed"){
                            this.store.dispatch(new EventBackProcessFailed({ isFailed: true,errors:res.errors }));
                        }
                    })
                );
            }),
            map(() => {
                return this.hideActionLoadingDistpatcher;
            }),
        );


    constructor(private actions$: Actions, private eventService: EventService, private store: Store<AppState>) { }
}
