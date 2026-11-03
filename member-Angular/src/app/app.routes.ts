import { Routes } from '@angular/router';
import { DisplayMembers } from './components/display-members/display-members';
import { AddMember } from './components/add-member/add-member';

export const routes: Routes = [
  { path: 'display-member', component: DisplayMembers },
  { path: 'add-member', component: AddMember },
  { path: 'edit-member/:id', component: AddMember },
  { path: '', redirectTo: '/display-member', pathMatch: 'full' },
];
