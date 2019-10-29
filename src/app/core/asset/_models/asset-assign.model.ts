import { BaseModel } from '../../_base/crud';

export class AssetAssignModel  extends BaseModel {
	id: number;
    employee_id: number; 
    start_date: Date;
    end_date: Date;
    asset_id: number; 
    comment:string;
    status:string;
    employee:any;
    asset:any;
    errors:any;

	clear() {
        this.comment = '';
		this.start_date = null;
    }
}
