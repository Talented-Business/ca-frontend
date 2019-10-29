// Angular
import { Injectable } from '@angular/core';
import { HttpClient,HttpParams } from '@angular/common/http';
// RxJS
import { Observable, BehaviorSubject } from 'rxjs';
// CRUD
import { HttpUtilsService, QueryParamsModel, QueryResultsModel } from '../../_base/crud';
// Models
import { InvoiceModel } from '../_models/invoice.model';
import { environment } from '../../../../environments/environment';
const API_INVOICES_URL = environment.host_url+'api/invoices';
// Real REST API
@Injectable()
export class InvoiceService {
	lastFilter$: BehaviorSubject<QueryParamsModel> = new BehaviorSubject(new QueryParamsModel({}, 'asc', '', 0, 10));

	constructor(private http: HttpClient,
		private httpUtils: HttpUtilsService) { }

	// CREATE =>  POST: add a new invoice to the server
	createInvoice(invoice): Observable<InvoiceModel> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.post<InvoiceModel>(API_INVOICES_URL, invoice,{
			headers: httpHeaders,
		});
	}
	// READ
	getAllInvoices(): Observable<InvoiceModel[]> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.get<InvoiceModel[]>(API_INVOICES_URL+'/list',{headers: httpHeaders});
	}

	getInvoiceById(invoiceId: number): Observable<InvoiceModel> {
		return this.http.get<InvoiceModel>(API_INVOICES_URL + `/${invoiceId}`);
	}

	// Server should return filtered/sorted result
	findInvoices(queryParams: QueryParamsModel): Observable<QueryResultsModel> {
		// Note: Add headers if needed (tokens/bearer)
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const httpParams = this.httpUtils.getFindHTTPParams(queryParams);
		return this.http.get<QueryResultsModel>(API_INVOICES_URL, {
			headers: httpHeaders,
			params:  httpParams
		});
	}

	// UPDATE => PUT: update the invoice on the server
	updateInvoice(invoice: InvoiceModel): Observable<any> {
		// Note: Add headers if needed (tokens/bearer)
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.put(API_INVOICES_URL+'/'+invoice.id, invoice, { headers: httpHeaders });
	}
	// UPDATE => PUT: update the invoice on the server
	updateStatus(invoice: InvoiceModel): Observable<any> {
		// Note: Add headers if needed (tokens/bearer)
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.put(API_INVOICES_URL+'/'+invoice.id+'/updateStatus', invoice, { headers: httpHeaders });
	}
	// UPDATE => PUT: update the invoice on the server
	paid(invoice: InvoiceModel): Observable<any> {
		// Note: Add headers if needed (tokens/bearer)
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.put(API_INVOICES_URL+'/'+invoice.id+'/paid', invoice, { headers: httpHeaders });
	}
	
	// DELETE => delete the invoice from the server
	deleteInvoice(invoiceId: number): Observable<InvoiceModel> {
		const url = `${API_INVOICES_URL}/${invoiceId}`;
		return this.http.delete<InvoiceModel>(url);
	}

	deleteInvoices(ids: number[] = []): Observable<any> {
		const url = API_INVOICES_URL + '/delete';
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const body = { prdocutIdsForDelete: ids };
		return this.http.put<QueryResultsModel>(url, body, { headers: httpHeaders} );
	}
}
