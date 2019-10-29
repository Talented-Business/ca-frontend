// Angular
import { Injectable } from '@angular/core';
import { HttpClient,HttpParams } from '@angular/common/http';
// RxJS
import { Observable, BehaviorSubject } from 'rxjs';
// CRUD
import { HttpUtilsService, QueryParamsModel, QueryResultsModel } from '../../_base/crud';
// Models
import { ProposalModel } from '../_models/proposal.model';
import { environment } from '../../../../environments/environment';
const API_COMPANIES_URL = environment.host_url+'api/proposals';
// Real REST API
@Injectable()
export class ProposalService {
	lastFilter$: BehaviorSubject<QueryParamsModel> = new BehaviorSubject(new QueryParamsModel({}, 'asc', '', 0, 10));

	constructor(private http: HttpClient,
		private httpUtils: HttpUtilsService) { }

	// CREATE =>  POST: add a new proposal to the server
	createProposal(proposal): Observable<ProposalModel> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.post<ProposalModel>(API_COMPANIES_URL, proposal,{
			headers: httpHeaders,
		});
	}
	// READ
	getAllProposals(): Observable<ProposalModel[]> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.get<ProposalModel[]>(API_COMPANIES_URL,{headers: httpHeaders});
	}

	getProposalById(proposalId: number): Observable<ProposalModel> {
		return this.http.get<ProposalModel>(API_COMPANIES_URL + `/${proposalId}`);
	}

	// Server should return filtered/sorted result
	findProposals(queryParams: QueryParamsModel): Observable<QueryResultsModel> {
		// Note: Add headers if needed (tokens/bearer)
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const httpParams = this.httpUtils.getFindHTTPParams(queryParams);
		return this.http.get<QueryResultsModel>(API_COMPANIES_URL, {
			headers: httpHeaders,
			params:  httpParams
		});
	}

	// UPDATE => PUT: update the proposal on the server
	updateProposal(proposal: ProposalModel): Observable<any> {
		// Note: Add headers if needed (tokens/bearer)
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.put(API_COMPANIES_URL+'/'+proposal.id, proposal, { headers: httpHeaders });
	}
	
	// DELETE => delete the proposal from the server
	deleteProposal(proposalId: number): Observable<ProposalModel> {
		const url = `${API_COMPANIES_URL}/${proposalId}`;
		return this.http.delete<ProposalModel>(url);
	}

	deleteProposals(ids: number[] = []): Observable<any> {
		const url = API_COMPANIES_URL + '/delete';
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const body = { prdocutIdsForDelete: ids };
		return this.http.put<QueryResultsModel>(url, body, { headers: httpHeaders} );
	}
}
