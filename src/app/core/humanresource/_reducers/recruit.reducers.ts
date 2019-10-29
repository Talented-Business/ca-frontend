// NGRX
import { createFeatureSelector } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter, Update } from '@ngrx/entity';
// Actions
import { RecruitActions, RecruitActionTypes } from '../_actions/recruit.actions';
// Models
import { EmployeeModel } from '../_models/employee.model';
import { QueryParamsModel } from '../../_base/crud';

export interface RecruitsState extends EntityState<EmployeeModel> {
    listLoading: boolean;
    actionsloading: boolean;
    totalCount: number;
    lastCreatedRecruitId: number;
    lastQuery: QueryParamsModel;
    showInitWaitingMessage: boolean;
}

export const adapter: EntityAdapter<EmployeeModel> = createEntityAdapter<EmployeeModel>();

export const initialRecruitsState: RecruitsState = adapter.getInitialState({
    recruitForEdit: null,
    listLoading: false,
    actionsloading: false,
    totalCount: 0,
    lastCreatedRecruitId: undefined,
    lastQuery: new QueryParamsModel({}),
    showInitWaitingMessage: true
});

export function recruitsReducer(state = initialRecruitsState, action: RecruitActions): RecruitsState {
    switch  (action.type) {
        case RecruitActionTypes.RecruitsPageToggleLoading: {
            return {
                ...state, listLoading: action.payload.isLoading, lastCreatedRecruitId: undefined
            };
        }
        case RecruitActionTypes.RecruitActionToggleLoading: {
            return {
                ...state, actionsloading: action.payload.isLoading
            };
        }
        case RecruitActionTypes.RecruitUpdated: return adapter.updateOne(action.payload.partialRecruit, state);
        case RecruitActionTypes.RecruitsStatusUpdated: {
            const _partialRecruits: Update<EmployeeModel>[] = [];
            // tslint:disable-next-line:prefer-const
            for (let i = 0; i < action.payload.recruits.length; i++) {
                _partialRecruits.push({
				    id: action.payload.recruits[i].id,
				    changes: {
                        status: action.payload.status
                    }
			    });
            }
            return adapter.updateMany(_partialRecruits, state);
        }
        case RecruitActionTypes.RecruitsPageCancelled: {
            return {
                ...state, listLoading: false, lastQuery: new QueryParamsModel({})
            };
        }
        case RecruitActionTypes.RecruitsPageLoaded: {
            return adapter.addMany(action.payload.recruits, {
                ...initialRecruitsState,
                totalCount: action.payload.totalCount,
                listLoading: false,
                lastQuery: action.payload.page,
                showInitWaitingMessage: false
            });
        }
        default: return state;
    }
}

export const getRecruitState = createFeatureSelector<EmployeeModel>('recruits');

export const {
    selectAll,
    selectEntities,
    selectIds,
    selectTotal
} = adapter.getSelectors();
