import request from '@/utils/http'

/**
 * 获取日志总览统计
 * @returns 统计数据
 */
export function fetchLogOverview(hours = 24) {
  return request.get<Api.Logs.OverviewStats>({
    url: '/api/logs/overview',
    params: { hours }
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

export function fetchFingerprintClusters(
  hours = 24,
  dimensions = ['profile_variant', 'proxy_country', 'hcaptcha_version'],
  minSamples = 1
) {
  return request.get<Api.Logs.FingerprintClusterResponse>({
    url: '/api/logs/fingerprint-clusters',
    params: {
      hours,
      dimensions: dimensions.join(','),
      min_samples: minSamples
    }
  })
}

/**
 * 立即同步当前 hCaptcha 日志
 */
export function syncLogs() {
  return request.post<Api.Logs.SyncResponse>({
    url: '/api/logs/sync'
  })
}

/**
 * 清空监控索引并回收 SQLite 空间，保留原始日志
 */
export function cleanupLogCache() {
  return request.post<Api.Logs.CleanupResponse>({
    url: '/api/logs/cleanup',
    data: { confirm: true }
  })
}

/**
 * 读取 hCaptcha SQLite 中的实时 Token 账本
 */
export function fetchTokenRecords() {
  return request.get<Api.Logs.TokenRecordList>({
    url: '/api/logs/tokens'
  })
}

/**
 * 新增 Token；相同 Token 会重置可用次数和状态
 */
export function createTokenRecord(payload: Api.Logs.TokenCreatePayload) {
  return request.post<Api.Logs.TokenRecord>({
    url: '/api/logs/tokens',
    data: payload
  })
}

/**
 * 按摘要 ID 更新 Token 账本字段
 */
export function updateTokenRecord(tokenId: string, payload: Api.Logs.TokenUpdatePayload) {
  return request.request<Api.Logs.TokenRecord>({
    url: `/api/logs/tokens/${tokenId}`,
    method: 'PATCH',
    data: payload
  })
}

/**
 * 删除 Token 及其已结算的预留历史
 */
export function deleteTokenRecord(tokenId: string) {
  return request.del<Api.Logs.TokenRecord>({
    url: `/api/logs/tokens/${tokenId}`
  })
}
