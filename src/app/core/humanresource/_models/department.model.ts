import { BaseModel } from '../../_base/crud';

export class DepartmentModel  extends BaseModel {
	id: number;
	name: string;
    status: boolean;
    errors:any;

	clear() {
		this.name = '';
		this.status = true;
    }
}
