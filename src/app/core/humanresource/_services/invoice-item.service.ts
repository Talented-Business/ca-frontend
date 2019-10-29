// Angular
import { Injectable } from '@angular/core';
import { HttpClient,HttpParams } from '@angular/common/http';
// RxJS
import { Observable, BehaviorSubject } from 'rxjs';
// CRUD
import { HttpUtilsService, QueryParamsModel, QueryResultsModel } from '../../_base/crud';
// Models
import { InvoiceItemModel } from '../_models/invoice-item.model';
import { environment } from '../../../../environments/environment';
const API_INVOICEITEMS_URL = environment.host_url+'api/invoiceItems';
// Real REST API
@Injectable()
export class InvoiceItemService {
	lastFilter$: BehaviorSubject<QueryParamsModel> = new BehaviorSubject(new QueryParamsModel({}, 'asc', '', 0, 10));

	constructor(private http: HttpClient,
		private httpUtils: HttpUtilsService) { }

	// CREATE =>  POST: add a new invoiceItem to the server
	createInvoiceItem(invoiceItem): Observable<InvoiceItemModel> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.post<InvoiceItemModel>(API_INVOICEITEMS_URL, invoiceItem,{
			headers: httpHeaders,
		});
	}
	// READ
	getAllInvoiceItems(): Observable<InvoiceItemModel[]> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.get<InvoiceItemModel[]>(API_INVOICEITEMS_URL,{headers: httpHeaders});
	}
	// READ
	getInvoiceItemsFromWorksnap(from:string,to:string,company_id:number): Observable<InvoiceItemModel[]> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.get<InvoiceItemModel[]>(API_INVOICEITEMS_URL+'/worksnap?from='+from+"&to="+to+"&company_id="+company_id,{headers: httpHeaders});
	}

	// DELETE => delete the invoiceItem from the server
	deleteInvoiceItem(invoiceItemId: number): Observable<InvoiceItemModel> {
		const url = `${API_INVOICEITEMS_URL}/${invoiceItemId}`;
		return this.http.delete<InvoiceItemModel>(url);
	}
}
