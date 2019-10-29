// NGRX
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
// Actions
import { AttributeActions, AttributeActionTypes } from '../_actions/attribute.actions';
// Models
import { AttributeModel } from '../_models/attribute.model';
import { QueryParamsModel } from '../../_base/crud';

export interface AttributesState extends EntityState<AttributeModel> {
    isAllAttributesLoaded: boolean;
    queryRowsCount: number;
    queryResult: AttributeModel[];
    lastCreatedAttributeId: number;
    listLoading: boolean;
    actionsloading: boolean;
    lastQuery: QueryParamsModel;
    showInitWaitingMessage: boolean;
}

export const adapter: EntityAdapter<AttributeModel> = createEntityAdapter<AttributeModel>();

export const initialAttributesState: AttributesState = adapter.getInitialState({
    isAllAttributesLoaded: false,
    queryRowsCount: 0,
    queryResult: [],
    lastCreatedAttributeId: undefined,
    listLoading: false,
    actionsloading: false,
    lastQuery: new QueryParamsModel({}),
    showInitWaitingMessage: true
});

export function attributesReducer(state = initialAttributesState, action: AttributeActions): AttributesState {
    switch  (action.type) {
        case AttributeActionTypes.AttributeOnServerCreated: return {
            ...state
        };
        case AttributeActionTypes.AttributeCreated: return adapter.addOne(action.payload.attribute, {
            ...state, lastCreatedAttributeId: action.payload.attribute.id
        });
        case AttributeActionTypes.AttributeUpdated: return adapter.updateOne(action.payload.partialattribute, state);
        case AttributeActionTypes.AttributeDeleted: return adapter.removeOne(action.payload.id, state);
        case AttributeActionTypes.AllAttributesLoaded: return adapter.addAll(action.payload.attributes, {
            ...state, isAllAttributesLoaded: true
        });
        case AttributeActionTypes.AttributeActionToggleLoading: {
            return {
                ...state, actionsloading: action.payload.isLoading
            };
        }
        case AttributeActionTypes.AttributeListingChanged:return {
            ...state, isAllAttributesLoaded: false
        }
        default: return state;
    }
}

export const {
    selectAll,
    selectEntities,
    selectIds,
    selectTotal
} = adapter.getSelectors();
