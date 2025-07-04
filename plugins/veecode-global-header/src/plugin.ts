import {
  createPlugin,
  createComponentExtension,
} from '@backstage/core-plugin-api';

import { rootRouteRef } from './routes';

export const veecodeGlobalHeaderPlugin = createPlugin({
  id: 'veecode-global-header',
  routes: {
    root: rootRouteRef,
  },
});

export const VeecodeGlobalHeader = veecodeGlobalHeaderPlugin.provide(
  createComponentExtension({
    name: 'VeecodeGlobalHeader',
    component: {
      lazy: () =>
        import('./components/VeeCodeGlobalHeader').then(
          m => m.VeeCodeGlobalHeader,
        ),
    },
  }),
);
