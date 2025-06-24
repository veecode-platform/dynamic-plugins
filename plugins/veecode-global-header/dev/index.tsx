import { createDevApp } from '@backstage/dev-utils';
import { VeecodeGlobalHeader, veecodeGlobalHeaderPlugin } from '../src/plugin';

createDevApp()
  .registerPlugin(veecodeGlobalHeaderPlugin)
  .addPage({
    element: <VeecodeGlobalHeader />,
    title: 'Root Page',
    path: '/',
  })
  .render();
