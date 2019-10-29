import { mergeMap, tap } from 'rxjs/operators';
// RxJS
import { delay, distinctUntilChanged, skip, filter, take, map } from 'rxjs/operators';
// NGRX
import { Store, select } from '@ngrx/store';
// CRUD
import { BaseDataSource, QueryResultsModel } from '../../_base/crud';
// State
import { AppState } from '../../reducers';
import { selectAssetsInStore, selectAssetsPageLoading, selectAssetsShowInitWaitingMessage } from '../_selectors/asset.selectors';

export class AssetsDataSource extends BaseDataSource {
	constructor(private store: Store<AppState>) {
		super();

		this.loading$ = this.store.pipe(
			select(selectAssetsPageLoading),
		);

		this.isPreloadTextViewed$ = this.store.pipe(
			select(selectAssetsShowInitWaitingMessage)
		);

		this.store.pipe(
			select(selectAssetsInStore),
		).subscribe((response: QueryResultsModel) => {
			this.paginatorTotalSubject.next(response.total);
			this.entitySubject.next(response.data);
		});
	}
}
