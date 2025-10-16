import type { RouteRecordRaw } from 'vue-router';

import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    name: 'Identity',
    path: '/identity',
    meta: {
      icon: 'mdi:account-cog-outline',
      order: 21,
      title: $t('page.identity.title'),
    },
    children: [
      {
        name: 'User',
        path: '/identity/user',
        component: () => import('#/views/identity/user/index.vue'),
        meta: {
          icon: 'mdi:account-circle',
          title: $t('page.identity.user'),
        },
      },
      {
        name: 'Role',
        path: '/identity/role',
        component: () => import('#/views/identity/role/index.vue'),
        meta: {
          icon: 'mdi:account-check',
          title: $t('page.identity.role'),
        },
      },
      {
        name: 'OrganizationUnit',
        path: '/identity/organization',
        component: () => import('#/views/identity/organization/index.vue'),
        meta: {
          icon: 'mdi:office-building',
          title: $t('page.identity.organizationUnit'),
        },
      },
    ],
  },
];

export default routes;
