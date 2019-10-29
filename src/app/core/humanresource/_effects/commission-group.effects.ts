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
import { CommissionGroupService } from '../_services/';
// State
import { AppState } from '../../reducers';
// Actions
import {
    CommissionGroupActionTypes,
    CommissionGroupsPageRequested,
    CommissionGroupsPageLoaded,
    CommissionGroupActionToggleLoading,
    CommissionGroupsPageToggleLoading,
    CommissionGroupCreated,
    CommissionGroupUpdated,
    CommissionGroupOnServerUpdated,
    CommissionGroupBackProcessFailed,
    CommissionGroupBackProcessSuccess,
    CommissionGroupOnServerCreated
} from '../_actions/commission-group.actions';
import { of } from 'rxjs';

@Injectable()
export class CommissionGroupEffects {
    showPageLoadingDistpatcher = new CommissionGroupsPageToggleLoading({ isLoading: true });
    showActionLoadingDistpatcher = new CommissionGroupActionToggleLoading({ isLoading: true });
    hideActionLoadingDistpatcher = new CommissionGroupActionToggleLoading({ isLoading: false });
    hideBackProcessFailedDistpatcher = new CommissionGroupBackProcessFailed({ isFailed: false,errors:null });
    showBackProcessSuccessDistpatcher = new CommissionGroupBackProcessSuccess({ isSuccess: true });
    hideBackProcessSuccessDistpatcher = new CommissionGroupBackProcessSuccess({ isSuccess: false });

    @Effect()
    loadCommissionGroupsPage$ = this.actions$.pipe(
        ofType<CommissionGroupsPageRequested>(CommissionGroupActionTypes.CommissionGroupsPageRequested),
        mergeMap(( { payload } ) => {
            this.store.dispatch(this.showPageLoadingDistpatcher);
            const requestToServer = this.commissionGroupService.findCommissionGroups(payload.page);
            const lastQuery = of(payload.page);
            return forkJoin(requestToServer, lastQuery);
        }),
        map(response => {
            const result: QueryResultsModel = response[0];
            const lastQuery: QueryParamsModel = response[1];
            const pageLoadedDispatch = new CommissionGroupsPageLoaded({
                commissionGroups: result.data,
                totalCount: result.total,
                page: lastQuery
            });
            return pageLoadedDispatch;
        })
    );

    @Effect()
    updateCommissionGroup$ = this.actions$
        .pipe(
            ofType<CommissionGroupOnServerUpdated>(CommissionGroupActionTypes.CommissionGroupOnServerUpdated),
            mergeMap(( { payload } ) => {
                this.store.dispatch(this.showActionLoadingDistpatcher);
                this.store.dispatch(this.hideBackProcessFailedDistpatcher);
                this.store.dispatch(this.hideBackProcessSuccessDistpatcher);
                return this.commissionGroupService.updateCommissionGroup(payload.commissionGroup);
            }),
            tap(res => {
                if(res.status=="ok"){
                    this.store.dispatch(this.showBackProcessSuccessDistpatcher);
                }
                if(res.status=="failed"){
                    this.store.dispatch(new CommissionGroupBackProcessFailed({ isFailed: true,errors:res.errors }));
                }
            }),    
            map((res) => {
                return this.hideActionLoadingDistpatcher;
            }),
            catchError((err,caught) => {
                this.store.dispatch(new CommissionGroupBackProcessFailed({ isFailed: true,errors:null }));
                    return of(new QueryResultsModel([], err))
                }
            ),
    );
    @Effect()
    createCommissionGroup$ = this.actions$
        .pipe(
            ofType<CommissionGroupOnServerCreated>(CommissionGroupActionTypes.CommissionGroupOnServerCreated),
            mergeMap(( { payload } ) => {
                this.store.dispatch(this.showActionLoadingDistpatcher);
                return this.commissionGroupService.createCommissionGroup(payload.commissionGroup).pipe(
                    tap(res => {
                        var response:any = res;
                        if(response.status=="ok"){
                            this.store.dispatch(this.showBackProcessSuccessDistpatcher);
                            this.store.dispatch(new CommissionGroupCreated({ commissionGroup: response.commissionGroup }));
                        }
                        if(response.status=="failed"){
                            this.store.dispatch(new CommissionGroupBackProcessFailed({ isFailed: true,errors:res.errors }));
                        }
                    })
                );
            }),
            map(() => {
                return this.hideActionLoadingDistpatcher;
            }),
        );


    constructor(private actions$: Actions, private commissionGroupService: CommissionGroupService, private store: Store<AppState>) { }
}
