// NGRX
import { createFeatureSelector, createSelector } from '@ngrx/store';
// Lodash
import { each } from 'lodash';
// CRUD
import { QueryResultsModel, HttpExtenstionsModel } from '../../_base/crud';
// State
import { ProposalsState } from '../_reducers/proposal.reducers';
import { ProposalModel } from '../_models/proposal.model';

export const selectProposalsState = createFeatureSelector<ProposalsState>('proposals');

export const selectProposalById = (proposalId: number) => createSelector(
    selectProposalsState,
    proposalsState => proposalsState.entities[proposalId]
);

export const selectProposalsPageLoading = createSelector(
    selectProposalsState,
    proposalsState => proposalsState.listLoading
);

export const selectProposalsActionLoading = createSelector(
    selectProposalsState,
    proposalsState => proposalsState.actionsloading
);

export const selectProposalsBackProcessingFailed = createSelector(
    selectProposalsState,
    proposalsState => proposalsState.errors
);

export const selectProposalsBackProcessingSuccess = createSelector(
    selectProposalsState,
    proposalsState => proposalsState.backProcessSuccess
);

export const selectLastCreatedProposalId = createSelector(
    selectProposalsState,
    proposalsState => proposalsState.lastCreatedProposalId
);

export const selectProposalsShowInitWaitingMessage = createSelector(
    selectProposalsState,
    proposalsState => proposalsState.showInitWaitingMessage
);

export const selectProposalsInStore = createSelector(
    selectProposalsState,
    proposalsState => {
        const items: ProposalModel[] = [];
        each(proposalsState.entities, element => {
            items.push(element);
        });
        const httpExtension = new HttpExtenstionsModel();
        const result: ProposalModel[] = httpExtension.sortArray(items, proposalsState.lastQuery.sortField, proposalsState.lastQuery.sortOrder);
        return new QueryResultsModel(result, proposalsState.totalCount, '');
    }
);
