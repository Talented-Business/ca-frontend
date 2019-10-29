import { BaseModel } from '../../_base/crud';

export class CommissionModel  extends BaseModel {
    id: number;
    group_id:number;
    name: string;
    quantity:number;
    fee:number;
    status:string;
    errors:any;

	clear() {
    }
}
