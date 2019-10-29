// Angular
import { Injectable } from '@angular/core';
import { HttpClient,HttpParams } from '@angular/common/http';
// RxJS
import { Observable, BehaviorSubject } from 'rxjs';
// CRUD
import { HttpUtilsService, QueryParamsModel, QueryResultsModel } from '../../_base/crud';
// Models
import { CompanyUserModel } from '../_models/company-user.model';
import { environment } from '../../../../environments/environment';
const API_COMPANIES_URL = environment.host_url+'api/companyUsers';
// Real REST API
@Injectable()
export class CompanyUserService {
	lastFilter$: BehaviorSubject<QueryParamsModel> = new BehaviorSubject(new QueryParamsModel({}, 'asc', '', 0, 10));

	constructor(private http: HttpClient,
		private httpUtils: HttpUtilsService) { }

	// CREATE =>  POST: add a new companyUser to the server
	createCompanyUser(companyUser): Observable<CompanyUserModel> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.post<CompanyUserModel>(API_COMPANIES_URL, companyUser,{
			headers: httpHeaders,
		});
	}
	toggleStatus(id):Observable<CompanyUserModel[]> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.get<CompanyUserModel[]>(API_COMPANIES_URL+'/'+id+'/updateStatus',{headers: httpHeaders});
	}
	// READ
	getAllCompanyUsers(): Observable<CompanyUserModel[]> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.get<CompanyUserModel[]>(API_COMPANIES_URL,{headers: httpHeaders});
	}

	getCompanyUserById(companyUserId: number): Observable<CompanyUserModel> {
		return this.http.get<CompanyUserModel>(API_COMPANIES_URL + `/${companyUserId}`);
	}

	// Server should return filtered/sorted result
	findCompanyUsers(queryParams: QueryParamsModel): Observable<QueryResultsModel> {
		// Note: Add headers if needed (tokens/bearer)
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const httpParams = this.httpUtils.getFindHTTPParams(queryParams);
		return this.http.get<QueryResultsModel>(API_COMPANIES_URL, {
			headers: httpHeaders,
			params:  httpParams
		});
	}

	// UPDATE => PUT: update the companyUser on the server
	updateCompanyUser(companyUser: CompanyUserModel): Observable<any> {
		// Note: Add headers if needed (tokens/bearer)
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.put(API_COMPANIES_URL+'/'+companyUser.id+'/', companyUser, { headers: httpHeaders });
	}

	// DELETE => delete the companyUser from the server
	deleteCompanyUser(companyUserId: number): Observable<CompanyUserModel> {
		const url = `${API_COMPANIES_URL}/${companyUserId}`;
		return this.http.delete<CompanyUserModel>(url);
	}

	deleteCompanyUsers(ids: number[] = []): Observable<any> {
		const url = API_COMPANIES_URL + '/delete';
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const body = { prdocutIdsForDelete: ids };
		return this.http.put<QueryResultsModel>(url, body, { headers: httpHeaders} );
	}
}
