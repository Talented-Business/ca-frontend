import { BaseModel } from '../../_base/crud';

export class CommissionGroupModel  extends BaseModel {
	id: number;
    employee_id: number;
    company_id:number;
    start_date:Date;
    end_date:Date;
    items:any;
    status:string;
    errors:any;

	clear() {
    }
}
