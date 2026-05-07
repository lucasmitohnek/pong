import { Routes } from '@angular/router';
import { Menu } from './components/menu/menu';
import { Standard } from './components/Modes/Standard/standard';
import { Vscom } from './components/Modes/vscom/vscom';
import { Squash } from './components/Modes/squash/squash';

export const routes: Routes = [
  {
    path: '',
    component: Menu,
  },
  {
    path: 'standard',
    component: Standard,
  },
  {
    path: 'vscom',
    component: Vscom,
  },
  {
    path: 'squash',
    component: Squash,
  },
];
