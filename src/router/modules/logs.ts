import { AppRouteRecord } from '@/types/router'

export const logsRoutes: AppRouteRecord = {
  name: 'Logs',
  path: '/logs',
  component: '/index/index',
  meta: {
    title: '日志管理',
    icon: 'ri:file-list-line',
    roles: ['R_SUPER', 'R_ADMIN']
  },
  children: [
    {
      path: 'dashboard',
      name: 'LogsDashboard',
      component: '/logs/dashboard',
      meta: {
        title: '日志总览',
        keepAlive: true
      }
    },
    {
      path: 'list',
      name: 'LogsList',
      component: '/logs/list',
      meta: {
        title: '日志列表',
        keepAlive: true
      }
    },
    {
      path: 'detail/:requestId',
      name: 'LogsDetail',
      component: '/logs/detail',
      meta: {
        title: '日志详情',
        keepAlive: false,
        hideInMenu: true,
        activeMenu: '/logs/list'
      }
    }
  ]
}
