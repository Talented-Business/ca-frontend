import { BaseModel } from '../../_base/crud';

export class JobModel  extends BaseModel {
	id: number;
    title: string; 
    position: string;
    description:string;
    status:boolean;
    created_date:string;
    skills:any;
    errors:any;

	clear() {
        this.title = '';
		this.position = '';
        this.description = '';
    }
}
