import { mergeMap, tap } from 'rxjs/operators';
// RxJS
import { delay, distinctUntilChanged, skip, filter, take, map } from 'rxjs/operators';
// NGRX
import { Store, select } from '@ngrx/store';
// CRUD
import { BaseDataSource, QueryResultsModel } from '../../_base/crud';
// State
import { AppState } from '../../reducers';
import { selectAssetAssignsInStore, selectAssetAssignsPageLoading, selectAssetAssignsShowInitWaitingMessage } from '../_selectors/asset-assign.selectors';

export class AssetAssignsDataSource extends BaseDataSource {
	constructor(private store: Store<AppState>) {
		super();

		this.loading$ = this.store.pipe(
			select(selectAssetAssignsPageLoading),
		);

		this.isPreloadTextViewed$ = this.store.pipe(
			select(selectAssetAssignsShowInitWaitingMessage)
		);

		this.store.pipe(
			select(selectAssetAssignsInStore),
		).subscribe((response: QueryResultsModel) => {
			this.paginatorTotalSubject.next(response.total);
			this.entitySubject.next(response.data);
		});
	}
}
