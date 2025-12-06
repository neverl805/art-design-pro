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
    type LogLevel = 'DEBUG' | 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL'

    /** 单条日志 */
    interface LogEntry {
      id: number
      ip: string
      timestamp: string
      request_id: string
      level: LogLevel
      module: string
      function: string
      line: number
      message: string
      raw_line: string
    }

    /** 日志组 */
    interface LogGroup {
      request_id: string
      count: number
      start_time: string
      end_time: string
      duration_ms: number
      levels: Record<string, number>
      ip: string
      has_error: boolean
      logs: LogEntry[]
    }

    /** 日志搜索参数 */
    interface SearchParams {
      request_id?: string
      level?: LogLevel
      ip?: string
      module?: string
      start_time?: string
      end_time?: string
      keyword?: string
      page?: number
      page_size?: number
    }

    /** 日志总览统计 */
    interface OverviewStats {
      total: number
      error_count: number
      warning_count: number
      info_count: number
      success_count: number
      debug_count: number
      request_count: number
      ip_count: number
      level_distribution: Record<string, number>
      timeline_data: TimelineData[]
      ip_stats: IpStat[]
      recent_logs: LogEntry[]
    }

    /** 时间线数据 */
    interface TimelineData {
      time: string
      total: number
      [key: string]: number | string
    }

    /** IP统计 */
    interface IpStat {
      ip: string
      count: number
    }

    /** 日志列表响应 */
    interface ListResponse {
      total: number
      page: number
      page_size: number
      data: LogGroup[]
    }

    /** 清除日志响应 */
    interface CleanLogsResponse {
      deleted_count: number
      message: string
    }
  }
}
