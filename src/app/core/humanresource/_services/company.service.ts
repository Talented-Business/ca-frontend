// Angular
import { Injectable } from '@angular/core';
import { HttpClient,HttpParams } from '@angular/common/http';
// RxJS
import { Observable, BehaviorSubject } from 'rxjs';
// CRUD
import { HttpUtilsService, QueryParamsModel, QueryResultsModel } from '../../_base/crud';
// Models
import { CompanyModel } from '../_models/company.model';
import { environment } from '../../../../environments/environment';
const API_COMPANIES_URL = environment.host_url+'api/companies';
// Real REST API
@Injectable()
export class CompanyService {
	lastFilter$: BehaviorSubject<QueryParamsModel> = new BehaviorSubject(new QueryParamsModel({}, 'asc', '', 0, 10));

	constructor(private http: HttpClient,
		private httpUtils: HttpUtilsService) { }

	// CREATE =>  POST: add a new company to the server
	createCompany(company): Observable<CompanyModel> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.post<CompanyModel>(API_COMPANIES_URL, company,{
			headers: httpHeaders,
		});
	}
	toggleStatus(id):Observable<CompanyModel[]> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.get<CompanyModel[]>(API_COMPANIES_URL+'/'+id+'/updateStatus',{headers: httpHeaders});
	}
	// READ
	getAllCompanies(): Observable<CompanyModel[]> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.get<CompanyModel[]>(API_COMPANIES_URL+'/list',{headers: httpHeaders});
	}

	getCompanyById(companyId: number): Observable<CompanyModel> {
		return this.http.get<CompanyModel>(API_COMPANIES_URL + `/${companyId}`);
	}

	// Server should return filtered/sorted result
	findCompanies(queryParams: QueryParamsModel): Observable<QueryResultsModel> {
		// Note: Add headers if needed (tokens/bearer)
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const httpParams = this.httpUtils.getFindHTTPParams(queryParams);
		return this.http.get<QueryResultsModel>(API_COMPANIES_URL, {
			headers: httpHeaders,
			params:  httpParams
		});
	}
	findWorkSnap(worksnapId:number):Observable<any>{
		return this.http.get<any>(API_COMPANIES_URL + `/worksnap/${worksnapId}`);
	}
	uploadHours(id:number,department_id:number,hours:any){
		const formData: FormData = new FormData();
		formData.append('hours', hours._files[0], hours.fileNames);
		formData.append('department_id', department_id.toString());
		const url = `${API_COMPANIES_URL}/${id}/uploadHours`;
		return this.http.post<any>(url, formData);
	}
	deleteHours(id:number,department_id:number){
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const body = {
			department_id: department_id
		};
		const url = `${API_COMPANIES_URL}/${id}/deleteHours`;
		return this.http.put<any>(url,body, { headers: httpHeaders });
	}

	// UPDATE => PUT: update the company on the server
	updateCompany(company: CompanyModel): Observable<any> {
		// Note: Add headers if needed (tokens/bearer)
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.put(API_COMPANIES_URL+'/'+company.id, company, { headers: httpHeaders });
	}

	// DELETE => delete the company from the server
	deleteCompany(companyId: number): Observable<CompanyModel> {
		const url = `${API_COMPANIES_URL}/${companyId}`;
		return this.http.delete<CompanyModel>(url);
	}

	deleteCompanies(ids: number[] = []): Observable<any> {
		const url = API_COMPANIES_URL + '/delete';
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const body = { prdocutIdsForDelete: ids };
		return this.http.put<QueryResultsModel>(url, body, { headers: httpHeaders} );
	}
}
