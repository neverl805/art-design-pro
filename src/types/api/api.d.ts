/**
 * API 接口类型定义模块
 *
 * 提供所有后端接口的类型定义
 *
 * ## 主要功能
 *
 * - 通用类型（分页参数、响应结构等）
 * - 认证类型（登录、用户信息等）
 * - 系统管理类型（用户、角色等）
 * - 全局命名空间声明
 *
 * ## 使用场景
 *
 * - API 请求参数类型约束
 * - API 响应数据类型定义
 * - 接口文档类型同步
 *
 * ## 注意事项
 *
 * - 在 .vue 文件使用需要在 eslint.config.mjs 中配置 globals: { Api: 'readonly' }
 * - 使用全局命名空间，无需导入即可使用
 *
 * ## 使用方式
 *
 * ```typescript
 * const params: Api.Auth.LoginParams = { userName: 'admin', password: '123456' }
 * const response: Api.Auth.UserInfo = await fetchUserInfo()
 * ```
 *
 * @module types/api/api
 * @author Art Design Pro Team
 */

declare namespace Api {
  /** 通用类型 */
  namespace Common {
    /** 分页参数 */
    interface PaginationParams {
      /** 当前页码 */
      current: number
      /** 每页条数 */
      size: number
      /** 总条数 */
      total: number
    }

    /** 通用搜索参数 */
    type CommonSearchParams = Pick<PaginationParams, 'current' | 'size'>

    /** 分页响应基础结构 */
    interface PaginatedResponse<T = any> {
      records: T[]
      current: number
      size: number
      total: number
    }

    /** 启用状态 */
    type EnableStatus = '1' | '2'
  }

  /** 认证类型 */
  namespace Auth {
    /** 登录参数 */
    interface LoginParams {
      userName: string
      password: string
    }

    /** 登录响应 */
    interface LoginResponse {
      token: string
      refreshToken: string
    }

    /** 用户信息 */
    interface UserInfo {
      buttons: string[]
      roles: string[]
      userId: number
      userName: string
      email: string
      avatar?: string
    }
  }

  /** 系统管理类型 */
  namespace SystemManage {
    /** 用户列表 */
    type UserList = Api.Common.PaginatedResponse<UserListItem>

    /** 用户列表项 */
    interface UserListItem {
      id: number
      avatar: string
      status: string
      userName: string
      userGender: string
      nickName: string
      userPhone: string
      userEmail: string
      userRoles: string[]
      createBy: string
      createTime: string
      updateBy: string
      updateTime: string
    }

    /** 用户搜索参数 */
    type UserSearchParams = Partial<
      Pick<UserListItem, 'id' | 'userName' | 'userGender' | 'userPhone' | 'userEmail' | 'status'> &
        Api.Common.CommonSearchParams
    >

    /** 角色列表 */
    type RoleList = Api.Common.PaginatedResponse<RoleListItem>

    /** 角色列表项 */
    interface RoleListItem {
      roleId: number
      roleName: string
      roleCode: string
      description: string
      enabled: boolean
      createTime: string
    }

    /** 角色搜索参数 */
    type RoleSearchParams = Partial<
      Pick<RoleListItem, 'roleId' | 'roleName' | 'roleCode' | 'description' | 'enabled'> &
        Api.Common.CommonSearchParams
    >
  }

  /** 日志管理类型 */
  namespace Logs {
    /** 日志级别 */
    type LogLevel = 'DEBUG' | 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR' | 'CRITICAL'
    type RequestOutcome = 'success' | 'failure' | 'rejected' | 'in_progress' | 'completed' | 'other'

    /** 单条日志 */
    interface LogEntry {
      id: number
      ip: string
      session_id: string
      timestamp: string
      request_id: string
      level: LogLevel
      module: string
      function: string
      line: number
      event: string
      message: string
      attributes: Record<string, unknown>
      raw_line: string
    }

    interface TraceSpan {
      attempt: number
      category: 'http' | 'sandbox' | 'phase'
      sequence: number
      name: string
      start_ms: number | null
      duration_ms: number
      method: string | null
      host: string | null
      path: string | null
      status: number | null
      response_bytes: number | null
      ok: boolean | null
      engine_ms: number | null
      peak_memory_bytes: number | null
      details: Record<string, unknown>
    }

    interface TraceMetrics {
      attempts: number
      queue_wait_ms: number
      total_ms: number
      http_total_ms: number
      sandbox_total_ms: number
      sandbox_engine_total_ms: number
      sandbox_peak_memory_bytes: number
    }

    interface FingerprintSnapshot {
      fingerprint_key: string | null
      profile_variant: string | null
      profile_id: string | null
      locale: string | null
      timezone: string | null
      hcaptcha_version: string | null
      vmdata_length: number | null
      vmdata_slots: number | null
      n_length: number | null
      request_type: string | null
      task_count: number | null
      proxy_scheme: string | null
      proxy_host: string | null
      proxy_port: number | null
      proxy_endpoint: string | null
      proxy_endpoint_key: string | null
      proxy_session_mode: string | null
      proxy_country: string | null
      proxy_city: string | null
      proxy_timezone: string | null
      proxy_geo_source: string | null
      proxy_exit_ip: string | null
      proxy_asn: string | null
      proxy_isp: string | null
      /** `pool` = 语言/时区取自服务端实测配对池（默认）；`egress` = 由出口地区推导。 */
      geo_pair_source: string | null
      /** 仅在 `egress` 模式下有意义；配对池模式下为 null（与出口不一致是设计使然）。 */
      locale_geo_match: boolean | null
      timezone_geo_match: boolean | null
      safari_version: string | null
      visible: boolean | null
      screen_width: number | null
      screen_height: number | null
      viewport_width: number | null
      viewport_height: number | null
      device_scale_factor: number | null
      color_depth: number | null
      hardware_concurrency: number | null
      device_memory_gb: number | null
      platform: string | null
      architecture: string | null
      max_touch_points: number | null
      canvas_salt: string | null
      webgl_render_salt: string | null
      webgl_unmasked_renderer: string | null
      audio_offline_render_value: string | null
      worker_stack_fingerprint: string | null
      display_refresh_hz: number | null
      pointer_dispatch_hz: number | null
      timestamp_quantum_ms: number | null
    }

    /** 日志组 */
    interface LogGroup {
      request_id: string
      session_id: string
      /** 由哪台节点服务的（189 / 154），对应后端 host 列与 host 过滤参数。 */
      node: string | null
      count: number
      start_time: string
      end_time: string
      duration_ms: number
      levels: Record<string, number>
      ip: string
      has_error: boolean
      outcome: RequestOutcome
      method: string | null
      path: string | null
      http_status: number | null
      target_host: string | null
      attempts: number | null
      upstream_requests: number | null
      direct: boolean | null
      token_hint: string | null
      /** 完整 token，渲染时从账本解析；日志文件里只有脱敏的 token_hint。 */
      token_value: string | null
      token_remaining: number | null
      token_used: number | null
      error: string | null
      trace_metrics: TraceMetrics
      fingerprint: FingerprintSnapshot
      spans: TraceSpan[]
      logs: LogEntry[]
    }

    /** 日志搜索参数 */
    interface SearchParams {
      request_id?: string
      outcome?: RequestOutcome
      level?: LogLevel
      ip?: string
      module?: string
      target_host?: string
      start_time?: string
      end_time?: string
      keyword?: string
      include_non_solve?: boolean
      page?: number
      page_size?: number
    }

    /** 日志总览统计 */
    interface OverviewStats {
      window_hours: number
      solve_total: number
      success_count: number
      failure_count: number
      rejected_count: number
      in_progress_count: number
      success_rate: number
      average_duration_ms: number
      p95_duration_ms: number
      direct_rate: number
      upstream_request_count: number
      log_total: number
      level_distribution: Record<string, number>
      timeline_data: TimelineData[]
      target_stats: TargetStat[]
      client_stats: ClientStat[]
      recent_requests: LogGroup[]
      token_usage: TokenUsage
      source: SourceStatus
      service: ServiceStatus
    }

    /** 时间线数据 */
    interface TimelineData {
      time: string
      total: number
      success: number
      failure: number
      rejected: number
    }

    /** IP统计 */
    interface ClientStat {
      ip: string
      count: number
    }

    interface TargetStat {
      host: string
      total: number
      success: number
      failure: number
      success_rate: number
      average_duration_ms: number
    }

    interface TokenState {
      token: string | null
      token_hint: string
      remaining: number
      used: number
      pending: number
      enabled: boolean
      expires_at: number | null
    }

    interface TokenUsage {
      available: boolean
      remaining: number
      used: number
      pending: number
      tokens: TokenState[]
    }

    interface TokenRecord {
      token_id: string
      token: string | null
      token_hint: string
      remaining: number
      used: number
      pending: number
      enabled: boolean
      expires_at: number | null
      created_at: number
      updated_at: number
    }

    interface TokenRecordList {
      total: number
      remaining: number
      used: number
      pending: number
      tokens: TokenRecord[]
    }

    interface TokenCreatePayload {
      token: string
      remaining: number
      enabled: boolean
      expires_at: number | null
    }

    interface TokenUpdatePayload {
      remaining?: number
      used?: number
      enabled?: boolean
      expires_at?: number | null
    }

    interface SourceStatus {
      log_dir: string
      database_path: string
      source_files: number
      indexed_logs: number
      parse_failures: number
      retention_days: number
      source_bytes: number
      database_bytes: number
      latest_log_at: string | null
      last_sync_at: string | null
    }

    interface ServiceStatus {
      online: boolean
      url: string
      checked_at: string
      engine_available: boolean | null
      metrics: Record<string, number>
      error: string | null
    }

    /** 日志列表响应 */
    interface ListResponse {
      total: number
      page: number
      page_size: number
      data: LogGroup[]
    }

    interface SyncResponse {
      imported: number
      parsed: number
      parse_failures: number
      source_files: number
      pruned: number
      pruned_sources: number
      interrupted: number
      synced_at: string
    }

    interface CleanupResponse {
      deleted_logs: number
      deleted_requests: number
      deleted_spans: number
      deleted_total: number
      source_records_preserved: number
      database_bytes_before: number
      database_bytes_after: number
      reclaimed_bytes: number
      cleaned_at: string
    }

    interface FingerprintCluster {
      key: string
      label: string
      dimensions: Record<string, string | number | boolean | null>
      total: number
      terminal: number
      success: number
      failure: number
      success_rate: number
      direct_rate: number
      average_duration_ms: number
      p95_duration_ms: number
      average_http_ms: number
      average_sandbox_ms: number
    }

    interface FingerprintClusterResponse {
      window_hours: number
      group_by: string[]
      sample_total: number
      covered_samples: number
      coverage_rate: number
      clusters: FingerprintCluster[]
    }
  }
}
