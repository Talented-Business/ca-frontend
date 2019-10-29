// Angular
import { Injectable } from '@angular/core';
import { HttpClient,HttpParams } from '@angular/common/http';
// RxJS
import { Observable, BehaviorSubject } from 'rxjs';
// CRUD
import { HttpUtilsService, QueryParamsModel, QueryResultsModel } from '../../_base/crud';
// Models
import { AssetAssignModel } from '../_models/asset-assign.model';
import { environment } from '../../../../environments/environment';
const API_ASSIGNES_URL = environment.host_url+'api/assetAssigns';
// Real REST API
@Injectable()
export class AssetAssignService {
	lastFilter$: BehaviorSubject<QueryParamsModel> = new BehaviorSubject(new QueryParamsModel({}, 'asc', '', 0, 10));

	constructor(private http: HttpClient,
		private httpUtils: HttpUtilsService) { }

	// CREATE =>  POST: add a new assetAssign to the server
	createAssetAssign(assetAssign): Observable<AssetAssignModel> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.post<AssetAssignModel>(API_ASSIGNES_URL, assetAssign,{
			headers: httpHeaders,
		});
	}
	toggleStatus(id):Observable<AssetAssignModel[]> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.get<AssetAssignModel[]>(API_ASSIGNES_URL+'/'+id+'/updateStatus',{headers: httpHeaders});
	}
	// READ
	getAllAssetAssigns(): Observable<AssetAssignModel[]> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.get<AssetAssignModel[]>(API_ASSIGNES_URL,{headers: httpHeaders});
	}

	getAssetAssignById(assetAssignId: number): Observable<AssetAssignModel> {
		return this.http.get<AssetAssignModel>(API_ASSIGNES_URL + `/${assetAssignId}`);
	}

	// Server should return filtered/sorted result
	findAssetAssigns(queryParams: QueryParamsModel): Observable<QueryResultsModel> {
		// Note: Add headers if needed (tokens/bearer)
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const httpParams = this.httpUtils.getFindHTTPParams(queryParams);
		return this.http.get<QueryResultsModel>(API_ASSIGNES_URL, {
			headers: httpHeaders,
			params:  httpParams
		});
	}

	// UPDATE => PUT: update the assetAssign on the server
	updateAssetAssign(assetAssign: AssetAssignModel): Observable<any> {
		// Note: Add headers if needed (tokens/bearer)
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.put(API_ASSIGNES_URL+'/'+assetAssign.id+'/', assetAssign, { headers: httpHeaders });
	}
	assignLoginUser():Observable<AssetAssignModel[]> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.get<AssetAssignModel[]>(API_ASSIGNES_URL+'/logined',{headers: httpHeaders});
	}

	// DELETE => delete the assetAssign from the server
	deleteAssetAssign(assetAssignId: number): Observable<AssetAssignModel> {
		const url = `${API_ASSIGNES_URL}/${assetAssignId}`;
		return this.http.delete<AssetAssignModel>(url);
	}

	deleteAssetAssigns(ids: number[] = []): Observable<any> {
		const url = API_ASSIGNES_URL + '/delete';
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const body = { prdocutIdsForDelete: ids };
		return this.http.put<QueryResultsModel>(url, body, { headers: httpHeaders} );
	}
	unassign(id:number){
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.put<AssetAssignModel[]>(API_ASSIGNES_URL+'/'+id+'/unassign',{headers: httpHeaders});
	}
}
