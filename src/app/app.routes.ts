import { Routes } from '@angular/router';

import { NotFound } from './error-routing/not-found/not-found';
import { UncaughtError } from './error-routing/error/uncaught-error';
import { HomeComponent } from './home/home.component';
import { PCBuilderComponent } from './pc-builder/pc-builder.component';
import { ComponentsComponent } from './components/components.component';
import { BuildSummaryComponent } from './build-summary/build-summary.component';
import { adminGuard, adminLoginGuard } from './services/admin.guards';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'error', component: UncaughtError },
  { path: 'home', component: HomeComponent, data: { text: 'Home' } },
  { path: 'pc-builder', component: PCBuilderComponent, data: { text: 'Pcbuilder' } },
  { path: 'components', component: ComponentsComponent, data: { text: 'Components' } },
  { path: 'build-summary', component: BuildSummaryComponent, data: { text: 'Build-Summary' } },
  // Admin pages load on demand so the storefront bundle doesn't carry the full data grid.
  {
    path: 'admin-backoffice',
    loadComponent: () => import('./admin-backoffice/admin-backoffice.component').then(m => m.AdminBackofficeComponent),
    canActivate: [adminGuard],
    data: { text: 'Admin-Backoffice' }
  },
  {
    path: 'admin-login',
    loadComponent: () => import('./admin-login/admin-login.component').then(m => m.AdminLoginComponent),
    canActivate: [adminLoginGuard],
    data: { text: 'Admin-Login' }
  },
  { path: '**', component: NotFound } // must always be last
];
