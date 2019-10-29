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
import { CompanyUserService } from '../_services/';
// State
import { AppState } from '../../reducers';
// Actions
import {
    CompanyUserActionTypes,
    CompanyUsersPageRequested,
    CompanyUsersPageLoaded,
    CompanyUserActionToggleLoading,
    CompanyUsersPageToggleLoading,
    CompanyUserCreated,
    CompanyUserUpdated,
    CompanyUserOnServerUpdated,
    CompanyUserBackProcessFailed,
    CompanyUserBackProcessSuccess,
    CompanyUserOnServerCreated
} from '../_actions/company-user.actions';
import { of } from 'rxjs';

@Injectable()
export class CompanyUserEffects {
    showPageLoadingDistpatcher = new CompanyUsersPageToggleLoading({ isLoading: true });
    showActionLoadingDistpatcher = new CompanyUserActionToggleLoading({ isLoading: true });
    hideActionLoadingDistpatcher = new CompanyUserActionToggleLoading({ isLoading: false });
    hideBackProcessFailedDistpatcher = new CompanyUserBackProcessFailed({ isFailed: false,errors:null });
    showBackProcessSuccessDistpatcher = new CompanyUserBackProcessSuccess({ isSuccess: true });
    hideBackProcessSuccessDistpatcher = new CompanyUserBackProcessSuccess({ isSuccess: false });

    @Effect()
    loadCompanyUsersPage$ = this.actions$.pipe(
        ofType<CompanyUsersPageRequested>(CompanyUserActionTypes.CompanyUsersPageRequested),
        mergeMap(( { payload } ) => {
            this.store.dispatch(this.showPageLoadingDistpatcher);
            const requestToServer = this.companyUserService.findCompanyUsers(payload.page);
            const lastQuery = of(payload.page);
            return forkJoin(requestToServer, lastQuery);
        }),
        map(response => {
            const result: QueryResultsModel = response[0];
            const lastQuery: QueryParamsModel = response[1];
            const pageLoadedDispatch = new CompanyUsersPageLoaded({
                companyUsers: result.data,
                totalCount: result.total,
                page: lastQuery
            });
            return pageLoadedDispatch;
        })
    );

    @Effect()
    updateCompanyUser$ = this.actions$
        .pipe(
            ofType<CompanyUserOnServerUpdated>(CompanyUserActionTypes.CompanyUserOnServerUpdated),
            mergeMap(( { payload } ) => {
                this.store.dispatch(this.showActionLoadingDistpatcher);
                this.store.dispatch(this.hideBackProcessFailedDistpatcher);
                this.store.dispatch(this.hideBackProcessSuccessDistpatcher);
                return this.companyUserService.updateCompanyUser(payload.companyUser);
            }),
            tap(res => {
                if(res.status=="ok"){
                    this.store.dispatch(this.showBackProcessSuccessDistpatcher);
                }
                if(res.status=="failed"){
                    this.store.dispatch(new CompanyUserBackProcessFailed({ isFailed: true,errors:res.errors }));
                }
            }),    
            map((res) => {
                return this.hideActionLoadingDistpatcher;
            }),
            catchError((err,caught) => {
                this.store.dispatch(new CompanyUserBackProcessFailed({ isFailed: true,errors:null }));
                    return of(new QueryResultsModel([], err))
                }
            ),
    );
    @Effect()
    createCompanyUser$ = this.actions$
        .pipe(
            ofType<CompanyUserOnServerCreated>(CompanyUserActionTypes.CompanyUserOnServerCreated),
            mergeMap(( { payload } ) => {
                this.store.dispatch(this.showActionLoadingDistpatcher);
                return this.companyUserService.createCompanyUser(payload.companyUser).pipe(
                    tap(res => {
                        var response:any = res;
                        if(response.status=="ok"){
                            this.store.dispatch(this.showBackProcessSuccessDistpatcher);
                            this.store.dispatch(new CompanyUserCreated({ companyUser: response.companyUser }));
                        }
                        if(response.status=="failed"){
                            this.store.dispatch(new CompanyUserBackProcessFailed({ isFailed: true,errors:res.errors }));
                        }
                    })
                );
            }),
            map(() => {
                return this.hideActionLoadingDistpatcher;
            }),
        );


    constructor(private actions$: Actions, private companyUserService: CompanyUserService, private store: Store<AppState>) { }
}
