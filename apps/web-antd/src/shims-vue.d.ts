// Declares Vue SFC modules for TypeScript
// This file helps tsc resolve imports for `*.vue` files in this package
declare module '*.vue' {
  import type { DefineComponent } from 'vue';

  // Use Record<string, unknown> for props/slots/rawBindings for stricter typing
  const component: DefineComponent<
    Record<string, unknown>,
    Record<string, unknown>,
    unknown
  >;
  export default component;
}
