import { BaseModel } from '../../_base/crud';

export class InvoiceItemModel  extends BaseModel {
    id: number;
    invoice_id:number;
    employee_id:number;
    task:string;
    description:string;
    rate:number;
    amount:number;
    status:string;
    errors:any;

	clear() {
    }
}
