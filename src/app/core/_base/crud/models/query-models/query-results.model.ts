export class QueryResultsModel {
	// fields
	items:any[];
	data: any[];
	total: number;
	totalCount: number;
	errorMessage: string;

	constructor(_items: any[] = [], _totalCount: number = 0, _errorMessage: string = '') {
		this.data = _items;
		this.total = _totalCount;
	}
}
