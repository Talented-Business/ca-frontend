import { BaseModel } from '../../_base/crud';

export class CompanyModel  extends BaseModel {
	id: number;
	name: string;
    website: string;
    state_incoporation: string; 
	entity_type: string;
    industry: string;
    size: string;
    description: string;
    headquaters_addresses: string;
    legal_address: string;
    billing_address: string;
    document_agreement: string;
    document_signed_by: string;
    document_signature_date: Date;
    bank_name: string;
    bank_account_name: string;
    bank_account_number: string;
    admin_first_name: string;
    admin_last_name: string;
    admin_email: string;
    admin_phone_number: string;
	admin_level: string;
	status: string;
    errors:any;
    departments:any;
    users:any;

	clear() {
		this.name = '';
		this.website = '';
		this.state_incoporation = '';
		this.entity_type = '';
		this.industry = '';
		this.size = '';
        this.description = null;
        this.headquaters_addresses = '';
        this.legal_address = '';
        this.billing_address = '';
        this.document_agreement = '';
        this.document_signed_by = '';
        this.document_signature_date = null;
        this.bank_name = '';
        this.bank_account_name = '';
        this.admin_first_name = '';
        this.admin_last_name = '';
        this.admin_email = '';
        this.admin_phone_number = '';
        this.admin_level = '';
    }
}
