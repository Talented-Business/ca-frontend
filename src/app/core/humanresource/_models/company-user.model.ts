import { BaseModel } from '../../_base/crud';

export class CompanyUserModel  extends BaseModel {
	id: number;
    company_id: number;
    name: string; 
    email: string;
    status: number;
    password:string;
    password_confirm:string;
    errors:any;
    company:any;

	clear() {
        this.company_id = null;
		this.name = '';
        this.email = '';
        this.status = 1;
    }
}
