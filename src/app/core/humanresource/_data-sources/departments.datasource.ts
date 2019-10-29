// RxJS
import { of } from 'rxjs';
import { catchError, finalize, tap, debounceTime, delay, distinctUntilChanged } from 'rxjs/operators';
// NGRX
import { Store, select } from '@ngrx/store';
// CRUD
import { BaseDataSource, QueryResultsModel } from '../../_base/crud';
// State
import { AppState } from '../../reducers';
// Selectirs
import { selectQueryResult, selectDepartmentsPageLoading, selectDepartmentsShowInitWaitingMessage } from '../_selectors/department.selectors';

export class DepartmentsDataSource extends BaseDataSource {
	constructor(private store: Store<AppState>) {
		super();

		this.loading$ = this.store.pipe(
			select(selectDepartmentsPageLoading)
		);

		this.isPreloadTextViewed$ = this.store.pipe(
			select(selectDepartmentsShowInitWaitingMessage)
		);

		this.store.pipe(
			select(selectQueryResult)
		).subscribe((response: QueryResultsModel) => {
			this.entitySubject.next(response.data);
		});

	}
}
