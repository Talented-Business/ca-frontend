import { QueryParamsModel } from '../../_base/crud/models/query-models/query-params.model';
import { forkJoin } from 'rxjs';
// Angular
import { Injectable } from '@angular/core';
// RxJS
import { mergeMap, map, tap, delay } from 'rxjs/operators';
// NGRX
import { Effect, Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
// CRUD
import { QueryResultsModel } from '../../_base/crud';
// Services
import { EmployeesService } from '../_services/';
// State
import { AppState } from '../../reducers';
// Actions
import {
    RecruitActionTypes,
    RecruitsPageRequested,
    RecruitsPageLoaded,
    RecruitActionToggleLoading,
    RecruitsPageToggleLoading,
    RecruitUpdated,
    RecruitsStatusUpdated,
} from '../_actions/recruit.actions';
import { of } from 'rxjs';

@Injectable()
export class RecruitEffects {
    showPageLoadingDistpatcher = new RecruitsPageToggleLoading({ isLoading: true });
    showActionLoadingDistpatcher = new RecruitActionToggleLoading({ isLoading: true });
    hideActionLoadingDistpatcher = new RecruitActionToggleLoading({ isLoading: false });

    @Effect()
    loadRecruitsPage$ = this.actions$.pipe(
        ofType<RecruitsPageRequested>(RecruitActionTypes.RecruitsPageRequested),
        mergeMap(( { payload } ) => {
            this.store.dispatch(this.showPageLoadingDistpatcher);
            const requestToServer = this.employeesService.findRecruits(payload.page);
            const lastQuery = of(payload.page);
            return forkJoin(requestToServer, lastQuery);
        }),
        map(response => {
            const result: QueryResultsModel = response[0];
            const lastQuery: QueryParamsModel = response[1];
            const pageLoadedDispatch = new RecruitsPageLoaded({
                recruits: result.data,
                totalCount: result.total,
                page: lastQuery
            });
            return pageLoadedDispatch;
        })
    );

    @Effect()
    updateRecruit$ = this.actions$
        .pipe(
            ofType<RecruitUpdated>(RecruitActionTypes.RecruitUpdated),
            mergeMap(( { payload } ) => {
                this.store.dispatch(this.showActionLoadingDistpatcher);
                return this.employeesService.updateRecruit(payload.recruit);
            }),
            map(() => {
                return this.hideActionLoadingDistpatcher;
            })
        );

    @Effect()
    updateRecruitsStatus$ = this.actions$
        .pipe(
            ofType<RecruitsStatusUpdated>(RecruitActionTypes.RecruitsStatusUpdated),
            mergeMap(( { payload } ) => {
                this.store.dispatch(this.showActionLoadingDistpatcher);
                return this.employeesService.updateStatusForRecruit(payload.recruits, payload.status);
            }),
            map(() => {
                return this.hideActionLoadingDistpatcher;
            })
        );

    constructor(private actions$: Actions, private employeesService: EmployeesService, private store: Store<AppState>) { }
}
