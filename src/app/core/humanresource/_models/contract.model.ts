import { BaseModel } from '../../_base/crud';

export class ContractModel  extends BaseModel {
	id: number;
	active_id: number;
    employee_id: number;
    company_id: number;
    start_date: any; 
	end_date: any;
    position: string;
    department_id: number;
    work_location: string;
    employment_type: string;
    employment_status: string;
    manager: string;
    worksnap_id: string;
    pay_days: string;
    deduction_item: number;
    compensation: string;
    hourly_rate: number;
    hours_per_day_period: number;
    proposal_id:number;
	status: number;
    errors:any;
    employee:any;
    company:any;
    department:any;

	clear() {
		this.active_id = null;
		this.employee_id = null;
        this.company_id = null;
		this.start_date = null;
		this.position = '';
        this.department_id = null;
        this.work_location = '';
        this.employment_type = '';
        this.employment_status = '';
        this.manager = '';
        this.worksnap_id = '';
        this.pay_days = '';
        this.deduction_item = 0;
        this.compensation = '';
        this.hourly_rate = null;
        this.hours_per_day_period = null;
    }
}
