import type { RouteRecordRaw } from 'vue-router';

import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'ic:baseline-view-in-ar',
      keepAlive: true,
      order: 1000,
      title: $t('demos.title'),
    },
    name: 'Demos',
    path: '/demos',
    children: [
      {
        meta: {
          title: $t('demos.antd'),
        },
        name: 'AntDesignDemos',
        path: '/demos/ant-design',
        component: () => import('#/views/demos/antd/index.vue'),
      },
      {
        meta: {
          title: $t('demos.widget'),
        },
        name: 'WidgetDemos',
        path: '/demos/widget',
        component: () => import('#/views/demos/widget/index.vue'),
      },
      {
        meta: {
          title: 'Switch Merchant',
        },
        name: 'SwitchMerchantDemos',
        path: '/demos/switch-merchant',
        component: () => import('#/views/demos/switch-merchant/index.vue'),
      },
    ],
  },
];

export default routes;
