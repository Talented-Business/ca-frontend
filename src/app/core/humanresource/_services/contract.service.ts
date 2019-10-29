// Angular
import { Injectable } from '@angular/core';
import { HttpClient,HttpParams } from '@angular/common/http';
// RxJS
import { Observable, BehaviorSubject } from 'rxjs';
// CRUD
import { HttpUtilsService, QueryParamsModel, QueryResultsModel } from '../../_base/crud';
// Models
import { ContractModel } from '../_models/contract.model';
import { environment } from '../../../../environments/environment';
const API_COMPANIES_URL = environment.host_url+'api/contracts';
// Real REST API
@Injectable()
export class ContractService {
	lastFilter$: BehaviorSubject<QueryParamsModel> = new BehaviorSubject(new QueryParamsModel({}, 'asc', '', 0, 10));

	constructor(private http: HttpClient,
		private httpUtils: HttpUtilsService) { }

	// CREATE =>  POST: add a new contract to the server
	createContract(contract): Observable<ContractModel> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.post<ContractModel>(API_COMPANIES_URL, contract,{
			headers: httpHeaders,
		});
	}
	toggleStatus(id):Observable<ContractModel[]> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.get<ContractModel[]>(API_COMPANIES_URL+'/'+id+'/updateStatus',{headers: httpHeaders});
	}
	// READ
	getAllContracts(): Observable<ContractModel[]> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.get<ContractModel[]>(API_COMPANIES_URL,{headers: httpHeaders});
	}

	getContractById(contractId: number): Observable<ContractModel> {
		return this.http.get<ContractModel>(API_COMPANIES_URL + `/${contractId}`);
	}

	// Server should return filtered/sorted result
	findContracts(queryParams: QueryParamsModel): Observable<QueryResultsModel> {
		// Note: Add headers if needed (tokens/bearer)
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const httpParams = this.httpUtils.getFindHTTPParams(queryParams);
		return this.http.get<QueryResultsModel>(API_COMPANIES_URL, {
			headers: httpHeaders,
			params:  httpParams
		});
	}

	// UPDATE => PUT: update the contract on the server
	updateContract(contract: ContractModel): Observable<any> {
		// Note: Add headers if needed (tokens/bearer)
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.put(API_COMPANIES_URL+'/'+contract.id, contract, { headers: httpHeaders });
	}

	// DELETE => delete the contract from the server
	deleteContract(contractId: number): Observable<ContractModel> {
		const url = `${API_COMPANIES_URL}/${contractId}`;
		return this.http.delete<ContractModel>(url);
	}

	deleteContracts(ids: number[] = []): Observable<any> {
		const url = API_COMPANIES_URL + '/delete';
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const body = { prdocutIdsForDelete: ids };
		return this.http.put<QueryResultsModel>(url, body, { headers: httpHeaders} );
	}
}
