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
import { TimeoffService } from '../_services/';
// State
import { AppState } from '../../reducers';
// Actions
import {
    TimeoffActionTypes,
    TimeoffsPageRequested,
    TimeoffsPageLoaded,
    TimeoffActionToggleLoading,
    TimeoffsPageToggleLoading,
    TimeoffCreated,
    TimeoffUpdated,
    TimeoffOnServerUpdated,
    TimeoffBackProcessFailed,
    TimeoffBackProcessSuccess,
    TimeoffOnServerCreated
} from '../_actions/timeoff.actions';
import { of } from 'rxjs';

@Injectable()
export class TimeoffEffects {
    showPageLoadingDistpatcher = new TimeoffsPageToggleLoading({ isLoading: true });
    showActionLoadingDistpatcher = new TimeoffActionToggleLoading({ isLoading: true });
    hideActionLoadingDistpatcher = new TimeoffActionToggleLoading({ isLoading: false });
    hideBackProcessFailedDistpatcher = new TimeoffBackProcessFailed({ isFailed: false,errors:null });
    showBackProcessSuccessDistpatcher = new TimeoffBackProcessSuccess({ isSuccess: true });
    hideBackProcessSuccessDistpatcher = new TimeoffBackProcessSuccess({ isSuccess: false });

    @Effect()
    loadTimeoffsPage$ = this.actions$.pipe(
        ofType<TimeoffsPageRequested>(TimeoffActionTypes.TimeoffsPageRequested),
        mergeMap(( { payload } ) => {
            this.store.dispatch(this.showPageLoadingDistpatcher);
            const requestToServer = this.timeoffService.findTimeoffs(payload.page);
            const lastQuery = of(payload.page);
            return forkJoin(requestToServer, lastQuery);
        }),
        map(response => {
            const result: QueryResultsModel = response[0];
            const lastQuery: QueryParamsModel = response[1];
            const pageLoadedDispatch = new TimeoffsPageLoaded({
                timeoffs: result.data,
                totalCount: result.total,
                page: lastQuery
            });
            return pageLoadedDispatch;
        })
    );

    @Effect()
    updateTimeoff$ = this.actions$
        .pipe(
            ofType<TimeoffOnServerUpdated>(TimeoffActionTypes.TimeoffOnServerUpdated),
            mergeMap(( { payload } ) => {
                this.store.dispatch(this.showActionLoadingDistpatcher);
                this.store.dispatch(this.hideBackProcessFailedDistpatcher);
                this.store.dispatch(this.hideBackProcessSuccessDistpatcher);
                return this.timeoffService.updateTimeoff(payload.timeoff);
            }),
            tap(res => {
                if(res.status=="ok"){
                    this.store.dispatch(this.showBackProcessSuccessDistpatcher);
                }
                if(res.status=="failed"){
                    this.store.dispatch(new TimeoffBackProcessFailed({ isFailed: true,errors:res.errors }));
                }
            }),    
            map((res) => {
                return this.hideActionLoadingDistpatcher;
            }),
            catchError((err,caught) => {
                this.store.dispatch(new TimeoffBackProcessFailed({ isFailed: true,errors:null }));
                    return of(new QueryResultsModel([], err))
                }
            ),
    );
    @Effect()
    createTimeoff$ = this.actions$
        .pipe(
            ofType<TimeoffOnServerCreated>(TimeoffActionTypes.TimeoffOnServerCreated),
            mergeMap(( { payload } ) => {
                this.store.dispatch(this.showActionLoadingDistpatcher);
                return this.timeoffService.createTimeoff(payload.timeoff).pipe(
                    tap(res => {
                        var response:any = res;
                        if(response.status=="ok"){
                            this.store.dispatch(this.showBackProcessSuccessDistpatcher);
                            this.store.dispatch(new TimeoffCreated({ timeoff: response.timeoff }));
                        }
                        if(response.status=="failed"){
                            this.store.dispatch(new TimeoffBackProcessFailed({ isFailed: true,errors:res.errors }));
                        }
                    })
                );
            }),
            map(() => {
                return this.hideActionLoadingDistpatcher;
            }),
        );


    constructor(private actions$: Actions, private timeoffService: TimeoffService, private store: Store<AppState>) { }
}
