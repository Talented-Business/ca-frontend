// Angular
import { Injectable } from '@angular/core';
// RxJS
import { of, Observable, defer, forkJoin } from 'rxjs';
import { mergeMap, map, withLatestFrom, filter, tap } from 'rxjs/operators';
// NGRX
import { Effect, Actions, ofType } from '@ngrx/effects';
import { Store, select, Action } from '@ngrx/store';
// CRUD
import { QueryResultsModel, QueryParamsModel } from '../../_base/crud';
// Services
import { DepartmentService } from '../_services';
// State
import { AppState } from '../../reducers';
// Selectors
import { allDepartmentsLoaded } from '../_selectors/department.selectors';
// Actions
import {
    AllDepartmentsLoaded,
    AllDepartmentsRequested,
    DepartmentActionTypes,
    DepartmentOnServerUpdated,
    DepartmentDeleted,
    DepartmentOnServerCreated,
    DepartmentCreated,
    DepartmentActionToggleLoading,
} from '../_actions/department.actions';

@Injectable()
export class DepartmentEffects {
    showActionLoadingDistpatcher = new DepartmentActionToggleLoading({ isLoading: true });
    hideActionLoadingDistpatcher = new DepartmentActionToggleLoading({ isLoading: false });

    @Effect()
    loadAllDepartments$ = this.actions$
        .pipe(
            ofType<AllDepartmentsRequested>(DepartmentActionTypes.AllDepartmentsRequested),
            withLatestFrom(this.store.pipe(select(allDepartmentsLoaded))),
            filter(([action, isAllDepartmentsLoaded]) => !isAllDepartmentsLoaded),
            mergeMap(() => this.departmentService.getAllDepartments()),
            map(departments => {
                return new AllDepartmentsLoaded({departments});
            })
          );
    @Effect()
    updateDepartment$ = this.actions$
        .pipe(
            ofType<DepartmentOnServerUpdated>(DepartmentActionTypes.DepartmentOnServerUpdated),
            mergeMap(( { payload } ) => {
                this.store.dispatch(this.showActionLoadingDistpatcher);
                return this.departmentService.updateDepartment(payload.department);
            }),
            map((res) => {
                return this.hideActionLoadingDistpatcher;
            })
    );
    @Effect()
    createDepartment$ = this.actions$
        .pipe(
            ofType<DepartmentOnServerCreated>(DepartmentActionTypes.DepartmentOnServerCreated),
            mergeMap(( { payload } ) => {
                this.store.dispatch(this.showActionLoadingDistpatcher);
                return this.departmentService.createDepartment(payload.department).pipe(
                    tap(res => {
                        this.store.dispatch(new DepartmentCreated({ department: res }));
                    })
                );
            }),
            map(() => {
                return this.hideActionLoadingDistpatcher;
            }),
        );
      
    @Effect()
    init$: Observable<Action> = defer(() => {
        return of(new AllDepartmentsRequested());
    });

    constructor(private actions$: Actions, private departmentService: DepartmentService, private store: Store<AppState>) { }
}
