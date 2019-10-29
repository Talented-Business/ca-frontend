// Angular
import { Injectable } from '@angular/core';
// RxJS
import { Subject } from 'rxjs';
import { currentUser } from '../../../auth';

@Injectable()
export class MenuConfigService {
	// Public properties
	onConfigUpdated$: Subject<any>;
	// Private properties
	private menuConfig: any;

	/**
	 * Service Constructor
	 */
	constructor() {
		// register on config changed event and set default config
		this.onConfigUpdated$ = new Subject();
	}

	/**
	 * Returns the menuConfig
	 */
	getMenus() {
		return this.menuConfig;
	}

	/**
	 * Load config
	 *
	 * @param config: any
	 */
	loadConfigs(config: any, store:any) {
		store.select(currentUser).subscribe(user=>{
			if(user !=undefined){
				let menus:any = Object.assign({}, config[user.type]);
				let items:any = [];
				if(user.type=='admin'){
					menus.header.items.forEach((item)=>{
						if(item.slug){
							user.menus.forEach((menu)=>{
								if(menu.status == item.slug){
									items.push(item);		
								}
							})
						}else{
							if(item.title=="Others"){
								let submenus = [];
								item.submenu.forEach((subMenuItem)=>{
									if(subMenuItem.slug){
										user.menus.forEach((menu)=>{
											if(menu.status == subMenuItem.slug){
												submenus.push(subMenuItem);		
											}
										})
									}else{
										submenus.push(subMenuItem);
									}
								})
								item.submenu = submenus;
							}
							items.push(item);
						}
					});
					menus.header.items = items;
				}
				this.menuConfig = menus;
				console.log(this.menuConfig);
				this.onConfigUpdated$.next(this.menuConfig);
			}
		})
	
	}
}
