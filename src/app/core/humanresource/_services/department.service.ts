import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { HttpUtilsService } from '../../_base/crud';
import { DepartmentModel } from '../_models/department.model';
import { environment } from '../../../../environments/environment';
const API_DEPARTMENTS_URL = environment.host_url+'api/departments';

@Injectable()
export class DepartmentService {
    constructor(private http: HttpClient,private httpUtils: HttpUtilsService) {}

    // Departments
    getAllDepartments(): Observable<DepartmentModel[]> {
        return this.http.get<DepartmentModel[]>(API_DEPARTMENTS_URL);
    }

    getDepartmentById(departmentId: number): Observable<DepartmentModel> {
		return this.http.get<DepartmentModel>(API_DEPARTMENTS_URL + `/${departmentId}`);
    }

    // CREATE =>  POST: add a new department to the server
	createDepartment(department: DepartmentModel): Observable<DepartmentModel> {
		// Note: Add headers if needed (tokens/bearer)
        const httpHeaders = new HttpHeaders();
        httpHeaders.set('Content-Type', 'application/json');
		return this.http.post<DepartmentModel>(API_DEPARTMENTS_URL, department, { headers: httpHeaders});
	}
	toggleStatus(id):Observable<DepartmentModel[]> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.get<DepartmentModel[]>(API_DEPARTMENTS_URL+'/'+id+'/updateStatus',{headers: httpHeaders});
	}

    // UPDATE => PUT: update the department on the server
	updateDepartment(department: DepartmentModel): Observable<any> {
        const httpHeaders = new HttpHeaders();
        httpHeaders.set('Content-Type', 'application/json');
		return this.http.put(API_DEPARTMENTS_URL+'/'+department.id, department, { headers: httpHeaders });
	}

	// DELETE => delete the department from the server
	deleteDepartment(departmentId: number): Observable<DepartmentModel> {
		const url = `${API_DEPARTMENTS_URL}/${departmentId}`;
		return this.http.delete<DepartmentModel>(url);
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
