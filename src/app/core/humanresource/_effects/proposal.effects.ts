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
import { ProposalService } from '../_services/';
// State
import { AppState } from '../../reducers';
// Actions
import {
    ProposalActionTypes,
    ProposalsPageRequested,
    ProposalsPageLoaded,
    ProposalActionToggleLoading,
    ProposalsPageToggleLoading,
    ProposalCreated,
    ProposalUpdated,
    ProposalOnServerUpdated,
    ProposalBackProcessFailed,
    ProposalBackProcessSuccess,
    ProposalOnServerCreated
} from '../_actions/proposal.actions';
import { of } from 'rxjs';

@Injectable()
export class ProposalEffects {
    showPageLoadingDistpatcher = new ProposalsPageToggleLoading({ isLoading: true });
    showActionLoadingDistpatcher = new ProposalActionToggleLoading({ isLoading: true });
    hideActionLoadingDistpatcher = new ProposalActionToggleLoading({ isLoading: false });
    hideBackProcessFailedDistpatcher = new ProposalBackProcessFailed({ isFailed: false,errors:null });
    showBackProcessSuccessDistpatcher = new ProposalBackProcessSuccess({ isSuccess: true });
    hideBackProcessSuccessDistpatcher = new ProposalBackProcessSuccess({ isSuccess: false });

    @Effect()
    loadProposalsPage$ = this.actions$.pipe(
        ofType<ProposalsPageRequested>(ProposalActionTypes.ProposalsPageRequested),
        mergeMap(( { payload } ) => {
            this.store.dispatch(this.showPageLoadingDistpatcher);
            const requestToServer = this.proposalService.findProposals(payload.page);
            const lastQuery = of(payload.page);
            return forkJoin(requestToServer, lastQuery);
        }),
        map(response => {
            const result: QueryResultsModel = response[0];
            const lastQuery: QueryParamsModel = response[1];
            const pageLoadedDispatch = new ProposalsPageLoaded({
                proposals: result.data,
                totalCount: result.total,
                page: lastQuery
            });
            return pageLoadedDispatch;
        })
    );

    @Effect()
    updateProposal$ = this.actions$
        .pipe(
            ofType<ProposalOnServerUpdated>(ProposalActionTypes.ProposalOnServerUpdated),
            mergeMap(( { payload } ) => {
                this.store.dispatch(this.showActionLoadingDistpatcher);
                this.store.dispatch(this.hideBackProcessFailedDistpatcher);
                this.store.dispatch(this.hideBackProcessSuccessDistpatcher);
                return this.proposalService.updateProposal(payload.proposal);
            }),
            tap(res => {
                if(res.status=="ok"){
                    this.store.dispatch(this.showBackProcessSuccessDistpatcher);
                }
                if(res.status=="failed"){
                    this.store.dispatch(new ProposalBackProcessFailed({ isFailed: true,errors:res.errors }));
                }
            }),    
            map((res) => {
                return this.hideActionLoadingDistpatcher;
            }),
            catchError((err,caught) => {
                this.store.dispatch(new ProposalBackProcessFailed({ isFailed: true,errors:null }));
                    return of(new QueryResultsModel([], err))
                }
            ),
    );
    @Effect()
    createProposal$ = this.actions$
        .pipe(
            ofType<ProposalOnServerCreated>(ProposalActionTypes.ProposalOnServerCreated),
            mergeMap(( { payload } ) => {
                this.store.dispatch(this.showActionLoadingDistpatcher);
                return this.proposalService.createProposal(payload.proposal).pipe(
                    tap(res => {
                        var response:any = res;
                        if(response.status=="ok"){
                            this.store.dispatch(this.showBackProcessSuccessDistpatcher);
                            this.store.dispatch(new ProposalCreated({ proposal: response.proposal }));
                        }
                        if(response.status=="failed"){
                            this.store.dispatch(new ProposalBackProcessFailed({ isFailed: true,errors:res.errors }));
                        }
                    })
                );
            }),
            map(() => {
                return this.hideActionLoadingDistpatcher;
            }),
        );


    constructor(private actions$: Actions, private proposalService: ProposalService, private store: Store<AppState>) { }
}
