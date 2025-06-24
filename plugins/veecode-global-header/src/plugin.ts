import {
  createPlugin,
  createRoutableExtension,
} from '@backstage/core-plugin-api';

import { rootRouteRef } from './routes';

export const veecodeGlobalHeaderPlugin = createPlugin({
  id: 'veecode-global-header',
  routes: {
    root: rootRouteRef,
  },
});

export const VeecodeGlobalHeader = veecodeGlobalHeaderPlugin.provide(
  createRoutableExtension({
    name: 'VeecodeGlobalHeader',
    component: () =>
      import('./components/VeeCodeGlobalHeader').then(
        m => m.VeeCodeGlobalHeader,
      ),
    mountPoint: rootRouteRef,
  }),
);
