import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthResponse } from '../../shared/models/auth-response';
import { AuthService } from '../../shared/services/auth.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css'
})
export class SettingsComponent implements OnInit {

  currentUser: AuthResponse | null = null;

  companyName = 'LeadHelp CRM';
  theme = 'LIGHT';
  notificationsEnabled = true;

  successMessage = '';

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router
  ) {
  }

  ngOnInit(): void {
    this.currentUser =
      this.authService.getLoggedInUser();

    this.loadSavedSettings();
  }

  saveSettings(): void {
    localStorage.setItem(
      'leadhelpSettings',
      JSON.stringify({
        companyName: this.companyName,
        theme: this.theme,
        notificationsEnabled:
          this.notificationsEnabled
      })
    );

    this.applyTheme();

    this.successMessage =
      'Settings saved successfully.';

    setTimeout(() => {
      this.successMessage = '';
    }, 2500);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  getInitials(): string {
    const name =
      this.currentUser?.fullName ??
      this.currentUser?.username ??
      'User';

    return name
      .split(' ')
      .filter(part => part.length > 0)
      .slice(0, 2)
      .map(part =>
        part.charAt(0).toUpperCase()
      )
      .join('');
  }

  getRoleName(): string {
    return (
      this.currentUser?.role ??
      'USER'
    )
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(
        /\b\w/g,
        character =>
          character.toUpperCase()
      );
  }

  private loadSavedSettings(): void {
    const storedSettings =
      localStorage.getItem(
        'leadhelpSettings'
      );

    if (!storedSettings) {
      return;
    }

    try {
      const settings =
        JSON.parse(storedSettings);

      this.companyName =
        settings.companyName ??
        'LeadHelp CRM';

      this.theme =
        settings.theme ??
        'LIGHT';

      this.notificationsEnabled =
        settings.notificationsEnabled ??
        true;

      this.applyTheme();
    } catch {
      localStorage.removeItem(
        'leadhelpSettings'
      );
    }
  }

  private applyTheme(): void {
    document.body.classList.toggle(
      'dark-theme',
      this.theme === 'DARK'
    );
  }
}