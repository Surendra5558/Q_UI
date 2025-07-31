import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { adminGuard, userGuard } from './auth/services/auth.guard';
import { ClientListComponent } from './admin/client-list/client-list.component';
import { UserListComponent } from './admin/user-list/user-list.component';
import { ClientTemplateListComponent } from './admin/client-template-list/client-template-list/client-template-list.component';
import { QuoestionairesummaryComponent } from './user/quoestionaireSummary/quoestionairesummary/quoestionairesummary.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  {
    path: 'admin',
    canActivate: [adminGuard],
    children: [
      { path: 'clients', component: ClientListComponent },
      { path: 'users', component: UserListComponent },
      { path: 'clientTemplates', component: ClientTemplateListComponent },
      { path: 'questionnaireSummary', component: QuoestionairesummaryComponent }
    ]
  },
  {
    path: 'user',
    canActivate: [userGuard],
    children: [
      { path: 'clientTemplates', component: ClientTemplateListComponent },
      { path: 'questionnaireSummary', component: QuoestionairesummaryComponent },
      { path: '', redirectTo: 'clientTemplates', pathMatch: 'full' }
    ]
  },
  { path: '**', redirectTo: 'login' }
];