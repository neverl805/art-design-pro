import request from '@/utils/http'

/**
 * 获取日志总览统计
 * @returns 统计数据
 */
export function fetchLogOverview() {
  return request.get<Api.Logs.OverviewStats>({
    url: '/api/logs/overview'
  })
}

/**
 * 获取日志列表
 * @param params 搜索参数
 * @returns 日志列表
 */
export function fetchLogList(params: Api.Logs.SearchParams) {
  return request.get<Api.Logs.ListResponse>({
    url: '/api/logs/list',
    params
  })
}

/**
 * 获取日志详情
 * @param requestId 请求ID
 * @returns 日志详情
 */
export function fetchLogDetail(requestId: string) {
  return request.get<Api.Logs.LogGroup>({
    url: `/api/logs/detail/${requestId}`
  })
}

/**
 * 清除旧日志
 * @param days 保留最近N天的日志
 * @returns 删除结果
 */
export function cleanOldLogs(days: number) {
  return request.del<Api.Logs.CleanLogsResponse>({
    url: '/api/logs/clean',
    params: { days }
  })
}
