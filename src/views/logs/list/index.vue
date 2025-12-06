<!-- 日志列表页 -->
<template>
  <div class="logs-list art-full-height">
    <!-- 搜索栏 -->
    <LogSearch ref="logSearchRef" @search="handleSearch" @reset="handleReset" />

    <ElCard class="art-table-card" shadow="never">
      <!-- 表格头部 -->
      <div class="flex items-center justify-between mb-4">
        <div class="text-base font-semibold">日志列表</div>
        <ElButton @click="refreshData" :loading="loading" v-ripple>
          <Icon icon="ri:refresh-line" class="mr-1" />
          刷新
        </ElButton>
      </div>

      <!-- 表格 -->
      <ElTable
        v-loading="loading"
        :data="tableData"
        style="width: 100%"
        :default-expand-all="false"
        row-key="request_id"
      >
        <ElTableColumn type="expand">
          <template #default="{ row }">
            <div class="expanded-logs p-4">
              <div
                v-for="log in row.logs"
                :key="log.id"
                class="log-item mb-3"
                :class="`log-${log.level.toLowerCase()}`"
              >
                <div class="flex items-center gap-2 mb-2">
                  <ElTag :type="getLevelType(log.level)" size="small">{{ log.level }}</ElTag>
                  <span class="text-xs text-gray-500">{{ log.timestamp }}</span>
                  <span class="text-xs text-gray-600">
                    {{ log.module }}.{{ log.function }}:{{ log.line }}
                  </span>
                </div>
                <div class="text-sm">{{ log.message }}</div>
              </div>
            </div>
          </template>
        </ElTableColumn>

        <ElTableColumn prop="request_id" label="请求ID" width="300" show-overflow-tooltip>
          <template #default="{ row }">
            <ElLink type="primary" @click="goToDetail(row.request_id)">
              {{ row.request_id }}
            </ElLink>
          </template>
        </ElTableColumn>

        <ElTableColumn prop="ip" label="IP地址" width="150" />

        <ElTableColumn prop="count" label="日志条数" width="100" align="center">
          <template #default="{ row }">
            <ElTag>{{ row.count }}</ElTag>
          </template>
        </ElTableColumn>

        <ElTableColumn label="级别分布" width="200">
          <template #default="{ row }">
            <div class="flex gap-2 flex-wrap">
              <ElTag v-if="row.levels.ERROR" type="danger" size="small">
                ERROR: {{ row.levels.ERROR }}
              </ElTag>
              <ElTag v-if="row.levels.WARNING" type="warning" size="small">
                WARNING: {{ row.levels.WARNING }}
              </ElTag>
              <ElTag v-if="row.levels.INFO" type="primary" size="small">
                INFO: {{ row.levels.INFO }}
              </ElTag>
              <ElTag v-if="row.levels.DEBUG" type="info" size="small">
                DEBUG: {{ row.levels.DEBUG }}
              </ElTag>
            </div>
          </template>
        </ElTableColumn>

        <ElTableColumn prop="start_time" label="开始时间" width="180" />

        <ElTableColumn prop="duration_ms" label="持续时间" width="120" align="center">
          <template #default="{ row }">
            <span>{{ formatDuration(row.duration_ms) }}</span>
          </template>
        </ElTableColumn>

        <ElTableColumn prop="has_error" label="状态" width="100" align="center">
          <template #default="{ row }">
            <ElTag v-if="row.has_error" type="danger">有错误</ElTag>
            <ElTag v-else type="success">正常</ElTag>
          </template>
        </ElTableColumn>

        <ElTableColumn label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <ElButton link type="primary" @click="goToDetail(row.request_id)">
              查看详情
            </ElButton>
          </template>
        </ElTableColumn>
      </ElTable>

      <!-- 分页 -->
      <div class="flex justify-end mt-4">
        <ElPagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.page_size"
          :total="pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { useRouter, useRoute } from 'vue-router'
  import { fetchLogList } from '@/api/logs'
  import LogSearch from './modules/log-search.vue'
  import Icon from '@/components/core/base/art-svg-icon/index.vue'

  defineOptions({ name: 'LogsList' })

  const router = useRouter()
  const route = useRoute()
  const loading = ref(false)
  const tableData = ref<Api.Logs.LogGroup[]>([])
  const searchParams = ref<Api.Logs.SearchParams>({})
  const logSearchRef = ref<InstanceType<typeof LogSearch>>()

  const pagination = ref({
    page: 1,
    page_size: 20,
    total: 0
  })

  // 获取日志列表
  const getLogList = async () => {
    loading.value = true
    try {
      const params = {
        ...searchParams.value,
        page: pagination.value.page,
        page_size: pagination.value.page_size
      }

      const result = await fetchLogList(params)
      tableData.value = result.data
      pagination.value.total = result.total
    } catch (error) {
      console.error('获取日志列表失败:', error)
      ElMessage.error('获取日志列表失败')
    } finally {
      loading.value = false
    }
  }

  // 搜索
  const handleSearch = (params: Api.Logs.SearchParams) => {
    searchParams.value = params
    pagination.value.page = 1
    getLogList()
  }

  // 重置
  const handleReset = () => {
    searchParams.value = {}
    pagination.value.page = 1
    // 清除URL中的query参数
    router.replace({ query: {} })
    getLogList()
  }

  // 刷新
  const refreshData = () => {
    getLogList()
  }

  // 分页改变
  const handleSizeChange = () => {
    pagination.value.page = 1
    getLogList()
  }

  const handleCurrentChange = () => {
    getLogList()
  }

  // 跳转详情
  const goToDetail = (requestId: string) => {
    router.push(`/logs/detail/${requestId}`)
  }

  // 获取级别类型
  const getLevelType = (level: string) => {
    const typeMap: Record<string, any> = {
      DEBUG: 'info',
      INFO: 'primary',
      WARNING: 'warning',
      ERROR: 'danger',
      CRITICAL: 'danger'
    }
    return typeMap[level] || 'info'
  }

  // 格式化持续时间
  const formatDuration = (ms: number) => {
    if (ms < 1000) {
      return `${ms.toFixed(0)}ms`
    } else if (ms < 60000) {
      return `${(ms / 1000).toFixed(2)}s`
    } else {
      return `${(ms / 60000).toFixed(2)}min`
    }
  }

  // 初始化：从URL query中读取筛选条件
  const initFromQuery = () => {
    const { level } = route.query
    if (level && typeof level === 'string') {
      // 设置搜索参数
      searchParams.value.level = level

      // 设置搜索组件的表单值
      nextTick(() => {
        if (logSearchRef.value) {
          logSearchRef.value.searchForm.level = level
        }
      })

      // 显示提示信息
      ElMessage.success(`已自动筛选${level}级别的日志`)
    }
  }

  onMounted(() => {
    initFromQuery()
    getLogList()
  })

  // 监听路由变化
  watch(() => route.query, () => {
    if (route.name === 'LogsList') {
      initFromQuery()
      getLogList()
    }
  })
</script>

<style scoped lang="scss">
  .logs-list {
    .expanded-logs {
      background-color: #f5f7fa;
      border-radius: 4px;

      .log-item {
        padding: 12px;
        background-color: white;
        border-radius: 4px;
        border-left: 3px solid #dcdfe6;

        &.log-error,
        &.log-critical {
          border-left-color: #f56c6c;
          background-color: #fef0f0;

          // 暗色主题下的背景色
          html.dark & {
            background-color: #3a1515;
          }
        }

        &.log-warning {
          border-left-color: #e6a23c;
          background-color: #fdf6ec;

          // 暗色主题下的背景色
          html.dark & {
            background-color: #3a2a15;
          }
        }

        &.log-info {
          border-left-color: #409eff;
        }

        &.log-debug {
          border-left-color: #909399;
        }
      }
    }
  }
</style>
