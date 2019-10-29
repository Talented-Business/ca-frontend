// Angular
import { Injectable } from '@angular/core';
import { HttpClient,HttpParams } from '@angular/common/http';
// RxJS
import { Observable, BehaviorSubject } from 'rxjs';
// CRUD
import { HttpUtilsService, QueryParamsModel, QueryResultsModel } from '../../_base/crud';
// Models
import { AssetModel } from '../_models/asset.model';
import { environment } from '../../../../environments/environment';
const API_ASSETS_URL = environment.host_url+'api/assets';
// Real REST API
@Injectable()
export class AssetService {
	lastFilter$: BehaviorSubject<QueryParamsModel> = new BehaviorSubject(new QueryParamsModel({}, 'asc', '', 0, 10));

	constructor(private http: HttpClient,
		private httpUtils: HttpUtilsService) { }

	// CREATE =>  POST: add a new asset to the server
	createAsset(asset): Observable<AssetModel> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.post<AssetModel>(API_ASSETS_URL, asset,{
			headers: httpHeaders,
		});
	}
	toggleStatus(id):Observable<AssetModel[]> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.get<AssetModel[]>(API_ASSETS_URL+'/'+id+'/updateStatus',{headers: httpHeaders});
	}
	// READ
	getAllAssets(): Observable<AssetModel[]> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.get<AssetModel[]>(API_ASSETS_URL,{headers: httpHeaders});
	}

	getAssetById(assetId: number): Observable<AssetModel> {
		return this.http.get<AssetModel>(API_ASSETS_URL + `/${assetId}`);
	}

	// Server should return filtered/sorted result
	findAssets(queryParams: QueryParamsModel): Observable<QueryResultsModel> {
		// Note: Add headers if needed (tokens/bearer)
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const httpParams = this.httpUtils.getFindHTTPParams(queryParams);
		return this.http.get<QueryResultsModel>(API_ASSETS_URL, {
			headers: httpHeaders,
			params:  httpParams
		});
	}
	// UPDATE => PUT: update the asset on the server
	updateAsset(asset: AssetModel): Observable<any> {
		// Note: Add headers if needed (tokens/bearer)
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.put(API_ASSETS_URL+'/'+asset.id+'/', asset, { headers: httpHeaders });
	}

	// DELETE => delete the asset from the server
	deleteAsset(assetId: number): Observable<AssetModel> {
		const url = `${API_ASSETS_URL}/${assetId}`;
		return this.http.delete<AssetModel>(url);
	}

	deleteAssets(ids: number[] = []): Observable<any> {
		const url = API_ASSETS_URL + '/delete';
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const body = { prdocutIdsForDelete: ids };
		return this.http.put<QueryResultsModel>(url, body, { headers: httpHeaders} );
	}
}
