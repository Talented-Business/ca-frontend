import { mergeMap, tap } from 'rxjs/operators';
// RxJS
import { delay, distinctUntilChanged, skip, filter, take, map } from 'rxjs/operators';
// NGRX
import { Store, select } from '@ngrx/store';
// CRUD
import { BaseDataSource, QueryResultsModel } from '../../_base/crud';
// State
import { AppState } from '../../reducers';
import { selectProposalsInStore, selectProposalsPageLoading, selectProposalsShowInitWaitingMessage } from '../_selectors/proposal.selectors';

export class ProposalsDataSource extends BaseDataSource {
	constructor(private store: Store<AppState>) {
		super();

		this.loading$ = this.store.pipe(
			select(selectProposalsPageLoading),
		);

		this.isPreloadTextViewed$ = this.store.pipe(
			select(selectProposalsShowInitWaitingMessage)
		);

		this.store.pipe(
			select(selectProposalsInStore),
		).subscribe((response: QueryResultsModel) => {
			this.paginatorTotalSubject.next(response.total);
			this.entitySubject.next(response.data);
		});
	}
}
