// NGRX
import { createFeatureSelector } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter, Update } from '@ngrx/entity';
// Actions
import { CompanyActions, CompanyActionTypes } from '../_actions/company.actions';
// Models
import { CompanyModel } from '../_models/company.model';
import { QueryParamsModel } from '../../_base/crud';

export interface CompaniesState extends EntityState<CompanyModel> {
    listLoading: boolean;
    backProcessFailed:boolean;
    backProcessSuccess:boolean;
    actionsloading: boolean;
    totalCount: number;
    lastCreatedCompanyId: number;
    lastQuery: QueryParamsModel;
    showInitWaitingMessage: boolean;
}

export const adapter: EntityAdapter<CompanyModel> = createEntityAdapter<CompanyModel>();

export const initialCompaniesState: CompaniesState = adapter.getInitialState({
    companyForEdit: null,
    listLoading: false,
    backProcessFailed:false,
    backProcessSuccess:false,
    actionsloading: false,
    totalCount: 0,
    lastCreatedCompanyId: undefined,
    lastQuery: new QueryParamsModel({}),
    showInitWaitingMessage: true
});

export function companiesReducer(state = initialCompaniesState, action: CompanyActions): CompaniesState {
    switch  (action.type) {
        case CompanyActionTypes.CompaniesPageToggleLoading: {
            return {
                ...state, listLoading: action.payload.isLoading, lastCreatedCompanyId: undefined
            };
        }
        case CompanyActionTypes.CompanyActionToggleLoading: {
            return {
                ...state, actionsloading: action.payload.isLoading
            };
        }
        case CompanyActionTypes.CompanyCreated: return adapter.addOne(action.payload.company, {
            ...state, lastCreatedCompanyId: action.payload.company.id
        });
        case CompanyActionTypes.CompanyUpdated: return adapter.updateOne(action.payload.partialCompany, state);
        case CompanyActionTypes.OneCompanyDeleted: return adapter.removeOne(action.payload.id, state);
        case CompanyActionTypes.ManyCompaniesDeleted: return adapter.removeMany(action.payload.ids, state);
        case CompanyActionTypes.CompaniesPageCancelled: {
            return {
                ...state, listLoading: false, lastQuery: new QueryParamsModel({})
            };
        }
        case CompanyActionTypes.CompaniesPageLoaded: {
            return adapter.addMany(action.payload.companies, {
                ...initialCompaniesState,
                totalCount: action.payload.totalCount,
                listLoading: false,
                lastQuery: action.payload.page,
                showInitWaitingMessage: false
            });
        }
        case CompanyActionTypes.CompanyBackProcessFailed:{
            return {
                ...state,backProcessFailed:action.payload.isFailed
            }
        }
        case CompanyActionTypes.CompanyBackProcessSuccess:{
            return {
                ...state,backProcessSuccess:action.payload.isSuccess
            }
        }
        default: return state;
    }
}

export const getCompanyState = createFeatureSelector<CompanyModel>('companies');

export const {
    selectAll,
    selectEntities,
    selectIds,
    selectTotal
} = adapter.getSelectors();
