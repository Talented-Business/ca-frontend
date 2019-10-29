// Angular
import { Injectable } from '@angular/core';
import { HttpClient,HttpParams } from '@angular/common/http';
// RxJS
import { Observable, BehaviorSubject } from 'rxjs';
// CRUD
import { HttpUtilsService, QueryParamsModel, QueryResultsModel } from '../../_base/crud';
// Models
import { environment } from '../../../../environments/environment';
const API_CONFIG_URL = environment.host_url+'api/config';
const API_REPORTS_URL = environment.host_url+'api/reports';
// Real REST API
@Injectable()
export class ConfigService {
	lastFilter$: BehaviorSubject<QueryParamsModel> = new BehaviorSubject(new QueryParamsModel({}, 'asc', '', 0, 10));

	constructor(private http: HttpClient,
		private httpUtils: HttpUtilsService) { }

	// CREATE =>  POST: add a new invoiceItem to the server
	save(config): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.post<any>(API_CONFIG_URL, config,{
			headers: httpHeaders,
		});
	}
	// READ
	getAll(): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.get<any[]>(API_CONFIG_URL,{headers: httpHeaders});
	}
	export(action:string): any {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		window.open(API_REPORTS_URL+'/'+action);
		//return this.http.get<any[]>(API_REPORTS_URL+'/'+action,{headers: httpHeaders});
	}
	getDashboard(year:number):Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.get<any[]>(API_CONFIG_URL+'/dashboard?year='+year,{headers: httpHeaders});
	}
}
