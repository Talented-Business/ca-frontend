import { mergeMap, tap } from 'rxjs/operators';
// RxJS
import { delay, distinctUntilChanged, skip, filter, take, map } from 'rxjs/operators';
// NGRX
import { Store, select } from '@ngrx/store';
// CRUD
import { BaseDataSource, QueryResultsModel } from '../../_base/crud';
// State
import { AppState } from '../../reducers';
import { selectTimeoffsInStore, selectTimeoffsPageLoading, selectTimeoffsShowInitWaitingMessage } from '../_selectors/timeoff.selectors';

export class TimeoffsDataSource extends BaseDataSource {
	constructor(private store: Store<AppState>) {
		super();

		this.loading$ = this.store.pipe(
			select(selectTimeoffsPageLoading),
		);

		this.isPreloadTextViewed$ = this.store.pipe(
			select(selectTimeoffsShowInitWaitingMessage)
		);

		this.store.pipe(
			select(selectTimeoffsInStore),
		).subscribe((response: QueryResultsModel) => {
			this.paginatorTotalSubject.next(response.total);
			this.entitySubject.next(response.data);
		});
	}
}
