// Angular
import { Injectable } from '@angular/core';
import { HttpClient,HttpParams } from '@angular/common/http';
// RxJS
import { Observable, BehaviorSubject } from 'rxjs';
// CRUD
import { HttpUtilsService, QueryParamsModel, QueryResultsModel } from '../../_base/crud';
// Models
import { CommissionGroupModel } from '../_models/commission-group.model';
import { environment } from '../../../../environments/environment';
const API_COMPANIES_URL = environment.host_url+'api/commissionGroups';
// Real REST API
@Injectable()
export class CommissionGroupService {
	lastFilter$: BehaviorSubject<QueryParamsModel> = new BehaviorSubject(new QueryParamsModel({}, 'asc', '', 0, 10));

	constructor(private http: HttpClient,
		private httpUtils: HttpUtilsService) { }

	// CREATE =>  POST: add a new commissionGroup to the server
	createCommissionGroup(commissionGroup): Observable<CommissionGroupModel> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.post<CommissionGroupModel>(API_COMPANIES_URL, commissionGroup,{
			headers: httpHeaders,
		});
	}
	// READ
	getAllCommissionGroups(): Observable<CommissionGroupModel[]> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.get<CommissionGroupModel[]>(API_COMPANIES_URL,{headers: httpHeaders});
	}

	getCommissionGroupById(commissionGroupId: number): Observable<CommissionGroupModel> {
		return this.http.get<CommissionGroupModel>(API_COMPANIES_URL + `/${commissionGroupId}`);
	}

	// Server should return filtered/sorted result
	findCommissionGroups(queryParams: QueryParamsModel): Observable<QueryResultsModel> {
		// Note: Add headers if needed (tokens/bearer)
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const httpParams = this.httpUtils.getFindHTTPParams(queryParams);
		return this.http.get<QueryResultsModel>(API_COMPANIES_URL, {
			headers: httpHeaders,
			params:  httpParams
		});
	}

	// UPDATE => PUT: update the commissionGroup on the server
	updateCommissionGroup(commissionGroup: CommissionGroupModel): Observable<any> {
		// Note: Add headers if needed (tokens/bearer)
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.put(API_COMPANIES_URL+'/'+commissionGroup.id+'/', commissionGroup, { headers: httpHeaders });
	}
	
	// DELETE => delete the commissionGroup from the server
	deleteCommissionGroup(commissionGroupId: number): Observable<CommissionGroupModel> {
		const url = `${API_COMPANIES_URL}/${commissionGroupId}`;
		return this.http.delete<CommissionGroupModel>(url);
	}

	deleteCommissionGroups(ids: number[] = []): Observable<any> {
		const url = API_COMPANIES_URL + '/delete';
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const body = { prdocutIdsForDelete: ids };
		return this.http.put<QueryResultsModel>(url, body, { headers: httpHeaders} );
	}
}
