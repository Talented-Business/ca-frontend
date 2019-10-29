// Angular
import { Injectable } from '@angular/core';
import { HttpClient,HttpParams } from '@angular/common/http';
// RxJS
import { Observable, BehaviorSubject } from 'rxjs';
// CRUD
import { HttpUtilsService, QueryParamsModel, QueryResultsModel } from '../../_base/crud';
// Models
import { TimeoffModel } from '../_models/timeoff.model';
import { environment } from '../../../../environments/environment';
const API_COMPANIES_URL = environment.host_url+'api/timeoffs';
// Real REST API
@Injectable()
export class TimeoffService {
	lastFilter$: BehaviorSubject<QueryParamsModel> = new BehaviorSubject(new QueryParamsModel({}, 'asc', '', 0, 10));

	constructor(private http: HttpClient,
		private httpUtils: HttpUtilsService) { }

	// CREATE =>  POST: add a new timeoff to the server
	createTimeoff(timeoff): Observable<TimeoffModel> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.post<TimeoffModel>(API_COMPANIES_URL, timeoff,{
			headers: httpHeaders,
		});
	}
	// READ
	getAllTimeoffs(): Observable<TimeoffModel[]> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.get<TimeoffModel[]>(API_COMPANIES_URL,{headers: httpHeaders});
	}

	getTimeoffById(timeoffId: number): Observable<TimeoffModel> {
		return this.http.get<TimeoffModel>(API_COMPANIES_URL + `/${timeoffId}`);
	}

	// Server should return filtered/sorted result
	findTimeoffs(queryParams: QueryParamsModel): Observable<QueryResultsModel> {
		// Note: Add headers if needed (tokens/bearer)
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const httpParams = this.httpUtils.getFindHTTPParams(queryParams);
		return this.http.get<QueryResultsModel>(API_COMPANIES_URL, {
			headers: httpHeaders,
			params:  httpParams
		});
	}

	// UPDATE => PUT: update the timeoff on the server
	updateTimeoff(timeoff: TimeoffModel): Observable<any> {
		// Note: Add headers if needed (tokens/bearer)
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.put(API_COMPANIES_URL+'/'+timeoff.id, timeoff, { headers: httpHeaders });
	}
	
	// DELETE => delete the timeoff from the server
	deleteTimeoff(timeoffId: number): Observable<TimeoffModel> {
		const url = `${API_COMPANIES_URL}/${timeoffId}`;
		return this.http.delete<TimeoffModel>(url);
	}

	deleteTimeoffs(ids: number[] = []): Observable<any> {
		const url = API_COMPANIES_URL + '/delete';
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const body = { prdocutIdsForDelete: ids };
		return this.http.put<QueryResultsModel>(url, body, { headers: httpHeaders} );
	}
}
