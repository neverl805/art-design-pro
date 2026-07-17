import { AppRouteRecord } from '@/types/router'

export const logsRoutes: AppRouteRecord = {
  name: 'Logs',
  path: '/logs',
  component: '/index/index',
  meta: {
    title: 'hCaptcha 监控',
    icon: 'ri:pulse-line',
    roles: ['R_SUPER', 'R_ADMIN']
  },
  children: [
    {
      path: 'dashboard',
      name: 'LogsDashboard',
      component: '/logs/dashboard',
      meta: {
        title: '服务总览',
        keepAlive: true
      }
    },
    {
      path: 'list',
      name: 'LogsList',
      component: '/logs/list',
      meta: {
        title: '请求记录',
        keepAlive: true
      }
    },
    {
      path: 'tokens',
      name: 'LogsTokens',
      component: '/logs/tokens',
      meta: {
        title: 'Token 管理',
        keepAlive: true
      }
    },
    {
      path: 'detail/:requestId',
      name: 'LogsDetail',
      component: '/logs/detail',
      meta: {
        title: '请求详情',
        keepAlive: false,
        isHide: true,
        activePath: '/logs/list'
      }
    }
  ]
}
