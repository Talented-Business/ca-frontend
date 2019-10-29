// NGRX
import { createFeatureSelector } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter, Update } from '@ngrx/entity';
// Actions
import { ContractActions, ContractActionTypes } from '../_actions/contract.actions';
// Models
import { ContractModel } from '../_models/contract.model';
import { QueryParamsModel } from '../../_base/crud';

export interface ContractsState extends EntityState<ContractModel> {
    listLoading: boolean;
    backProcessFailed:boolean;
    backProcessSuccess:boolean;
    actionsloading: boolean;
    totalCount: number;
    lastCreatedContractId: number;
    lastQuery: QueryParamsModel;
    showInitWaitingMessage: boolean;
}

export const adapter: EntityAdapter<ContractModel> = createEntityAdapter<ContractModel>();

export const initialContractsState: ContractsState = adapter.getInitialState({
    contractForEdit: null,
    listLoading: false,
    backProcessFailed:false,
    backProcessSuccess:false,
    actionsloading: false,
    totalCount: 0,
    lastCreatedContractId: undefined,
    lastQuery: new QueryParamsModel({}),
    showInitWaitingMessage: true
});

export function contractsReducer(state = initialContractsState, action: ContractActions): ContractsState {
    switch  (action.type) {
        case ContractActionTypes.ContractsPageToggleLoading: {
            return {
                ...state, listLoading: action.payload.isLoading, lastCreatedContractId: undefined
            };
        }
        case ContractActionTypes.ContractActionToggleLoading: {
            return {
                ...state, actionsloading: action.payload.isLoading
            };
        }
        case ContractActionTypes.ContractOnServerCreated: return {
            ...state
        };
        case ContractActionTypes.ContractCreated: return adapter.addOne(action.payload.contract, {
            ...state, lastCreatedContractId: action.payload.contract.id
        });
        case ContractActionTypes.ContractUpdated: return adapter.updateOne(action.payload.partialContract, state);
        case ContractActionTypes.OneContractDeleted: return adapter.removeOne(action.payload.id, state);
        case ContractActionTypes.ManyContractsDeleted: return adapter.removeMany(action.payload.ids, state);
        case ContractActionTypes.ContractsPageCancelled: {
            return {
                ...state, listLoading: false, lastQuery: new QueryParamsModel({})
            };
        }
        case ContractActionTypes.ContractsPageLoaded: {
            return adapter.addMany(action.payload.contracts, {
                ...initialContractsState,
                totalCount: action.payload.totalCount,
                listLoading: false,
                lastQuery: action.payload.page,
                showInitWaitingMessage: false
            });
        }
        case ContractActionTypes.ContractBackProcessFailed:{
            return {
                ...state,backProcessFailed:action.payload.isFailed
            }
        }
        case ContractActionTypes.ContractBackProcessSuccess:{
            return {
                ...state,backProcessSuccess:action.payload.isSuccess
            }
        }
        default: return state;
    }
}

export const getContractState = createFeatureSelector<ContractModel>('contracts');

export const {
    selectAll,
    selectEntities,
    selectIds,
    selectTotal
} = adapter.getSelectors();
