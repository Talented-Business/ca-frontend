// Angular
import { Injectable } from '@angular/core';
import { HttpClient,HttpParams } from '@angular/common/http';
// RxJS
import { Observable, BehaviorSubject } from 'rxjs';
// CRUD
import { HttpUtilsService, QueryParamsModel, QueryResultsModel } from '../../_base/crud';
// Models
import { JobModel } from '../_models/job.model';
import { environment } from '../../../../environments/environment';
const API_COMPANIES_URL = environment.host_url+'api/jobs';
// Real REST API
@Injectable()
export class JobService {
	lastFilter$: BehaviorSubject<QueryParamsModel> = new BehaviorSubject(new QueryParamsModel({}, 'asc', '', 0, 10));

	constructor(private http: HttpClient,
		private httpUtils: HttpUtilsService) { }

	// CREATE =>  POST: add a new job to the server
	createJob(job): Observable<JobModel> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.post<JobModel>(API_COMPANIES_URL, job,{
			headers: httpHeaders,
		});
	}
	toggleStatus(id):Observable<JobModel[]> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.get<JobModel[]>(API_COMPANIES_URL+'/'+id+'/updateStatus',{headers: httpHeaders});
	}
	// READ
	getAllJobs(): Observable<JobModel[]> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.get<JobModel[]>(API_COMPANIES_URL,{headers: httpHeaders});
	}

	getJobById(jobId: number): Observable<JobModel> {
		return this.http.get<JobModel>(API_COMPANIES_URL + `/${jobId}`);
	}

	// Server should return filtered/sorted result
	findJobs(queryParams: QueryParamsModel): Observable<QueryResultsModel> {
		// Note: Add headers if needed (tokens/bearer)
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const httpParams = this.httpUtils.getFindHTTPParams(queryParams);
		return this.http.get<QueryResultsModel>(API_COMPANIES_URL, {
			headers: httpHeaders,
			params:  httpParams
		});
	}

	// UPDATE => PUT: update the job on the server
	updateJob(job: JobModel): Observable<any> {
		// Note: Add headers if needed (tokens/bearer)
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.put(API_COMPANIES_URL+'/'+job.id+'/', job, { headers: httpHeaders });
	}

	// DELETE => delete the job from the server
	deleteJob(jobId: number): Observable<JobModel> {
		const url = `${API_COMPANIES_URL}/${jobId}`;
		return this.http.delete<JobModel>(url);
	}

	deleteJobs(ids: number[] = []): Observable<any> {
		const url = API_COMPANIES_URL + '/delete';
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const body = { prdocutIdsForDelete: ids };
		return this.http.put<QueryResultsModel>(url, body, { headers: httpHeaders} );
	}
}
