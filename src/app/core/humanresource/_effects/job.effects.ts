import { QueryParamsModel } from '../../_base/crud/models/query-models/query-params.model';
import { forkJoin } from 'rxjs';
// Angular
import { Injectable } from '@angular/core';
// RxJS
import { mergeMap, map, tap, delay,catchError } from 'rxjs/operators';
// NGRX
import { Effect, Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
// CRUD
import { QueryResultsModel } from '../../_base/crud';
// Services
import { JobService } from '../_services/';
// State
import { AppState } from '../../reducers';
// Actions
import {
    JobActionTypes,
    JobsPageRequested,
    JobsPageLoaded,
    JobActionToggleLoading,
    JobsPageToggleLoading,
    JobCreated,
    JobUpdated,
    JobOnServerUpdated,
    JobBackProcessFailed,
    JobBackProcessSuccess,
    JobOnServerCreated
} from '../_actions/job.actions';
import { of } from 'rxjs';

@Injectable()
export class JobEffects {
    showPageLoadingDistpatcher = new JobsPageToggleLoading({ isLoading: true });
    showActionLoadingDistpatcher = new JobActionToggleLoading({ isLoading: true });
    hideActionLoadingDistpatcher = new JobActionToggleLoading({ isLoading: false });
    hideBackProcessFailedDistpatcher = new JobBackProcessFailed({ isFailed: false,errors:null });
    showBackProcessSuccessDistpatcher = new JobBackProcessSuccess({ isSuccess: true });
    hideBackProcessSuccessDistpatcher = new JobBackProcessSuccess({ isSuccess: false });

    @Effect()
    loadJobsPage$ = this.actions$.pipe(
        ofType<JobsPageRequested>(JobActionTypes.JobsPageRequested),
        mergeMap(( { payload } ) => {
            this.store.dispatch(this.showPageLoadingDistpatcher);
            const requestToServer = this.jobService.findJobs(payload.page);
            const lastQuery = of(payload.page);
            return forkJoin(requestToServer, lastQuery);
        }),
        map(response => {
            const result: QueryResultsModel = response[0];
            const lastQuery: QueryParamsModel = response[1];
            const pageLoadedDispatch = new JobsPageLoaded({
                jobs: result.data,
                totalCount: result.total,
                page: lastQuery
            });
            return pageLoadedDispatch;
        })
    );

    @Effect()
    updateJob$ = this.actions$
        .pipe(
            ofType<JobOnServerUpdated>(JobActionTypes.JobOnServerUpdated),
            mergeMap(( { payload } ) => {
                this.store.dispatch(this.showActionLoadingDistpatcher);
                this.store.dispatch(this.hideBackProcessFailedDistpatcher);
                this.store.dispatch(this.hideBackProcessSuccessDistpatcher);
                return this.jobService.updateJob(payload.job);
            }),
            tap(res => {
                if(res.status=="ok"){
                    this.store.dispatch(this.showBackProcessSuccessDistpatcher);
                }
                if(res.status=="failed"){
                    this.store.dispatch(new JobBackProcessFailed({ isFailed: true,errors:res.errors }));
                }
            }),    
            map((res) => {
                return this.hideActionLoadingDistpatcher;
            }),
            catchError((err,caught) => {
                this.store.dispatch(new JobBackProcessFailed({ isFailed: true,errors:null }));
                    return of(new QueryResultsModel([], err))
                }
            ),
    );
    @Effect()
    createJob$ = this.actions$
        .pipe(
            ofType<JobOnServerCreated>(JobActionTypes.JobOnServerCreated),
            mergeMap(( { payload } ) => {
                this.store.dispatch(this.showActionLoadingDistpatcher);
                return this.jobService.createJob(payload.job).pipe(
                    tap(res => {
                        var response:any = res;
                        if(response.status=="ok"){
                            this.store.dispatch(this.showBackProcessSuccessDistpatcher);
                            this.store.dispatch(new JobCreated({ job: response.job }));
                        }
                        if(response.status=="failed"){
                            this.store.dispatch(new JobBackProcessFailed({ isFailed: true,errors:res.errors }));
                        }
                    })
                );
            }),
            map(() => {
                return this.hideActionLoadingDistpatcher;
            }),
        );


    constructor(private actions$: Actions, private jobService: JobService, private store: Store<AppState>) { }
}
