// NGRX
import { createFeatureSelector } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter, Update } from '@ngrx/entity';
// Actions
import { EmployeeActions, EmployeeActionTypes } from '../_actions/employee.actions';
// Models
import { EmployeeModel } from '../_models/employee.model';
import { QueryParamsModel } from '../../_base/crud';

export interface EmployeesState extends EntityState<EmployeeModel> {
    listLoading: boolean;
    actionsloading: boolean;
    totalCount: number;
    lastCreatedEmployeeId: number;
    lastQuery: QueryParamsModel;
    errors:any,
    backProcessSuccess:boolean,
    backProcessFailed:boolean,
    showInitWaitingMessage: boolean;
}

export const adapter: EntityAdapter<EmployeeModel> = createEntityAdapter<EmployeeModel>();

export const initialEmployeesState: EmployeesState = adapter.getInitialState({
    employeeForEdit: null,
    listLoading: false,
    actionsloading: false,
    totalCount: 0,
    lastCreatedEmployeeId: undefined,
    lastQuery: new QueryParamsModel({}),
    backProcessSuccess:false,
    backProcessFailed:false,
    errors:null,
    showInitWaitingMessage: true
});

export function employeesReducer(state = initialEmployeesState, action: EmployeeActions): EmployeesState {
    switch  (action.type) {
        case EmployeeActionTypes.EmployeesPageToggleLoading: {
            return {
                ...state, listLoading: action.payload.isLoading, lastCreatedEmployeeId: undefined
            };
        }
        case EmployeeActionTypes.EmployeeActionToggleLoading: {
            return {
                ...state, actionsloading: action.payload.isLoading
            };
        }
        case EmployeeActionTypes.EmployeeCreated: return adapter.addOne(action.payload.employee, {
            ...state, lastCreatedEmployeeId: action.payload.employee.id
        });
        case EmployeeActionTypes.EmployeeUpdated: return adapter.updateOne(action.payload.partialEmployee, state);
        case EmployeeActionTypes.OneEmployeeDeleted: return adapter.removeOne(action.payload.id, state);
        case EmployeeActionTypes.ManyEmployeesDeleted: return adapter.removeMany(action.payload.ids, state);
        case EmployeeActionTypes.EmployeesPageCancelled: {
            return {
                ...state, listLoading: false, lastQuery: new QueryParamsModel({})
            };
        }
        case EmployeeActionTypes.EmployeesPageLoaded: {
            return adapter.addMany(action.payload.employees, {
                ...initialEmployeesState,
                totalCount: action.payload.totalCount,
                listLoading: false,
                lastQuery: action.payload.page,
                showInitWaitingMessage: false
            });
        }
        case EmployeeActionTypes.EmployeeBackProcessFailed:{
            return {
                ...state,backProcessFailed:action.payload.isFailed,errors:action.payload.errors
            }
        }
        case EmployeeActionTypes.EmployeeBackProcessSuccess:{
            return {
                ...state,backProcessSuccess:action.payload.isSuccess
            }
        }
        default: return state;
    }
}

export const getEmployeeState = createFeatureSelector<EmployeeModel>('employees');

export const {
    selectAll,
    selectEntities,
    selectIds,
    selectTotal
} = adapter.getSelectors();
