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
import { ContractService } from '../_services/';
// State
import { AppState } from '../../reducers';
// Actions
import {
    ContractActionTypes,
    ContractsPageRequested,
    ContractsPageLoaded,
    ContractActionToggleLoading,
    ContractsPageToggleLoading,
    ContractCreated,
    ContractUpdated,
    ContractBackProcessFailed,
    ContractBackProcessSuccess,
    ContractOnServerCreated
} from '../_actions/contract.actions';
import { of } from 'rxjs';

@Injectable()
export class ContractEffects {
    showPageLoadingDistpatcher = new ContractsPageToggleLoading({ isLoading: true });
    showActionLoadingDistpatcher = new ContractActionToggleLoading({ isLoading: true });
    hideActionLoadingDistpatcher = new ContractActionToggleLoading({ isLoading: false });
    showBackProcessFailedDistpatcher = new ContractBackProcessFailed({ isFailed: true });
    hideBackProcessFailedDistpatcher = new ContractBackProcessFailed({ isFailed: false });
    showBackProcessSuccessDistpatcher = new ContractBackProcessSuccess({ isSuccess: true });
    hideBackProcessSuccessDistpatcher = new ContractBackProcessSuccess({ isSuccess: false });

    @Effect()
    loadContractsPage$ = this.actions$.pipe(
        ofType<ContractsPageRequested>(ContractActionTypes.ContractsPageRequested),
        mergeMap(( { payload } ) => {
            this.store.dispatch(this.showPageLoadingDistpatcher);
            const requestToServer = this.contractService.findContracts(payload.page);
            const lastQuery = of(payload.page);
            return forkJoin(requestToServer, lastQuery);
        }),
        map(response => {
            const result: QueryResultsModel = response[0];
            const lastQuery: QueryParamsModel = response[1];
            const pageLoadedDispatch = new ContractsPageLoaded({
                contracts: result.data,
                totalCount: result.total,
                page: lastQuery
            });
            return pageLoadedDispatch;
        })
    );

    @Effect()
    updateContract$ = this.actions$
        .pipe(
            ofType<ContractUpdated>(ContractActionTypes.ContractUpdated),
            mergeMap(( { payload } ) => {
                this.store.dispatch(this.showActionLoadingDistpatcher);
                this.store.dispatch(this.hideBackProcessFailedDistpatcher);
                this.store.dispatch(this.hideBackProcessSuccessDistpatcher);
                return this.contractService.updateContract(payload.contract);
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
    @Effect()
    createContract$ = this.actions$
        .pipe(
            ofType<ContractOnServerCreated>(ContractActionTypes.ContractOnServerCreated),
            mergeMap(( { payload } ) => {
                this.store.dispatch(this.showActionLoadingDistpatcher);
                return this.contractService.createContract(payload.contract).pipe(
                    tap(res => {
                        this.store.dispatch(new ContractCreated({ contract: res }));
                    })
                );
            }),
            map(() => {
                return this.hideActionLoadingDistpatcher;
            }),
        );


    constructor(private actions$: Actions, private contractService: ContractService, private store: Store<AppState>) { }
}
