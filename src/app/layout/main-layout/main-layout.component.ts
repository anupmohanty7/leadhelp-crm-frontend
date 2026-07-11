import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import {
  NavbarComponent
} from '../navbar/navbar.component';

import {
  SidebarComponent
} from '../sidebar/sidebar.component';

import {
  NotesDrawerComponent
} from '../../shared/components/notes-drawer/notes-drawer.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    NavbarComponent,
    SidebarComponent,
    NotesDrawerComponent
  ],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.css'
})
export class MainLayoutComponent {

  sidebarCollapsed = false;
  notesDrawerOpen = false;

  toggleSidebar(): void {
    this.sidebarCollapsed =
      !this.sidebarCollapsed;
  }

  openNotesDrawer(): void {
    this.notesDrawerOpen = true;
  }

  closeNotesDrawer(): void {
    this.notesDrawerOpen = false;
  }
}