import { BaseModel } from '../../_base/crud';

export class ProposalModel  extends BaseModel {
	id: number;
    job_id: number; 
    employee_id: number;
    company_id:number;
    employee:any;
    job:any;
    status:string;
    errors:any;

	clear() {
        this.job_id = null;
    }
}
