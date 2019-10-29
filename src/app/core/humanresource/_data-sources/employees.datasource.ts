import { mergeMap, tap } from 'rxjs/operators';
// RxJS
import { delay, distinctUntilChanged, skip, filter, take, map } from 'rxjs/operators';
// NGRX
import { Store, select } from '@ngrx/store';
// CRUD
import { BaseDataSource, QueryResultsModel } from '../../_base/crud';
// State
import { AppState } from '../../reducers';
import { selectEmployeesInStore, selectEmployeesPageLoading, selectEmployeesShowInitWaitingMessage } from '../_selectors/employee.selectors';

export class EmployeesDataSource extends BaseDataSource {
	constructor(private store: Store<AppState>) {
		super();

		this.loading$ = this.store.pipe(
			select(selectEmployeesPageLoading),
		);

		this.isPreloadTextViewed$ = this.store.pipe(
			select(selectEmployeesShowInitWaitingMessage)
		);

		this.store.pipe(
			select(selectEmployeesInStore),
		).subscribe((response: QueryResultsModel) => {
			this.paginatorTotalSubject.next(response.total);
			this.entitySubject.next(response.data);
		});
	}
}
