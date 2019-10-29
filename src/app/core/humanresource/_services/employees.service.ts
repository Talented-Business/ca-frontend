// Angular
import { Injectable } from '@angular/core';
import { HttpClient,HttpParams } from '@angular/common/http';
// RxJS
import { Observable, BehaviorSubject } from 'rxjs';
// CRUD
import { HttpUtilsService, QueryParamsModel, QueryResultsModel } from '../../_base/crud';
// Models
import { EmployeeModel } from '../_models/employee.model';
import { environment } from '../../../../environments/environment';
const API_EMPLOYEES_URL = environment.host_url+'api/employees';
const API_PHOTOS_URL = environment.host_url+'api/photos';
const API_DOCUMENTS_URL = environment.host_url+'api/documents';
// Real REST API
@Injectable()
export class EmployeesService {
	lastFilter$: BehaviorSubject<QueryParamsModel> = new BehaviorSubject(new QueryParamsModel({}, 'asc', '', 0, 10));

	constructor(private http: HttpClient,
		private httpUtils: HttpUtilsService) { }

	// CREATE =>  POST: add a new employee to the server
	createEmployee(employee): Observable<EmployeeModel> {
		//const httpHeaders = this.httpUtils.getHTTPHeaders();
		const formData: FormData = new FormData();
		let attributes = ['first_name','last_name','id_number','gender','nationality','home_phone_number','mobile_phone_number','personal_email',
		'marital','skype_id','referal_name','country','state','home_address','deport_america','check_america','check_background','english_level',
		'available_works','have_computer','have_monitor','have_headset','have_ethernet'];
		attributes.forEach((attribute)=>{
			formData.append(attribute, employee[attribute]);
		});
		formData.append('birthday', employee.birthday);
		if(employee.passport_path!=null)formData.append('passport_path', employee.passport_path._files[0], employee.passport_path.fileNames);
		if(employee.reference_path!=null)formData.append('reference_path', employee.reference_path._files[0], employee.reference_path.fileNames);
		if(employee.cv_path!=null)formData.append('cv_path', employee.cv_path._files[0], employee.cv_path.fileNames);
		if(employee.police_path!=null)formData.append('police_path', employee.police_path._files[0], employee.police_path.fileNames);
		return this.http.post<EmployeeModel>(API_EMPLOYEES_URL, formData);
	}
	// APPROVE =>  POST: approve into Employee
	convertEmployee(employee): Observable<EmployeeModel> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.post<EmployeeModel>(API_EMPLOYEES_URL+'/convert?id='+employee.id,{skills:employee.skills}, {
			headers: httpHeaders,
		});
	}
	// APPROVE =>  POST: approve into Employee
	rejectEmployee(employee): Observable<EmployeeModel> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.post<EmployeeModel>(API_EMPLOYEES_URL+'/reject?id='+employee.id, {
			headers: httpHeaders
		});
	}

	findRecruits(queryParams: QueryParamsModel): Observable<QueryResultsModel> {
		// Note: Add headers if needed (tokens/bearer)
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const httpParams = this.httpUtils.getFindHTTPParams(queryParams);
		return this.http.get<QueryResultsModel>(API_EMPLOYEES_URL, {
			headers: httpHeaders,
			params:  httpParams
		});
	}
	findUnhiredEmployees(): Observable<EmployeeModel[]> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.get<EmployeeModel[]>(API_EMPLOYEES_URL+'/unhired', {headers: httpHeaders});
	}
	findAllEmployees(): Observable<EmployeeModel[]> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.get<EmployeeModel[]>(API_EMPLOYEES_URL+'/confirmed', {headers: httpHeaders});
	}
	// READ
	getAllEmployees(): Observable<EmployeeModel[]> {
		return this.http.get<EmployeeModel[]>(API_EMPLOYEES_URL);
	}

	getEmployeeById(employeeId: number): Observable<EmployeeModel> {
		return this.http.get<EmployeeModel>(API_EMPLOYEES_URL + `/${employeeId}`);
	}

	// Server should return filtered/sorted result
	findEmployees(queryParams: QueryParamsModel): Observable<QueryResultsModel> {
		// Note: Add headers if needed (tokens/bearer)
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const httpParams = this.httpUtils.getFindHTTPParams(queryParams);
		return this.http.get<QueryResultsModel>(API_EMPLOYEES_URL, {
			headers: httpHeaders,
			params:  httpParams
		});
	}

	// UPDATE => PUT: update the employee on the server
	updateRecruit(employee: EmployeeModel): Observable<any> {
		// Note: Add headers if needed (tokens/bearer)
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.put(API_EMPLOYEES_URL, employee, { headers: httpHeaders });
	}
	// UPDATE => PUT: update the employee on the server
	updateEmployee(employee: EmployeeModel): Observable<any> {
		// Note: Add headers if needed (tokens/bearer)
		const formData: FormData = new FormData();
		let attributes = ['first_name','last_name','id_number','gender','nationality','home_phone_number','mobile_phone_number','personal_email',
		'marital','skype_id','referal_name','country','state','home_address','deport_america','check_america','check_background','english_level',
		'available_works','have_computer','have_monitor','have_headset','have_ethernet','visit','approve_date','birthday'];
		attributes.forEach((attribute)=>{
			formData.append(attribute, employee[attribute]);
		});
		employee.skills.forEach((skill)=>{
			formData.append('skills[]', skill);
		});
		if(employee.photo!=null){
			employee.photo._files.forEach((file, index)=>{
				formData.append('photo[]', file);
			})
		}
		return this.http.post<EmployeeModel>(API_EMPLOYEES_URL+'/'+employee.id, formData);
		//return this.http.put(API_EMPLOYEES_URL+'/'+employee.id, employee, { headers: httpHeaders });
	}
	updateStatusForRecruit(employees: EmployeeModel[], status: string): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const body = {
			employeesForUpdate: employees,
			newStatus: status
		};
		const url = API_EMPLOYEES_URL + '/updateStatus';
		return this.http.put(url, body, { headers: httpHeaders });
	}
	disableStatus(id):Observable<any>{
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const body = {
			newStatus: "disable"
		};
		const url = API_EMPLOYEES_URL + '/' + id + '/disable';
		return this.http.put(url, body, { headers: httpHeaders });
	}
	restoreStatus(id):Observable<any>{
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const body = {
			newStatus: "approved"
		};
		const url = API_EMPLOYEES_URL + '/' + id + '/restore';
		return this.http.put(url, body, { headers: httpHeaders });
	}
	uploadPhoto(id:number,photo:any){
		const formData: FormData = new FormData();
		formData.append('path', photo._files[0], photo.fileNames);
		formData.append('member_id', id.toString());
		return this.http.post<EmployeeModel>(API_PHOTOS_URL, formData);
	}
	deletePhoto(id:number){
		const url = `${API_PHOTOS_URL}/${id}`;
		return this.http.delete<EmployeeModel>(url);
	}
	uploadDocument(document:any,file:any){
		const formData: FormData = new FormData();
		formData.append('name', document.name);
		formData.append('member_id', document.member_id);
		formData.append('path', file._files[0], file.fileNames);
		const url = `${API_DOCUMENTS_URL}/${document.id}`;
		return this.http.post<any>(url, formData);
	}
	uploadNewDocument(document:any,file:any){
		const formData: FormData = new FormData();
		formData.append('name', document.name);
		formData.append('member_id', document.member_id);
		formData.append('path', file._files[0], file.fileNames);
		const url = `${API_DOCUMENTS_URL}`;
		return this.http.post<any>(url, formData);
	}
	deleteDocument(id:number){
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const url = `${API_DOCUMENTS_URL}/${id}`;
		return this.http.delete<any>(url,{ headers: httpHeaders });
	}
	updateUser(user:any){
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.put(API_EMPLOYEES_URL+'/updateUser', user, { headers: httpHeaders });
	}
	updateBank(employee:any){
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.put(API_EMPLOYEES_URL+'/updateBank', employee, { headers: httpHeaders });
	}
	// DELETE => delete the employee from the server
	deleteEmployee(employeeId: number): Observable<EmployeeModel> {
		const url = `${API_EMPLOYEES_URL}/${employeeId}`;
		return this.http.delete<EmployeeModel>(url);
	}

	deleteEmployees(ids: number[] = []): Observable<any> {
		const url = API_EMPLOYEES_URL + '/delete';
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const body = { prdocutIdsForDelete: ids };
		return this.http.put<QueryResultsModel>(url, body, { headers: httpHeaders} );
	}
}
