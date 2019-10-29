import { BaseModel } from '../../_base/crud';

export class EventModel  extends BaseModel {
	id: number;
    title: string; 
    description:string;
    status:string="Draft";
    created_date:string;
    errors:any;

	clear() {
        this.title = '';
        this.description = '';
    }
}
