// NGRX
import { createFeatureSelector } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter, Update } from '@ngrx/entity';
// Actions
import { ProposalActions, ProposalActionTypes } from '../_actions/proposal.actions';
// Models
import { ProposalModel } from '../_models/proposal.model';
import { QueryParamsModel } from '../../_base/crud';

export interface ProposalsState extends EntityState<ProposalModel> {
    listLoading: boolean;
    backProcessFailed:boolean;
    backProcessSuccess:boolean;
    actionsloading: boolean;
    totalCount: number;
    errors:any;
    lastCreatedProposalId: number;
    lastQuery: QueryParamsModel;
    showInitWaitingMessage: boolean;
}

export const adapter: EntityAdapter<ProposalModel> = createEntityAdapter<ProposalModel>();

export const initialProposalsState: ProposalsState = adapter.getInitialState({
    proposalForEdit: null,
    listLoading: false,
    backProcessFailed:false,
    backProcessSuccess:false,
    actionsloading: false,
    totalCount: 0,
    errors:null,
    lastCreatedProposalId: undefined,
    lastQuery: new QueryParamsModel({}),
    showInitWaitingMessage: true
});

export function proposalsReducer(state = initialProposalsState, action: ProposalActions): ProposalsState {
    switch  (action.type) {
        case ProposalActionTypes.ProposalsPageToggleLoading: {
            return {
                ...state, listLoading: action.payload.isLoading, lastCreatedProposalId: undefined
            };
        }
        case ProposalActionTypes.ProposalActionToggleLoading: {
            return {
                ...state, actionsloading: action.payload.isLoading
            };
        }
        case ProposalActionTypes.ProposalOnServerCreated: return {
            ...state
        };
        case ProposalActionTypes.ProposalCreated: return adapter.addOne(action.payload.proposal, {
            ...state, lastCreatedProposalId: action.payload.proposal.id
        });
        case ProposalActionTypes.ProposalUpdated: return adapter.updateOne(action.payload.partialProposal, state);
        case ProposalActionTypes.OneProposalDeleted: return adapter.removeOne(action.payload.id, state);
        case ProposalActionTypes.ManyProposalsDeleted: return adapter.removeMany(action.payload.ids, state);
        case ProposalActionTypes.ProposalsPageCancelled: {
            return {
                ...state, listLoading: false, lastQuery: new QueryParamsModel({})
            };
        }
        case ProposalActionTypes.ProposalsPageLoaded: {
            return adapter.addMany(action.payload.proposals, {
                ...initialProposalsState,
                totalCount: action.payload.totalCount,
                listLoading: false,
                lastQuery: action.payload.page,
                showInitWaitingMessage: false
            });
        }
        case ProposalActionTypes.ProposalBackProcessFailed:{
            return {
                ...state,backProcessFailed:action.payload.isFailed,errors:action.payload.errors
            }
        }
        case ProposalActionTypes.ProposalBackProcessSuccess:{
            return {
                ...state,backProcessSuccess:action.payload.isSuccess
            }
        }
        default: return state;
    }
}

export const getProposalState = createFeatureSelector<ProposalModel>('proposals');

export const {
    selectAll,
    selectEntities,
    selectIds,
    selectTotal
} = adapter.getSelectors();
