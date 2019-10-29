import { mergeMap, tap } from 'rxjs/operators';
// RxJS
import { delay, distinctUntilChanged, skip, filter, take, map } from 'rxjs/operators';
// NGRX
import { Store, select } from '@ngrx/store';
// CRUD
import { BaseDataSource, QueryResultsModel } from '../../_base/crud';
// State
import { AppState } from '../../reducers';
import { selectEventsInStore, selectEventsPageLoading, selectEventsShowInitWaitingMessage } from '../_selectors/event.selectors';

export class EventsDataSource extends BaseDataSource {
	constructor(private store: Store<AppState>) {
		super();

		this.loading$ = this.store.pipe(
			select(selectEventsPageLoading),
		);

		this.isPreloadTextViewed$ = this.store.pipe(
			select(selectEventsShowInitWaitingMessage)
		);

		this.store.pipe(
			select(selectEventsInStore),
		).subscribe((response: QueryResultsModel) => {
			this.paginatorTotalSubject.next(response.total);
			this.entitySubject.next(response.data);
		});
	}
}
