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
import { AssetService } from '../_services/';
// State
import { AppState } from '../../reducers';
// Actions
import {
    AssetActionTypes,
    AssetsPageRequested,
    AssetsPageLoaded,
    AssetActionToggleLoading,
    AssetsPageToggleLoading,
    AssetCreated,
    AssetUpdated,
    AssetOnServerDeleted,
    AssetOnServerUpdated,
    OneAssetDeleted,
    AssetBackProcessFailed,
    AssetBackProcessSuccess,
    AssetOnServerCreated
} from '../_actions/asset.actions';
import { of } from 'rxjs';

@Injectable()
export class AssetEffects {
    showPageLoadingDistpatcher = new AssetsPageToggleLoading({ isLoading: true });
    showActionLoadingDistpatcher = new AssetActionToggleLoading({ isLoading: true });
    hideActionLoadingDistpatcher = new AssetActionToggleLoading({ isLoading: false });
    hideBackProcessFailedDistpatcher = new AssetBackProcessFailed({ isFailed: false,errors:null });
    showBackProcessSuccessDistpatcher = new AssetBackProcessSuccess({ isSuccess: true });
    hideBackProcessSuccessDistpatcher = new AssetBackProcessSuccess({ isSuccess: false });

    @Effect()
    loadAssetsPage$ = this.actions$.pipe(
        ofType<AssetsPageRequested>(AssetActionTypes.AssetsPageRequested),
        mergeMap(( { payload } ) => {
            this.store.dispatch(this.showPageLoadingDistpatcher);
            const requestToServer = this.assetService.findAssets(payload.page);
            const lastQuery = of(payload.page);
            return forkJoin(requestToServer, lastQuery);
        }),
        map(response => {
            const result: QueryResultsModel = response[0];
            const lastQuery: QueryParamsModel = response[1];
            const pageLoadedDispatch = new AssetsPageLoaded({
                assets: result.data,
                totalCount: result.total,
                page: lastQuery
            });
            return pageLoadedDispatch;
        })
    );

    @Effect()
    updateAsset$ = this.actions$
        .pipe(
            ofType<AssetOnServerUpdated>(AssetActionTypes.AssetOnServerUpdated),
            mergeMap(( { payload } ) => {
                this.store.dispatch(this.showActionLoadingDistpatcher);
                this.store.dispatch(this.hideBackProcessFailedDistpatcher);
                this.store.dispatch(this.hideBackProcessSuccessDistpatcher);
                return this.assetService.updateAsset(payload.asset);
            }),
            tap(res => {
                if(res.status=="ok"){
                    this.store.dispatch(this.showBackProcessSuccessDistpatcher);
                }
                if(res.status=="failed"){
                    this.store.dispatch(new AssetBackProcessFailed({ isFailed: true,errors:res.errors }));
                }
            }),    
            map((res) => {
                return this.hideActionLoadingDistpatcher;
            }),
            catchError((err,caught) => {
                this.store.dispatch(new AssetBackProcessFailed({ isFailed: true,errors:null }));
                    return of(new QueryResultsModel([], err))
                }
            ),
    );
    @Effect()
    createAsset$ = this.actions$
        .pipe(
            ofType<AssetOnServerCreated>(AssetActionTypes.AssetOnServerCreated),
            mergeMap(( { payload } ) => {
                this.store.dispatch(this.showActionLoadingDistpatcher);
                return this.assetService.createAsset(payload.asset).pipe(
                    tap(res => {
                        var response:any = res;
                        if(response.status=="ok"){
                            this.store.dispatch(this.showBackProcessSuccessDistpatcher);
                            this.store.dispatch(new AssetCreated({ asset: response.asset }));
                        }
                        if(response.status=="failed"){
                            this.store.dispatch(new AssetBackProcessFailed({ isFailed: true,errors:res.errors }));
                        }
                    })
                );
            }),
            map(() => {
                return this.hideActionLoadingDistpatcher;
            }),
        );
        @Effect()
        deleteAsset$ = this.actions$
            .pipe(
                ofType<AssetOnServerDeleted>(AssetActionTypes.AssetOnServerDeleted),
                mergeMap(( { payload } ) => {
                    this.store.dispatch(this.showActionLoadingDistpatcher);
                    return this.assetService.deleteAsset(payload.id).pipe(
                        tap(res => {
                            this.store.dispatch(new OneAssetDeleted({ id: payload.id }));
                        })
                    );
                }),
                map(() => {
                    return this.hideActionLoadingDistpatcher;
                }),
            );
    

    constructor(private actions$: Actions, private assetService: AssetService, private store: Store<AppState>) { }
}
