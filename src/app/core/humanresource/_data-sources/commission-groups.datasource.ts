import { mergeMap, tap } from 'rxjs/operators';
// RxJS
import { delay, distinctUntilChanged, skip, filter, take, map } from 'rxjs/operators';
// NGRX
import { Store, select } from '@ngrx/store';
// CRUD
import { BaseDataSource, QueryResultsModel } from '../../_base/crud';
// State
import { AppState } from '../../reducers';
import { selectCommissionGroupsInStore, selectCommissionGroupsPageLoading, selectCommissionGroupsShowInitWaitingMessage } from '../_selectors/commission-group.selectors';

export class CommissionGroupsDataSource extends BaseDataSource {
	constructor(private store: Store<AppState>) {
		super();

		this.loading$ = this.store.pipe(
			select(selectCommissionGroupsPageLoading),
		);

		this.isPreloadTextViewed$ = this.store.pipe(
			select(selectCommissionGroupsShowInitWaitingMessage)
		);

		this.store.pipe(
			select(selectCommissionGroupsInStore),
		).subscribe((response: QueryResultsModel) => {
			this.paginatorTotalSubject.next(response.total);
			this.entitySubject.next(response.data);
		});
	}
}
