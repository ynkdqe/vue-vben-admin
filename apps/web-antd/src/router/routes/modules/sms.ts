import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    name: 'Sms',
    path: '/sms',
    meta: {
      icon: 'mdi:message-text-outline',
      order: 21,
      title: 'Sms',
    },
    children: [
      {
        name: 'SmsMessage',
        path: '/sms/message',
        component: () => import('#/views/sms/message/index.vue'),
        meta: {
          icon: 'mdi:message-processing-outline',
          title: 'Message',
        },
      },
      {
        name: 'SmsProvider',
        path: '/sms/provider',
        component: () => import('#/views/sms/provider/index.vue'),
        meta: {
          icon: 'mdi:server-outline',
          title: 'Provider',
        },
      },
      {
        name: 'SmsTemplate',
        path: '/sms/template',
        component: () => import('#/views/sms/template/index.vue'),
        meta: {
          icon: 'mdi:file-document-outline',
          title: 'Template',
        },
      },
      {
        name: 'SmsNotification',
        path: '/sms/notification',
        component: () => import('#/views/sms/notification/index.vue'),
        meta: {
          icon: 'mdi:bell-outline',
          title: 'Notification',
        },
      },
    ],
  },
];

export default routes;
