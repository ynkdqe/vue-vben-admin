import { initPreferences } from '@vben/preferences';
import { unmountGlobalLoading } from '@vben/utils';

import { overridesPreferences } from './preferences';

/**
 * After the application initialization is completed, the page loading and rendering is performed
 */
async function initApplication() {
  // name is used to specify the project's unique identity
  // Used to distinguish between preferences of different projects and key prefixes for storing data and some other data that needs to be isolated
  const env = import.meta.env.PROD ? 'prod' : 'dev';
  const appVersion = import.meta.env.VITE_APP_VERSION;
  const namespace = `${import.meta.env.VITE_APP_NAMESPACE}-${appVersion}-${env}`;

  // App preferences initialization
  await initPreferences({
    namespace,
    overrides: overridesPreferences,
  });

  // Start the application and mount it
  // The main logic and views of vue applications
  const { bootstrap } = await import('./bootstrap');
  await bootstrap(namespace);

  // Remove and destroy loading
  unmountGlobalLoading();
}

initApplication();
