// RxJS
import { of } from 'rxjs';
import { catchError, finalize, tap, debounceTime, delay, distinctUntilChanged } from 'rxjs/operators';
// NGRX
import { Store, select } from '@ngrx/store';
// CRUD
import { BaseDataSource, QueryResultsModel } from '../../_base/crud';
// State
import { AppState } from '../../reducers';
// Selectirs
import { selectQueryResult, selectAttributesPageLoading, selectAttributesShowInitWaitingMessage } from '../_selectors/attribute.selectors';

export class AttributesDataSource extends BaseDataSource {
	constructor(private store: Store<AppState>) {
		super();

		this.loading$ = this.store.pipe(
			select(selectAttributesPageLoading)
		);

		this.isPreloadTextViewed$ = this.store.pipe(
			select(selectAttributesShowInitWaitingMessage)
		);

		this.store.pipe(
			select(selectQueryResult)
		).subscribe((response: QueryResultsModel) => {
			this.entitySubject.next(response.data);
		});

	}
}
