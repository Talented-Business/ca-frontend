import { BaseModel } from '../../_base/crud';

export class Role extends BaseModel {
    id: number;
    name: string;
    title: string;
    type:string;
    permissions: number[];
    isCoreRole: boolean = false;

    clear(): void {
        this.id = undefined;
        this.name = '';
        this.permissions = [];
        this.type = '';
        this.isCoreRole = false;
	}
}
