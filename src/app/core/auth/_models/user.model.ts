import { BaseModel } from '../../_base/crud';
import { Address } from './address.model';
import { SocialNetworks } from './social-networks.model';

export class User extends BaseModel {
    id: number;
    name: string;
    username: string;
    password: string;
    email: string;
    accessToken: string;
    refreshToken: string;
    roles: number[];
    menus:string[];
    type:string;
    pic: string;
    fullname: string;
    occupation: string;
    companyName: string;
    active:string;
    phone: string;
    new_password:string;
    confirm_password:string;

    clear(): void {
        this.id = undefined;
        this.name = '';
        this.password = '';
        this.email = '';
        //this.roles = [];
        this.fullname = '';
        this.accessToken = 'access-token-' + Math.random();
        this.refreshToken = 'access-token-' + Math.random();
        this.pic = './assets/media/users/default.jpg';
        this.occupation = '';
        this.companyName = '';
        this.phone = '';
        this.active = '1';
    }
}
