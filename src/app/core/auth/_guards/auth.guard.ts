// Angular
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
// RxJS
import { Observable } from 'rxjs';
import { tap,delay, skip } from 'rxjs/operators';
// NGRX
import { select, Store } from '@ngrx/store';
// Auth reducers and selectors
import { AppState} from '../../../core/reducers/';
import { isLoggedIn,currentUser } from '../_selectors/auth.selectors';

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private store: Store<AppState>, private router: Router) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean>  {
        return this.store
            .pipe(
                select(isLoggedIn),
                tap(isLogin => {
                    if (!isLogin) {
                        this.router.navigateByUrl('/auth/login');
                        return false;
                    }else{
                        return this.store.pipe(
                            select(currentUser),
                        ).subscribe(user=>{
                            if(user){
                                if(route.data.roles){
                                    if(route.data.roles.indexOf(user.roles[0]) > -1){
                                        if(user.type=="admin"){
                                            let contain = false;
                                            user.menus.forEach((menu)=>{
                                                if(menu.status == route.data.menus){
                                                    contain = true;
                                                }
                                            })
                                            if(contain==false){
                                                this.router.navigateByUrl('/');
                                                return false;
                                            }                        
                                        }
                                        return true;
                                    }else {
                                        this.router.navigateByUrl('/');
                                        return false;
                                    }
                                } 
                            }
                            return true;
                        });
                    }
                })
            );
    }
}
