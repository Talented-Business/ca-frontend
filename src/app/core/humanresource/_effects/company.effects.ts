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
import { CompanyService } from '../_services/';
// State
import { AppState } from '../../reducers';
// Actions
import {
    CompanyActionTypes,
    CompaniesPageRequested,
    CompaniesPageLoaded,
    CompanyActionToggleLoading,
    CompaniesPageToggleLoading,
    CompanyUpdated,
    CompanyBackProcessFailed,
    CompanyBackProcessSuccess
} from '../_actions/company.actions';
import { of } from 'rxjs';

@Injectable()
export class CompanyEffects {
    showPageLoadingDistpatcher = new CompaniesPageToggleLoading({ isLoading: true });
    showActionLoadingDistpatcher = new CompanyActionToggleLoading({ isLoading: true });
    hideActionLoadingDistpatcher = new CompanyActionToggleLoading({ isLoading: false });
    showBackProcessFailedDistpatcher = new CompanyBackProcessFailed({ isFailed: true });
    hideBackProcessFailedDistpatcher = new CompanyBackProcessFailed({ isFailed: false });
    showBackProcessSuccessDistpatcher = new CompanyBackProcessSuccess({ isSuccess: true });
    hideBackProcessSuccessDistpatcher = new CompanyBackProcessSuccess({ isSuccess: false });

    @Effect()
    loadCompaniesPage$ = this.actions$.pipe(
        ofType<CompaniesPageRequested>(CompanyActionTypes.CompaniesPageRequested),
        mergeMap(( { payload } ) => {
            this.store.dispatch(this.showPageLoadingDistpatcher);
            const requestToServer = this.companiesService.findCompanies(payload.page);
            const lastQuery = of(payload.page);
            return forkJoin(requestToServer, lastQuery);
        }),
        map(response => {
            const result: QueryResultsModel = response[0];
            const lastQuery: QueryParamsModel = response[1];
            const pageLoadedDispatch = new CompaniesPageLoaded({
                companies: result.data,
                totalCount: result.total,
                page: lastQuery
            });
            return pageLoadedDispatch;
        })
    );

    @Effect()
    updateCompany$ = this.actions$
        .pipe(
            ofType<CompanyUpdated>(CompanyActionTypes.CompanyUpdated),
            mergeMap(( { payload } ) => {
                this.store.dispatch(this.showActionLoadingDistpatcher);
                this.store.dispatch(this.hideBackProcessFailedDistpatcher);
                this.store.dispatch(this.hideBackProcessSuccessDistpatcher);
                return this.companiesService.updateCompany(payload.company);
            }),
            tap(res => {
                this.store.dispatch(this.showBackProcessSuccessDistpatcher);
            }),    
            map(() => {
                return this.hideActionLoadingDistpatcher;
            }),
            catchError((err,caught) => {
                    this.store.dispatch(this.showBackProcessFailedDistpatcher);
                    return of(new QueryResultsModel([], err))
                }
            ),
    );


    constructor(private actions$: Actions, private companiesService: CompanyService, private store: Store<AppState>) { }
}
