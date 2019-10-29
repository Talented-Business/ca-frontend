import { BaseModel } from '../../_base/crud';

export class TimeoffModel  extends BaseModel {
	id: number;
    employee_id: number;
    company_id:number;
    start_date:Date;
    end_date:Date;
    reason:string;
    policy:string;
    employee:any;
    company:any;
    status:string;
    errors:any;

	clear() {
    }
}
