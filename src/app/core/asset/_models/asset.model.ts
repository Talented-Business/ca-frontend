import { BaseModel } from '../../_base/crud';

export class AssetModel  extends BaseModel {
	id: number;
    name: string; 
    imei: string;
    status:string;
    employee:any;
    errors:any;

	clear() {
        this.name = '';
		this.imei = '';
    }
}
