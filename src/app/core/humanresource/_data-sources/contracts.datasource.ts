import { mergeMap, tap } from 'rxjs/operators';
// RxJS
import { delay, distinctUntilChanged, skip, filter, take, map } from 'rxjs/operators';
// NGRX
import { Store, select } from '@ngrx/store';
// CRUD
import { BaseDataSource, QueryResultsModel } from '../../_base/crud';
// State
import { AppState } from '../../reducers';
import { selectContractsInStore, selectContractsPageLoading, selectContractsShowInitWaitingMessage } from '../_selectors/contract.selectors';

export class ContractsDataSource extends BaseDataSource {
	constructor(private store: Store<AppState>) {
		super();

		this.loading$ = this.store.pipe(
			select(selectContractsPageLoading),
		);

		this.isPreloadTextViewed$ = this.store.pipe(
			select(selectContractsShowInitWaitingMessage)
		);

		this.store.pipe(
			select(selectContractsInStore),
		).subscribe((response: QueryResultsModel) => {
			this.paginatorTotalSubject.next(response.total);
			this.entitySubject.next(response.data);
		});
	}
}
