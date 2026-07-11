import { CommonModule } from '@angular/common';

import {
  Component,
  Input,
  OnInit
} from '@angular/core';

import {
  Router,
  RouterLink,
  RouterLinkActive
} from '@angular/router';

import {
  AuthResponse
} from '../../shared/models/auth-response';

import {
  AuthService
} from '../../shared/services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent implements OnInit {

  @Input()
  collapsed = false;

  currentUser: AuthResponse | null = null;
  profileMenuOpen = false;

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router
  ) {
  }

  ngOnInit(): void {
    this.currentUser =
      this.authService.getLoggedInUser();
  }

  toggleProfileMenu(): void {
    this.profileMenuOpen =
      !this.profileMenuOpen;
  }

  logout(): void {
    this.authService.logout();

    this.router.navigate(['/login']);
  }

  getInitials(): string {
    const fullName =
      this.currentUser?.fullName ??
      this.currentUser?.username ??
      'User';

    return fullName
      .split(' ')
      .filter(part => part.length > 0)
      .slice(0, 2)
      .map(part =>
        part.charAt(0).toUpperCase()
      )
      .join('');
  }

  getDisplayName(): string {
    return (
      this.currentUser?.fullName ??
      this.currentUser?.username ??
      'CRM User'
    );
  }

  getDisplayRole(): string {
    const role =
      this.currentUser?.role ??
      'USER';

    return role
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(
        /\b\w/g,
        character => character.toUpperCase()
      );
  }
}