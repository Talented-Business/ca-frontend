// NGRX
import { Action } from '@ngrx/store';
import { Update } from '@ngrx/entity';
// CRUD
import { QueryParamsModel } from '../../_base/crud';
// Models
import { JobModel } from '../_models/job.model';

export enum JobActionTypes {
    JobOnServerCreated = '[Edit Job Component] Job On Server Created',    
    JobCreated = '[Edit Job Dialog] Job Created',
    JobOnServerUpdated = '[Edit Job Component] Job On Server Updated',    
    JobUpdated = '[Edit Job Dialog] Job Updated',
    OneJobDeleted = '[Jobs List Page] One Job Deleted',
    ManyJobsDeleted = '[Jobs List Page] Many Job Deleted',
    JobsPageRequested = '[Jobs List Page] Jobs Page Requested',
    JobsPageLoaded = '[Jobs API] Jobs Page Loaded',
    JobsPageCancelled = '[Jobs API] Jobs Page Cancelled',
    JobsPageToggleLoading = '[Jobs] Jobs Page Toggle Loading',
    JobActionToggleLoading = '[Jobs] Jobs Action Toggle Loading',
    JobBackProcessFailed = '[Jobs Back] Jobs Back Process Failed',
    JobBackProcessSuccess = '[Jobs Back] Jobs Back Process Success',
}

export class JobOnServerCreated implements Action {
    readonly type = JobActionTypes.JobOnServerCreated;
    constructor(public payload: { job: JobModel }) { }
}

export class JobCreated implements Action {
    readonly type = JobActionTypes.JobCreated;
    constructor(public payload: { job: JobModel }) { }
}

export class JobOnServerUpdated implements Action {
    readonly type = JobActionTypes.JobOnServerUpdated;
    constructor(public payload: {
        partialJob: Update<JobModel>, // For State update
        job: JobModel // For Server update (through service)
    }) { }
}

export class JobUpdated implements Action {
    readonly type = JobActionTypes.JobUpdated;
    constructor(public payload: {
        partialJob: Update<JobModel>, // For State update
        job: JobModel // For Server update (through service)
    }) { }
}

export class OneJobDeleted implements Action {
    readonly type = JobActionTypes.OneJobDeleted;
    constructor(public payload: { id: number }) {}
}

export class ManyJobsDeleted implements Action {
    readonly type = JobActionTypes.ManyJobsDeleted;
    constructor(public payload: { ids: number[] }) {}
}

export class JobsPageRequested implements Action {
    readonly type = JobActionTypes.JobsPageRequested;
    constructor(public payload: { page: QueryParamsModel }) { }
}

export class JobsPageLoaded implements Action {
    readonly type = JobActionTypes.JobsPageLoaded;
    constructor(public payload: { jobs: JobModel[], totalCount: number, page: QueryParamsModel }) { }
}

export class JobsPageCancelled implements Action {
    readonly type = JobActionTypes.JobsPageCancelled;
}

export class JobsPageToggleLoading implements Action {
    readonly type = JobActionTypes.JobsPageToggleLoading;
    constructor(public payload: { isLoading: boolean }) { }
}

export class JobActionToggleLoading implements Action {
    readonly type = JobActionTypes.JobActionToggleLoading;
    constructor(public payload: { isLoading: boolean }) { }
}
export class JobBackProcessFailed implements Action {
    readonly type = JobActionTypes.JobBackProcessFailed;
    constructor(public payload: { isFailed: boolean;errors:any }) { }
}
export class JobBackProcessSuccess implements Action {
    readonly type = JobActionTypes.JobBackProcessSuccess;
    constructor(public payload: { isSuccess: boolean }) { }
}

export type JobActions = JobOnServerCreated
| JobCreated
| JobOnServerUpdated
| JobUpdated
| OneJobDeleted
| ManyJobsDeleted
| JobsPageRequested
| JobsPageLoaded
| JobsPageCancelled
| JobsPageToggleLoading
| JobActionToggleLoading
| JobBackProcessSuccess
| JobBackProcessFailed;
