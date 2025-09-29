import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    name: 'Hrms',
    path: '/hrms',
    meta: {
      icon: 'mdi:briefcase-account-outline',
      order: 20,
      title: 'HRMS',
    },
    children: [
      {
        name: 'HrmsEmployee',
        path: '/hrms/employee',
        component: () => import('#/views/hrms/employee/index.vue'),
        meta: {
          icon: 'mdi:account-group-outline',
          title: 'Employee',
        },
      },
      {
        name: 'HrmsContract',
        path: '/hrms/contract',
        component: () => import('#/views/hrms/contract/index.vue'),
        meta: {
          icon: 'mdi:file-document-edit-outline',
          title: 'Contract',
        },
      },
      {
        name: 'HrmsWorkShift',
        path: '/hrms/work-shift',
        component: () => import('#/views/hrms/work-shift/index.vue'),
        meta: {
          icon: 'mdi:clock-time-eight-outline',
          title: 'Work Shift',
        },
      },
      {
        name: 'HrmsSpreadsheet',
        path: '/hrms/spreadsheet',
        component: () => import('#/views/hrms/spreadsheet/index.vue'),
        meta: {
          icon: 'mdi:table-large',
          title: 'Spreadsheet',
        },
      },
    ],
  },
];

export default routes;
