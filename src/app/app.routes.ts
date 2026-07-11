import { Routes } from '@angular/router';

import {
  MainLayoutComponent
} from './layout/main-layout/main-layout.component';

import {
  CustomersComponent
} from './pages/customers/customers.component';

import {
  DashboardComponent
} from './pages/dashboard/dashboard.component';

import {
  FollowUpsComponent
} from './pages/follow-ups/follow-ups.component';

import {
  LeadTypesComponent
} from './pages/lead-types/lead-types.component';

import {
  LoginComponent
} from './pages/login/login.component';

import {
  ReportsComponent
} from './pages/reports/reports.component';

import {
  SettingsComponent
} from './pages/settings/settings.component';

import {
  SignupComponent
} from './pages/signup/signup.component';

import {
  authGuard
} from './shared/guards/auth.guard';

export const routes: Routes = [

  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },

  {
    path: 'login',
    component: LoginComponent
  },

  {
    path: 'signup',
    component: SignupComponent
  },

  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],

    children: [

      {
        path: 'dashboard',
        component: DashboardComponent
      },

      {
        path: 'customers',
        component: CustomersComponent
      },

      {
        path: 'lead-types',
        component: LeadTypesComponent
      },

      {
        path: 'follow-ups',
        component: FollowUpsComponent
      },

      {
        path: 'reports',
        component: ReportsComponent
      },

      {
        path: 'settings',
        component: SettingsComponent
      }

    ]
  },

  {
    path: '**',
    redirectTo: 'login'
  }

];