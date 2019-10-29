import { AttributeModel } from './../_models/attribute.model';

// NGRX
import { createFeatureSelector, createSelector } from '@ngrx/store';
// CRUD
import { QueryResultsModel, HttpExtenstionsModel } from '../../_base/crud';
// State
import { AttributesState } from '../_reducers/attribute.reducers';
import * as fromAttribute from '../_reducers/attribute.reducers';
import { each } from 'lodash';

export const selectAttributesState = createFeatureSelector<AttributesState>('attributes');

export const selectAttributeById = (attributeId: number) => createSelector(
    selectAttributesState,
    attributesState => attributesState.entities[attributeId]
);

export const selectAllAttributes = createSelector(
    selectAttributesState,
    fromAttribute.selectAll
);

export const selectAllAttributesIds = createSelector(
    selectAttributesState,
    fromAttribute.selectIds
);

export const allAttributesLoaded = createSelector(
    selectAttributesState,
    attributesState => attributesState.isAllAttributesLoaded
);


export const selectAttributesPageLoading = createSelector(
    selectAttributesState,
    attributesState => attributesState.listLoading
);

export const selectAttributesActionLoading = createSelector(
    selectAttributesState,
    attributesState => attributesState.actionsloading
);

export const selectLastCreatedAttributeId = createSelector(
    selectAttributesState,
    attributesState => attributesState.lastCreatedAttributeId
);

export const selectAttributesShowInitWaitingMessage = createSelector(
    selectAttributesState,
    attributesState => attributesState.showInitWaitingMessage
);


export const selectQueryResult = createSelector(
    selectAttributesState,
    attributesState => {
        const items: AttributeModel[] = [];
        each(attributesState.entities, element => {
            items.push(element);
        });
        return new QueryResultsModel(items);
    }
);
