// NGRX
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
// Actions
import { DepartmentActions, DepartmentActionTypes } from '../_actions/department.actions';
// Models
import { DepartmentModel } from '../_models/department.model';
import { QueryParamsModel } from '../../_base/crud';

export interface DepartmentsState extends EntityState<DepartmentModel> {
    isAllDepartmentsLoaded: boolean;
    queryRowsCount: number;
    queryResult: DepartmentModel[];
    lastCreatedDepartmentId: number;
    listLoading: boolean;
    actionsloading: boolean;
    lastQuery: QueryParamsModel;
    showInitWaitingMessage: boolean;
}

export const adapter: EntityAdapter<DepartmentModel> = createEntityAdapter<DepartmentModel>();

export const initialDepartmentsState: DepartmentsState = adapter.getInitialState({
    isAllDepartmentsLoaded: false,
    queryRowsCount: 0,
    queryResult: [],
    lastCreatedDepartmentId: undefined,
    listLoading: false,
    actionsloading: false,
    lastQuery: new QueryParamsModel({}),
    showInitWaitingMessage: true
});

export function departmentsReducer(state = initialDepartmentsState, action: DepartmentActions): DepartmentsState {
    switch  (action.type) {
        case DepartmentActionTypes.DepartmentOnServerCreated: return {
            ...state
        };
        case DepartmentActionTypes.DepartmentCreated: return adapter.addOne(action.payload.department, {
            ...state, lastCreatedDepartmentId: action.payload.department.id
        });
        case DepartmentActionTypes.DepartmentUpdated: return adapter.updateOne(action.payload.partialdepartment, state);
        case DepartmentActionTypes.DepartmentDeleted: return adapter.removeOne(action.payload.id, state);
        case DepartmentActionTypes.AllDepartmentsLoaded: return adapter.addAll(action.payload.departments, {
            ...state, isAllDepartmentsLoaded: true
        });
        case DepartmentActionTypes.DepartmentActionToggleLoading: {
            return {
                ...state, actionsloading: action.payload.isLoading
            };
        }
        case DepartmentActionTypes.DepartmentListingChanged:return {
            ...state, isAllDepartmentsLoaded: false
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
