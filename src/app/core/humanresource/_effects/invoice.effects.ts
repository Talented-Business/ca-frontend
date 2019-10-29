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
import { InvoiceService } from '../_services/';
// State
import { AppState } from '../../reducers';
// Actions
import {
    InvoiceActionTypes,
    InvoicesPageRequested,
    InvoicesPageLoaded,
    InvoiceActionToggleLoading,
    InvoicesPageToggleLoading,
    InvoiceCreated,
    InvoiceUpdated,
    InvoiceOnServerUpdated,
    InvoiceBackProcessFailed,
    InvoiceBackProcessSuccess,
    InvoiceOnServerCreated
} from '../_actions/invoice.actions';
import { of } from 'rxjs';

@Injectable()
export class InvoiceEffects {
    showPageLoadingDistpatcher = new InvoicesPageToggleLoading({ isLoading: true });
    showActionLoadingDistpatcher = new InvoiceActionToggleLoading({ isLoading: true });
    hideActionLoadingDistpatcher = new InvoiceActionToggleLoading({ isLoading: false });
    hideBackProcessFailedDistpatcher = new InvoiceBackProcessFailed({ isFailed: false,errors:null });
    showBackProcessSuccessDistpatcher = new InvoiceBackProcessSuccess({ isSuccess: true });
    hideBackProcessSuccessDistpatcher = new InvoiceBackProcessSuccess({ isSuccess: false });

    @Effect()
    loadInvoicesPage$ = this.actions$.pipe(
        ofType<InvoicesPageRequested>(InvoiceActionTypes.InvoicesPageRequested),
        mergeMap(( { payload } ) => {
            this.store.dispatch(this.showPageLoadingDistpatcher);
            const requestToServer = this.invoiceService.findInvoices(payload.page);
            const lastQuery = of(payload.page);
            return forkJoin(requestToServer, lastQuery);
        }),
        map(response => {
            const result: QueryResultsModel = response[0];
            const lastQuery: QueryParamsModel = response[1];
            const pageLoadedDispatch = new InvoicesPageLoaded({
                invoices: result.data,
                totalCount: result.total,
                page: lastQuery
            });
            return pageLoadedDispatch;
        })
    );

    @Effect()
    updateInvoice$ = this.actions$
        .pipe(
            ofType<InvoiceOnServerUpdated>(InvoiceActionTypes.InvoiceOnServerUpdated),
            mergeMap(( { payload } ) => {
                this.store.dispatch(this.showActionLoadingDistpatcher);
                this.store.dispatch(this.hideBackProcessFailedDistpatcher);
                this.store.dispatch(this.hideBackProcessSuccessDistpatcher);
                return this.invoiceService.updateInvoice(payload.invoice);
            }),
            tap(res => {
                if(res.status=="ok"){
                    this.store.dispatch(this.showBackProcessSuccessDistpatcher);
                }
                if(res.status=="failed"){
                    this.store.dispatch(new InvoiceBackProcessFailed({ isFailed: true,errors:res.errors }));
                }
            }),    
            map((res) => {
                return this.hideActionLoadingDistpatcher;
            }),
            catchError((err,caught) => {
                this.store.dispatch(new InvoiceBackProcessFailed({ isFailed: true,errors:null }));
                    return of(new QueryResultsModel([], err))
                }
            ),
    );
    @Effect()
    createInvoice$ = this.actions$
        .pipe(
            ofType<InvoiceOnServerCreated>(InvoiceActionTypes.InvoiceOnServerCreated),
            mergeMap(( { payload } ) => {
                this.store.dispatch(this.showActionLoadingDistpatcher);
                return this.invoiceService.createInvoice(payload.invoice).pipe(
                    tap(res => {
                        var response:any = res;
                        if(response.status=="ok"){
                            this.store.dispatch(this.showBackProcessSuccessDistpatcher);
                            this.store.dispatch(new InvoiceCreated({ invoice: response.invoice }));
                        }
                        if(response.status=="failed"){
                            this.store.dispatch(new InvoiceBackProcessFailed({ isFailed: true,errors:res.errors }));
                        }
                    })
                );
            }),
            map(() => {
                return this.hideActionLoadingDistpatcher;
            }),
        );


    constructor(private actions$: Actions, private invoiceService: InvoiceService, private store: Store<AppState>) { }
}
