import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { HttpUtilsService } from '../../_base/crud';
import { AttributeModel } from '../_models/attribute.model';
import { environment } from '../../../../environments/environment';
const API_ATTRIBUTES_URL = environment.host_url+'api/attributes';

@Injectable()
export class AttributeService {
    constructor(private http: HttpClient,private httpUtils: HttpUtilsService) {}

    // Attributes
    getAllAttributes(): Observable<AttributeModel[]> {
        return this.http.get<AttributeModel[]>(API_ATTRIBUTES_URL);
    }

    getAttributeById(attributeId: number): Observable<AttributeModel> {
		return this.http.get<AttributeModel>(API_ATTRIBUTES_URL + `/${attributeId}`);
    }

    // CREATE =>  POST: add a new attribute to the server
	createAttribute(attribute: AttributeModel): Observable<AttributeModel> {
		// Note: Add headers if needed (tokens/bearer)
        const httpHeaders = new HttpHeaders();
        httpHeaders.set('Content-Type', 'application/json');
		return this.http.post<AttributeModel>(API_ATTRIBUTES_URL, attribute, { headers: httpHeaders});
    }
    
	toggleStatus(id):Observable<AttributeModel[]> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.get<AttributeModel[]>(API_ATTRIBUTES_URL+'/'+id+'/updateStatus',{headers: httpHeaders});
	}

    // UPDATE => PUT: update the attribute on the server
	updateAttribute(attribute: AttributeModel): Observable<any> {
        const httpHeaders = new HttpHeaders();
        httpHeaders.set('Content-Type', 'application/json');
		return this.http.put(API_ATTRIBUTES_URL+'/'+attribute.id, attribute, { headers: httpHeaders });
	}

	// DELETE => delete the attribute from the server
	deleteAttribute(attributeId: number): Observable<AttributeModel> {
		const url = `${API_ATTRIBUTES_URL}/${attributeId}`;
		return this.http.delete<AttributeModel>(url);
	}


 	/*
 	 * Handle Http operation that failed.
 	 * Let the app continue.
     *
	 * @param operation - name of the operation that failed
 	 * @param result - optional value to return as the observable result
 	 */
    private handleError<T>(operation = 'operation', result?: any) {
        return (error: any): Observable<any> => {
            // TODO: send the error to remote logging infrastructure
            console.error(error); // log to console instead

            // Let the app keep running by returning an empty result.
            return of(result);
        };
    }
}
