import { BaseModel } from '../../_base/crud';

export class InvoiceModel  extends BaseModel {
    id: number;
    company_id:number;
    company:any;
    invoicing_date: Date;
    start_date:Date;
    end_date:Date;
    total:number;
    items:any;
    status:string;
    errors:any;

	clear() {
    }
}
