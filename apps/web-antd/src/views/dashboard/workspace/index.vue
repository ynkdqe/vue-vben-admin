<script lang="ts" setup>
import type {
  WorkbenchProjectItem,
  WorkbenchQuickNavItem,
  WorkbenchTodoItem,
  WorkbenchTrendItem,
} from '@vben/common-ui';

import { ref } from 'vue';
import { useRouter } from 'vue-router';

import {
  AnalysisChartCard,
  WorkbenchHeader,
  WorkbenchProject,
  WorkbenchQuickNav,
  WorkbenchTodo,
  WorkbenchTrends,
} from '@vben/common-ui';
import { preferences } from '@vben/preferences';
import { useUserStore } from '@vben/stores';
import { openWindow } from '@vben/utils';

import AnalyticsVisitsSource from '../analytics/analytics-visits-source.vue';

const userStore = useUserStore();

// This is a sample data, which needs to be adjusted according to the actual situation in actual projects.
// url It can also be an internal route, which is identified and processed in the navTo method to perform internal jumps.
// For example: url: /dashboard/workspace
const projectItems: WorkbenchProjectItem[] = [
  {
    color: '',
    content: '不要等待机会，而要创造机会。',
    date: '2021-04-01',
    group: '开源组',
    icon: 'carbon:logo-github',
    title: 'Github',
    url: 'https://github.com',
  },
  {
    color: '#3fb27f',
    content: '现在的你决定将来的你。',
    date: '2021-04-01',
    group: '算法组',
    icon: 'ion:logo-vue',
    title: 'Vue',
    url: 'https://vuejs.org',
  },
  {
    color: '#e18525',
    content: '没有什么才能比努力更重要。',
    date: '2021-04-01',
    group: '上班摸鱼',
    icon: 'ion:logo-html5',
    title: 'Html5',
    url: 'https://developer.mozilla.org/zh-CN/docs/Web/HTML',
  },
  {
    color: '#bf0c2c',
    content: '热情和欲望可以突破一切难关。',
    date: '2021-04-01',
    group: 'UI',
    icon: 'ion:logo-angular',
    title: 'Angular',
    url: 'https://angular.io',
  },
  {
    color: '#00d8ff',
    content: '健康的身体是实现目标的基石。',
    date: '2021-04-01',
    group: '技术牛',
    icon: 'bx:bxl-react',
    title: 'React',
    url: 'https://reactjs.org',
  },
  {
    color: '#EBD94E',
    content: '路是走出来的，而不是空想出来的。',
    date: '2021-04-01',
    group: '架构组',
    icon: 'ion:logo-javascript',
    title: 'Js',
    url: 'https://developer.mozilla.org/zh-CN/docs/Web/JavaScript',
  },
];

// Similarly, the url here can also use external links starting with http
const quickNavItems: WorkbenchQuickNavItem[] = [
  {
    color: '#1fdaca',
    icon: 'ion:home-outline',
    title: '首页',
    url: '/',
  },
  {
    color: '#bf0c2c',
    icon: 'ion:grid-outline',
    title: '仪表盘',
    url: '/dashboard',
  },
  {
    color: '#e18525',
    icon: 'ion:layers-outline',
    title: '组件',
    url: '/demos/features/icons',
  },
  {
    color: '#3fb27f',
    icon: 'ion:settings-outline',
    title: '系统管理',
    url: '/demos/features/login-expired', // 这里的 URL 是示例，实际项目中需要根据实际情况进行调整
  },
  {
    color: '#4daf1bc9',
    icon: 'ion:key-outline',
    title: '权限管理',
    url: '/demos/access/page-control',
  },
  {
    color: '#00d8ff',
    icon: 'ion:bar-chart-outline',
    title: '图表',
    url: '/analytics',
  },
];

const todoItems = ref<WorkbenchTodoItem[]>([
  {
    completed: false,
    content: `Review the front-end code recently submitted to the Git repository to ensure code quality and specification. `,
    date: '2024-07-30 11:00:00',
    title: 'Review front-end code submission',
  },
  {
    completed: true,
    content: `Check and optimize system performance to reduce CPU usage.`,
    date: '2024-07-30 11:00:00',
    title: 'System performance optimization',
  },
  {
    completed: false,
    content: `Check the system security check to ensure there are no security vulnerabilities or unauthorized access. `,
    date: '2024-07-30 11:00:00',
    title: 'Safety Check',
  },
  {
    completed: false,
    content: `Update all npm dependencies in the project and make sure to use the latest version. `,
    date: '2024-07-30 11:00:00',
    title: 'Update project dependencies',
  },
  {
    completed: false,
    content: `Fixed the page UI display problem reported by the user to ensure that the display is consistent in different browsers. `,
    date: '2024-07-30 11:00:00',
    title: 'Fixed UI display problem',
  },
]);

const trendItems: WorkbenchTrendItem[] = [
  {
    avatar: 'svg:avatar-1',
    content: `Vừa tạo đơn xin nghỉ phép`,
    date: 'just',
    title: 'Nguyễn Duy Anh',
  },
  {
    avatar: 'svg:avatar-2',
    content: `Followed <a>William</a> `,
    date: '1 hour ago',
    title: 'Evan',
  },
  {
    avatar: 'svg:avatar-3',
    content: `Published <a>personal dynamics</a> `,
    date: '1 hour ago',
    title: 'Chris',
  },
  {
    avatar: 'svg:avatar-4',
    content: `Published article <a>How to write a Vite plugin</a> `,
    date: '2 days ago',
    title: 'Vben',
  },
  {
    avatar: 'svg:avatar-1',
    content: `Replied to <a>Jack</a>'s question <a>How to optimize the project?</a>`,
    date: '3 days ago',
    title: 'Peter',
  },
  {
    avatar: 'svg:avatar-2',
    content: `Closed the issue <a>How to run the project</a> `,
    date: '1 week ago',
    title: 'Jack',
  },
  {
    avatar: 'svg:avatar-3',
    content: `Published <a>personal dynamics</a> `,
    date: '1 week ago',
    title: 'William',
  },
  {
    avatar: 'svg:avatar-4',
    content: `Pushed the code to <a>Github</a>`,
    date: '2021-04-01 20:00',
    title: 'William',
  },
  {
    avatar: 'svg:avatar-4',
    content: `Post an article <a>How to write and use Admin Vben</a> `,
    date: '2021-03-01 20:00',
    title: 'Vben',
  },
];

const router = useRouter();

// This is an example method, which needs to be adjusted according to the actual situation in the actual project
// This is a sample method, adjust according to the actual project requirements
function navTo(nav: WorkbenchProjectItem | WorkbenchQuickNavItem) {
  if (nav.url?.startsWith('http')) {
    openWindow(nav.url);
    return;
  }
  if (nav.url?.startsWith('/')) {
    router.push(nav.url).catch((error) => {
      console.error('Navigation failed:', error);
    });
  } else {
    console.warn(`Unknown URL for navigation item: ${nav.title} -> ${nav.url}`);
  }
}
</script>

<template>
  <div class="p-5">
    <WorkbenchHeader
      :avatar="userStore.userInfo?.avatar || preferences.app.defaultAvatar"
    >
      <template #title>
        Hello, {{ userStore.userInfo?.name }}, Start your day's work！
      </template>
      <template #description> 今日晴，20℃ - 32℃！ </template>
    </WorkbenchHeader>

    <div class="mt-5 flex flex-col lg:flex-row">
      <div class="mr-4 w-full lg:w-3/5">
        <WorkbenchProject :items="projectItems" title="项目" @click="navTo" />
        <WorkbenchTrends :items="trendItems" class="mt-5" title="Tin tức mới" />
      </div>
      <div class="w-full lg:w-2/5">
        <WorkbenchQuickNav
          :items="quickNavItems"
          class="mt-5 lg:mt-0"
          title="快捷导航"
          @click="navTo"
        />
        <WorkbenchTodo :items="todoItems" class="mt-5" title="待办事项" />
        <AnalysisChartCard class="mt-5" title="访问来源">
          <AnalyticsVisitsSource />
        </AnalysisChartCard>
      </div>
    </div>
  </div>
</template>
