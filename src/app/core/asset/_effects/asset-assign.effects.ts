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
import { AssetAssignService } from '../_services/';
// State
import { AppState } from '../../reducers';
// Actions
import {
    AssetAssignActionTypes,
    AssetAssignsPageRequested,
    AssetAssignsPageLoaded,
    AssetAssignActionToggleLoading,
    AssetAssignsPageToggleLoading,
    AssetAssignCreated,
    AssetAssignUpdated,
    AssetAssignOnServerDeleted,
    AssetAssignOnServerUpdated,
    OneAssetAssignDeleted,
    AssetAssignBackProcessFailed,
    AssetAssignBackProcessSuccess,
    AssetAssignOnServerCreated
} from '../_actions/asset-assign.actions';
import { of } from 'rxjs';

@Injectable()
export class AssetAssignEffects {
    showPageLoadingDistpatcher = new AssetAssignsPageToggleLoading({ isLoading: true });
    showActionLoadingDistpatcher = new AssetAssignActionToggleLoading({ isLoading: true });
    hideActionLoadingDistpatcher = new AssetAssignActionToggleLoading({ isLoading: false });
    hideBackProcessFailedDistpatcher = new AssetAssignBackProcessFailed({ isFailed: false,errors:null });
    showBackProcessSuccessDistpatcher = new AssetAssignBackProcessSuccess({ isSuccess: true });
    hideBackProcessSuccessDistpatcher = new AssetAssignBackProcessSuccess({ isSuccess: false });

    @Effect()
    loadAssetAssignsPage$ = this.actions$.pipe(
        ofType<AssetAssignsPageRequested>(AssetAssignActionTypes.AssetAssignsPageRequested),
        mergeMap(( { payload } ) => {
            this.store.dispatch(this.showPageLoadingDistpatcher);
            const requestToServer = this.assetAssignService.findAssetAssigns(payload.page);
            const lastQuery = of(payload.page);
            return forkJoin(requestToServer, lastQuery);
        }),
        map(response => {
            const result: QueryResultsModel = response[0];
            const lastQuery: QueryParamsModel = response[1];
            const pageLoadedDispatch = new AssetAssignsPageLoaded({
                assetAssigns: result.data,
                totalCount: result.total,
                page: lastQuery
            });
            return pageLoadedDispatch;
        })
    );

    @Effect()
    updateAssetAssign$ = this.actions$
        .pipe(
            ofType<AssetAssignOnServerUpdated>(AssetAssignActionTypes.AssetAssignOnServerUpdated),
            mergeMap(( { payload } ) => {
                this.store.dispatch(this.showActionLoadingDistpatcher);
                this.store.dispatch(this.hideBackProcessFailedDistpatcher);
                this.store.dispatch(this.hideBackProcessSuccessDistpatcher);
                return this.assetAssignService.updateAssetAssign(payload.assetAssign);
            }),
            tap(res => {
                if(res.status=="ok"){
                    this.store.dispatch(this.showBackProcessSuccessDistpatcher);
                }
                if(res.status=="failed"){
                    this.store.dispatch(new AssetAssignBackProcessFailed({ isFailed: true,errors:res.errors }));
                }
            }),    
            map((res) => {
                return this.hideActionLoadingDistpatcher;
            }),
            catchError((err,caught) => {
                this.store.dispatch(new AssetAssignBackProcessFailed({ isFailed: true,errors:null }));
                    return of(new QueryResultsModel([], err))
                }
            ),
    );
    @Effect()
    createAssetAssign$ = this.actions$
        .pipe(
            ofType<AssetAssignOnServerCreated>(AssetAssignActionTypes.AssetAssignOnServerCreated),
            mergeMap(( { payload } ) => {
                this.store.dispatch(this.showActionLoadingDistpatcher);
                return this.assetAssignService.createAssetAssign(payload.assetAssign).pipe(
                    tap(res => {
                        var response:any = res;
                        if(response.status=="ok"){
                            this.store.dispatch(this.showBackProcessSuccessDistpatcher);
                            this.store.dispatch(new AssetAssignCreated({ assetAssign: response.assetAssign }));
                        }
                        if(response.status=="failed"){
                            this.store.dispatch(new AssetAssignBackProcessFailed({ isFailed: true,errors:res.errors }));
                        }
                    })
                );
            }),
            map(() => {
                return this.hideActionLoadingDistpatcher;
            }),
        );
        @Effect()
        deleteAssetAssign$ = this.actions$
            .pipe(
                ofType<AssetAssignOnServerDeleted>(AssetAssignActionTypes.AssetAssignOnServerDeleted),
                mergeMap(( { payload } ) => {
                    this.store.dispatch(this.showActionLoadingDistpatcher);
                    return this.assetAssignService.deleteAssetAssign(payload.id).pipe(
                        tap(res => {
                            this.store.dispatch(new OneAssetAssignDeleted({ id: payload.id }));
                        })
                    );
                }),
                map(() => {
                    return this.hideActionLoadingDistpatcher;
                }),
            );
    

    constructor(private actions$: Actions, private assetAssignService: AssetAssignService, private store: Store<AppState>) { }
}
