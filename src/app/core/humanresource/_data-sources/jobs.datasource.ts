import { mergeMap, tap } from 'rxjs/operators';
// RxJS
import { delay, distinctUntilChanged, skip, filter, take, map } from 'rxjs/operators';
// NGRX
import { Store, select } from '@ngrx/store';
// CRUD
import { BaseDataSource, QueryResultsModel } from '../../_base/crud';
// State
import { AppState } from '../../reducers';
import { selectJobsInStore, selectJobsPageLoading, selectJobsShowInitWaitingMessage } from '../_selectors/job.selectors';

export class JobsDataSource extends BaseDataSource {
	constructor(private store: Store<AppState>) {
		super();

		this.loading$ = this.store.pipe(
			select(selectJobsPageLoading),
		);

		this.isPreloadTextViewed$ = this.store.pipe(
			select(selectJobsShowInitWaitingMessage)
		);

		this.store.pipe(
			select(selectJobsInStore),
		).subscribe((response: QueryResultsModel) => {
			this.paginatorTotalSubject.next(response.total);
			this.entitySubject.next(response.data);
		});
	}
}
