// NGRX
import { createFeatureSelector, createSelector } from '@ngrx/store';
// Lodash
import { each } from 'lodash';
// CRUD
import { QueryResultsModel, HttpExtenstionsModel } from '../../_base/crud';
// State
import { ContractsState } from '../_reducers/contract.reducers';
import { ContractModel } from '../_models/contract.model';

export const selectContractsState = createFeatureSelector<ContractsState>('contracts');

export const selectContractById = (contractId: number) => createSelector(
    selectContractsState,
    contractsState => contractsState.entities[contractId]
);

export const selectContractsPageLoading = createSelector(
    selectContractsState,
    contractsState => contractsState.listLoading
);

export const selectContractsActionLoading = createSelector(
    selectContractsState,
    contractsState => contractsState.actionsloading
);

export const selectContractsBackProcessingFailed = createSelector(
    selectContractsState,
    contractsState => contractsState.backProcessFailed
);

export const selectContractsBackProcessingSuccess = createSelector(
    selectContractsState,
    contractsState => contractsState.backProcessSuccess
);

export const selectLastCreatedContractId = createSelector(
    selectContractsState,
    contractsState => contractsState.lastCreatedContractId
);

export const selectContractsShowInitWaitingMessage = createSelector(
    selectContractsState,
    contractsState => contractsState.showInitWaitingMessage
);

export const selectContractsInStore = createSelector(
    selectContractsState,
    contractsState => {
        const items: ContractModel[] = [];
        each(contractsState.entities, element => {
            items.push(element);
        });
        const httpExtension = new HttpExtenstionsModel();
        const result: ContractModel[] = httpExtension.sortArray(items, contractsState.lastQuery.sortField, contractsState.lastQuery.sortOrder);
        return new QueryResultsModel(result, contractsState.totalCount, '');
    }
);
