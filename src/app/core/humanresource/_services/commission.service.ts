// Angular
import { Injectable } from '@angular/core';
import { HttpClient,HttpParams } from '@angular/common/http';
// RxJS
import { Observable, BehaviorSubject } from 'rxjs';
// CRUD
import { HttpUtilsService, QueryParamsModel, QueryResultsModel } from '../../_base/crud';
// Models
import { CommissionModel } from '../_models/commission.model';
import { environment } from '../../../../environments/environment';
const API_COMPANIES_URL = environment.host_url+'api/commissions';
// Real REST API
@Injectable()
export class CommissionService {
	lastFilter$: BehaviorSubject<QueryParamsModel> = new BehaviorSubject(new QueryParamsModel({}, 'asc', '', 0, 10));

	constructor(private http: HttpClient,
		private httpUtils: HttpUtilsService) { }

	// CREATE =>  POST: add a new commission to the server
	createCommission(commission): Observable<CommissionModel> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.post<CommissionModel>(API_COMPANIES_URL, commission,{
			headers: httpHeaders,
		});
	}
	// READ
	getAllCommissions(): Observable<CommissionModel[]> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.get<CommissionModel[]>(API_COMPANIES_URL+'/list',{headers: httpHeaders});
	}

	// UPDATE => PUT: update the commission on the server
	updateCommission(commission: CommissionModel): Observable<any> {
		// Note: Add headers if needed (tokens/bearer)
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.put(API_COMPANIES_URL+'/'+commission.id, commission, { headers: httpHeaders });
	}

	// DELETE => delete the commission from the server
	deleteCommission(commissionId: number): Observable<CommissionModel> {
		const url = `${API_COMPANIES_URL}/${commissionId}`;
		return this.http.delete<CommissionModel>(url);
	}
}
