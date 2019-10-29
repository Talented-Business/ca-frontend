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
import { EmployeesService } from '../_services/';
// State
import { AppState } from '../../reducers';
// Actions
import {
    EmployeeActionTypes,
    EmployeesPageRequested,
    EmployeesPageLoaded,
    EmployeeActionToggleLoading,
    EmployeesPageToggleLoading,
    EmployeeUpdated,
    EmployeeBackProcessSuccess,
    EmployeeBackProcessFailed,
} from '../_actions/employee.actions';
import { of } from 'rxjs';

@Injectable()
export class EmployeeEffects {
    showPageLoadingDistpatcher = new EmployeesPageToggleLoading({ isLoading: true });
    showActionLoadingDistpatcher = new EmployeeActionToggleLoading({ isLoading: true });
    hideActionLoadingDistpatcher = new EmployeeActionToggleLoading({ isLoading: false });
    hideBackProcessFailedDistpatcher = new EmployeeBackProcessFailed({ isFailed: false,errors:null });
    showBackProcessSuccessDistpatcher = new EmployeeBackProcessSuccess({ isSuccess: true });
    hideBackProcessSuccessDistpatcher = new EmployeeBackProcessSuccess({ isSuccess: false });

    @Effect()
    loadEmployeesPage$ = this.actions$.pipe(
        ofType<EmployeesPageRequested>(EmployeeActionTypes.EmployeesPageRequested),
        mergeMap(( { payload } ) => {
            this.store.dispatch(this.showPageLoadingDistpatcher);
            const requestToServer = this.employeesService.findEmployees(payload.page);
            const lastQuery = of(payload.page);
            return forkJoin(requestToServer, lastQuery);
        }),
        map(response => {
            const result: QueryResultsModel = response[0];
            const lastQuery: QueryParamsModel = response[1];
            const pageLoadedDispatch = new EmployeesPageLoaded({
                employees: result.data,
                totalCount: result.total,
                page: lastQuery
            });
            return pageLoadedDispatch;
        })
    );

    @Effect()
    updateEmployee$ = this.actions$
        .pipe(
            ofType<EmployeeUpdated>(EmployeeActionTypes.EmployeeUpdated),
            mergeMap(( { payload } ) => {
                this.store.dispatch(this.showActionLoadingDistpatcher);
                this.store.dispatch(this.hideBackProcessFailedDistpatcher);
                this.store.dispatch(this.hideBackProcessSuccessDistpatcher);
                return this.employeesService.updateEmployee(payload.employee);
            }),
            tap(res => {
                if(res.status=="ok"){
                    this.store.dispatch(this.showBackProcessSuccessDistpatcher);
                }
                if(res.status=="failed"){
                    this.store.dispatch(new EmployeeBackProcessFailed({ isFailed: true,errors:res.errors }));
                }
            }),    
            map(() => {
                return this.hideActionLoadingDistpatcher;
            }),
            catchError((err,caught) => {
                this.store.dispatch(new EmployeeBackProcessFailed({ isFailed: true,errors:[] }));
                    return of(new QueryResultsModel([], err))
                }
            ),

        );


    constructor(private actions$: Actions, private employeesService: EmployeesService, private store: Store<AppState>) { }
}
