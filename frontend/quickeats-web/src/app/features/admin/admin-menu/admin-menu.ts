import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenuService } from '../../../core/services/menu.service';
import {MenuItem} from '../../../core/models/menu.model'; 
import {Router} from '@angular/router';

@Component({
  selector: 'app-admin-menu',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-menu.html',
  styleUrl: './admin-menu.scss',
})
export class AdminMenu {
  menus :MenuItem[] = [];
  constructor(
    private menuService: MenuService,
    private router: Router
  ) {
    this.loadMenus();
  }
  loadMenus():void {
    this.menuService.getMenus().subscribe({next :(data:MenuItem[]) => {
      this.menus = data;
      console.log(this.menus);
    },
   error: (err: any) => {

          console.log(err);

        }

      });
  
  

  }
  addMenu(): void {
    this.router.navigate(['/admin/add-menu']);
  }
  editMenu(menu: MenuItem): void {
    this.router.navigate(['/admin/edit-menu', menu.id]);
  }
 // Delete Menu.
deleteMenu(

id:number

):void{

this.menuService
.deleteMenu(id)
.subscribe({

next:()=>{

console.log(

"Menu Deleted"

);

// Reload Menu.
this.loadMenus();

},

error:(err:any)=>{

console.log(err);

}

});

}
  }