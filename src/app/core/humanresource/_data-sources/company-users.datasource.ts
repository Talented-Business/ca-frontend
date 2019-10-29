import { mergeMap, tap } from 'rxjs/operators';
// RxJS
import { delay, distinctUntilChanged, skip, filter, take, map } from 'rxjs/operators';
// NGRX
import { Store, select } from '@ngrx/store';
// CRUD
import { BaseDataSource, QueryResultsModel } from '../../_base/crud';
// State
import { AppState } from '../../reducers';
import { selectCompanyUsersInStore, selectCompanyUsersPageLoading, selectCompanyUsersShowInitWaitingMessage } from '../_selectors/company-user.selectors';

export class CompanyUsersDataSource extends BaseDataSource {
	constructor(private store: Store<AppState>) {
		super();

		this.loading$ = this.store.pipe(
			select(selectCompanyUsersPageLoading),
		);

		this.isPreloadTextViewed$ = this.store.pipe(
			select(selectCompanyUsersShowInitWaitingMessage)
		);

		this.store.pipe(
			select(selectCompanyUsersInStore),
		).subscribe((response: QueryResultsModel) => {
			this.paginatorTotalSubject.next(response.total);
			this.entitySubject.next(response.data);
		});
	}
}
