// Angular
import { Injectable } from '@angular/core';
import { HttpClient,HttpParams } from '@angular/common/http';
// RxJS
import { Observable, BehaviorSubject } from 'rxjs';
// CRUD
import { HttpUtilsService, QueryParamsModel, QueryResultsModel } from '../../_base/crud';
// Models
import { EventModel } from '../_models/event.model';
import { environment } from '../../../../environments/environment';
const API_COMPANIES_URL = environment.host_url+'api/events';
// Real REST API
@Injectable()
export class EventService {
	lastFilter$: BehaviorSubject<QueryParamsModel> = new BehaviorSubject(new QueryParamsModel({}, 'asc', '', 0, 10));

	constructor(private http: HttpClient,
		private httpUtils: HttpUtilsService) { }

	// CREATE =>  POST: add a new event to the server
	createEvent(event): Observable<EventModel> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.post<EventModel>(API_COMPANIES_URL, event,{
			headers: httpHeaders,
		});
	}
	toggleStatus(id):Observable<EventModel[]> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.get<EventModel[]>(API_COMPANIES_URL+'/'+id+'/updateStatus',{headers: httpHeaders});
	}
	// READ
	getAllEvents(): Observable<EventModel[]> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.get<EventModel[]>(API_COMPANIES_URL,{headers: httpHeaders});
	}

	getEventById(eventId: number): Observable<EventModel> {
		return this.http.get<EventModel>(API_COMPANIES_URL + `/${eventId}`);
	}

	// Server should return filtered/sorted result
	findEvents(queryParams: QueryParamsModel): Observable<QueryResultsModel> {
		// Note: Add headers if needed (tokens/bearer)
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const httpParams = this.httpUtils.getFindHTTPParams(queryParams);
		return this.http.get<QueryResultsModel>(API_COMPANIES_URL, {
			headers: httpHeaders,
			params:  httpParams
		});
	}

	// UPDATE => PUT: update the event on the server
	updateEvent(event: EventModel): Observable<any> {
		// Note: Add headers if needed (tokens/bearer)
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.put(API_COMPANIES_URL+'/'+event.id, event, { headers: httpHeaders });
	}

	// DELETE => delete the event from the server
	deleteEvent(eventId: number): Observable<EventModel> {
		const url = `${API_COMPANIES_URL}/${eventId}`;
		return this.http.delete<EventModel>(url);
	}

	deleteEvents(ids: number[] = []): Observable<any> {
		const url = API_COMPANIES_URL + '/delete';
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const body = { prdocutIdsForDelete: ids };
		return this.http.put<QueryResultsModel>(url, body, { headers: httpHeaders} );
	}
}
