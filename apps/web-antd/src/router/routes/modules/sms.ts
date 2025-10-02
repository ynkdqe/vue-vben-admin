import type { RouteRecordRaw } from 'vue-router';

import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    name: 'Sms',
    path: '/sms',
    meta: {
      icon: 'mdi:message-text-outline',
      order: 21,
      title: $t('page.sms.title'),
    },
    children: [
      {
        name: 'SmsMessage',
        path: '/sms/message',
        component: () => import('#/views/sms/message/index.vue'),
        meta: {
          icon: 'mdi:message-processing-outline',
          title: $t('page.sms.message'),
        },
      },
      {
        name: 'SmsProvider',
        path: '/sms/provider',
        component: () => import('#/views/sms/provider/index.vue'),
        meta: {
          icon: 'mdi:server-outline',
          title: $t('page.sms.provider'),
        },
      },
      {
        name: 'SmsTemplate',
        path: '/sms/template',
        component: () => import('#/views/sms/template/index.vue'),
        meta: {
          icon: 'mdi:file-document-outline',
          title: $t('page.sms.template'),
        },
      },
      {
        name: 'SmsNotification',
        path: '/sms/notification',
        component: () => import('#/views/sms/notification/index.vue'),
        meta: {
          icon: 'mdi:bell-outline',
          title: $t('page.sms.notification'),
        },
      },
    ],
  },
];

export default routes;
