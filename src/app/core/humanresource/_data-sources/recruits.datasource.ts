import { mergeMap, tap } from 'rxjs/operators';
// RxJS
import { delay, distinctUntilChanged, skip, filter, take, map } from 'rxjs/operators';
// NGRX
import { Store, select } from '@ngrx/store';
// CRUD
import { BaseDataSource, QueryResultsModel } from '../../_base/crud';
// State
import { AppState } from '../../reducers';
import { selectRecruitsInStore, selectRecruitsPageLoading, selectRecruitsShowInitWaitingMessage } from '../_selectors/recruit.selectors';

export class RecruitsDataSource extends BaseDataSource {
	constructor(private store: Store<AppState>) {
		super();

		this.loading$ = this.store.pipe(
			select(selectRecruitsPageLoading),
		);

		this.isPreloadTextViewed$ = this.store.pipe(
			select(selectRecruitsShowInitWaitingMessage)
		);

		this.store.pipe(
			select(selectRecruitsInStore),
		).subscribe((response: QueryResultsModel) => {
			this.paginatorTotalSubject.next(response.total);
			this.entitySubject.next(response.data);
		});
	}
}
