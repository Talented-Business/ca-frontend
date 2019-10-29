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
import { AttributeService } from '../_services';
// State
import { AppState } from '../../reducers';
// Selectors
import { allAttributesLoaded } from '../_selectors/attribute.selectors';
// Actions
import {
    AllAttributesLoaded,
    AllAttributesRequested,
    AttributeActionTypes,
    AttributeOnServerUpdated,
    AttributeUpdated,
    AttributeDeleted,
    AttributeOnServerCreated,
    AttributeCreated,
    AttributeActionToggleLoading,
} from '../_actions/attribute.actions';

@Injectable()
export class AttributeEffects {
    showActionLoadingDistpatcher = new AttributeActionToggleLoading({ isLoading: true });
    hideActionLoadingDistpatcher = new AttributeActionToggleLoading({ isLoading: false });
    @Effect()
    loadAllAttributes$ = this.actions$
        .pipe(
            ofType<AllAttributesRequested>(AttributeActionTypes.AllAttributesRequested),
            withLatestFrom(this.store.pipe(select(allAttributesLoaded))),
            filter(([action, isAllAttributesLoaded]) => !isAllAttributesLoaded),
            mergeMap(() => this.attributeService.getAllAttributes()),
            map(attributes => {
                return new AllAttributesLoaded({attributes});
            })
          );
    @Effect()
    updateAttribute$ = this.actions$
        .pipe(
            ofType<AttributeOnServerUpdated>(AttributeActionTypes.AttributeOnServerUpdated),
            mergeMap(( { payload } ) => {
                this.store.dispatch(this.showActionLoadingDistpatcher);
                return this.attributeService.updateAttribute(payload.attribute);
            }),
            map((res) => {
                return this.hideActionLoadingDistpatcher;
            })
    );
    @Effect()
    createAttribute$ = this.actions$
        .pipe(
            ofType<AttributeOnServerCreated>(AttributeActionTypes.AttributeOnServerCreated),
            mergeMap(( { payload } ) => {
                this.store.dispatch(this.showActionLoadingDistpatcher);
                return this.attributeService.createAttribute(payload.attribute).pipe(
                    tap(res => {
                        this.store.dispatch(new AttributeCreated({ attribute: res }));
                    })
                );
            }),
            map(() => {
                return this.hideActionLoadingDistpatcher;
            }),
        );
    @Effect()
    init$: Observable<Action> = defer(() => {
        return of(new AllAttributesRequested());
    });

    constructor(private actions$: Actions, private attributeService: AttributeService, private store: Store<AppState>) { }
}
