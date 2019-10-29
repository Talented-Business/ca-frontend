import { mergeMap, tap } from 'rxjs/operators';
// RxJS
import { delay, distinctUntilChanged, skip, filter, take, map } from 'rxjs/operators';
// NGRX
import { Store, select } from '@ngrx/store';
// CRUD
import { BaseDataSource, QueryResultsModel } from '../../_base/crud';
// State
import { AppState } from '../../reducers';
import { selectInvoicesInStore, selectInvoicesPageLoading, selectInvoicesShowInitWaitingMessage } from '../_selectors/invoice.selectors';

export class InvoicesDataSource extends BaseDataSource {
	constructor(private store: Store<AppState>) {
		super();

		this.loading$ = this.store.pipe(
			select(selectInvoicesPageLoading),
		);

		this.isPreloadTextViewed$ = this.store.pipe(
			select(selectInvoicesShowInitWaitingMessage)
		);

		this.store.pipe(
			select(selectInvoicesInStore),
		).subscribe((response: QueryResultsModel) => {
			this.paginatorTotalSubject.next(response.total);
			this.entitySubject.next(response.data);
		});
	}
}
