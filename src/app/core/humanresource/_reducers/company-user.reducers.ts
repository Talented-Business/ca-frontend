// NGRX
import { createFeatureSelector } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter, Update } from '@ngrx/entity';
// Actions
import { CompanyUserActions, CompanyUserActionTypes } from '../_actions/company-user.actions';
// Models
import { CompanyUserModel } from '../_models/company-user.model';
import { QueryParamsModel } from '../../_base/crud';

export interface CompanyUsersState extends EntityState<CompanyUserModel> {
    listLoading: boolean;
    backProcessFailed:boolean;
    backProcessSuccess:boolean;
    actionsloading: boolean;
    totalCount: number;
    errors:any;
    lastCreatedCompanyUserId: number;
    lastQuery: QueryParamsModel;
    showInitWaitingMessage: boolean;
}

export const adapter: EntityAdapter<CompanyUserModel> = createEntityAdapter<CompanyUserModel>();

export const initialCompanyUsersState: CompanyUsersState = adapter.getInitialState({
    companyUserForEdit: null,
    listLoading: false,
    backProcessFailed:false,
    backProcessSuccess:false,
    actionsloading: false,
    totalCount: 0,
    errors:null,
    lastCreatedCompanyUserId: undefined,
    lastQuery: new QueryParamsModel({}),
    showInitWaitingMessage: true
});

export function companyUsersReducer(state = initialCompanyUsersState, action: CompanyUserActions): CompanyUsersState {
    switch  (action.type) {
        case CompanyUserActionTypes.CompanyUsersPageToggleLoading: {
            return {
                ...state, listLoading: action.payload.isLoading, lastCreatedCompanyUserId: undefined
            };
        }
        case CompanyUserActionTypes.CompanyUserActionToggleLoading: {
            return {
                ...state, actionsloading: action.payload.isLoading
            };
        }
        case CompanyUserActionTypes.CompanyUserOnServerCreated: return {
            ...state
        };
        case CompanyUserActionTypes.CompanyUserCreated: return adapter.addOne(action.payload.companyUser, {
            ...state, lastCreatedCompanyUserId: action.payload.companyUser.id
        });
        case CompanyUserActionTypes.CompanyUserUpdated: return adapter.updateOne(action.payload.partialCompanyUser, state);
        case CompanyUserActionTypes.OneCompanyUserDeleted: return adapter.removeOne(action.payload.id, state);
        case CompanyUserActionTypes.ManyCompanyUsersDeleted: return adapter.removeMany(action.payload.ids, state);
        case CompanyUserActionTypes.CompanyUsersPageCancelled: {
            return {
                ...state, listLoading: false, lastQuery: new QueryParamsModel({})
            };
        }
        case CompanyUserActionTypes.CompanyUsersPageLoaded: {
            return adapter.addMany(action.payload.companyUsers, {
                ...initialCompanyUsersState,
                totalCount: action.payload.totalCount,
                listLoading: false,
                lastQuery: action.payload.page,
                showInitWaitingMessage: false
            });
        }
        case CompanyUserActionTypes.CompanyUserBackProcessFailed:{
            return {
                ...state,backProcessFailed:action.payload.isFailed,errors:action.payload.errors
            }
        }
        case CompanyUserActionTypes.CompanyUserBackProcessSuccess:{
            return {
                ...state,backProcessSuccess:action.payload.isSuccess
            }
        }
        default: return state;
    }
}

export const getCompanyUserState = createFeatureSelector<CompanyUserModel>('companyUsers');

export const {
    selectAll,
    selectEntities,
    selectIds,
    selectTotal
} = adapter.getSelectors();
