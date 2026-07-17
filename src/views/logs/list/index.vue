<template>
  <div class="request-list art-full-height">
    <div class="page-heading">
      <div>
        <h2>hCaptcha 请求记录</h2>
        <span>{{ pagination.total.toLocaleString() }} 个 solve 请求</span>
      </div>
      <ElTooltip content="刷新列表" placement="bottom">
        <ElButton circle :loading="loading" @click="loadRequests">
          <Icon icon="ri:refresh-line" />
        </ElButton>
      </ElTooltip>
    </div>

    <LogSearch ref="searchRef" @search="handleSearch" @reset="handleReset" />

    <ElCard shadow="never" class="table-panel">
      <ElTable v-loading="loading" :data="tableData" row-key="request_id" height="100%">
        <ElTableColumn type="expand" width="44">
          <template #default="{ row }">
            <div class="event-preview">
              <div v-for="log in row.logs" :key="log.id" class="event-row">
                <span class="event-time">{{ timeOnly(log.timestamp) }}</span>
                <ElTag :type="levelType(log.level)" size="small" effect="plain">{{
                  log.level
                }}</ElTag>
                <span class="event-name">{{ log.event }}</span>
                <span class="event-message">{{ log.message }}</span>
              </div>
            </div>
          </template>
        </ElTableColumn>
        <ElTableColumn label="结果" width="90">
          <template #default="{ row }">
            <ElTag :type="outcomeType(row.outcome)" size="small" effect="plain">
              {{ outcomeLabel(row.outcome) }}
            </ElTag>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="target_host" label="目标 Host" min-width="190" show-overflow-tooltip>
          <template #default="{ row }">{{ row.target_host || '--' }}</template>
        </ElTableColumn>
        <ElTableColumn prop="request_id" label="Request ID" min-width="220" show-overflow-tooltip>
          <template #default="{ row }">
            <ElLink type="primary" @click="openDetail(row.request_id)">{{ row.request_id }}</ElLink>
          </template>
        </ElTableColumn>
        <ElTableColumn label="耗时" width="94" align="right">
          <template #default="{ row }">{{ formatDuration(row.duration_ms) }}</template>
        </ElTableColumn>
        <ElTableColumn prop="attempts" label="尝试" width="64" align="right" />
        <ElTableColumn label="模式" width="78" align="center">
          <template #default="{ row }">{{
            row.direct == null ? '--' : row.direct ? 'Direct' : 'Task'
          }}</template>
        </ElTableColumn>
        <ElTableColumn prop="token_remaining" label="余量" width="72" align="right" />
        <ElTableColumn prop="ip" label="客户端 IP" width="126" />
        <ElTableColumn label="开始时间" width="180">
          <template #default="{ row }">{{ formatDate(row.start_time) }}</template>
        </ElTableColumn>
        <ElTableColumn label="" width="54" fixed="right" align="center">
          <template #default="{ row }">
            <ElTooltip content="查看详情" placement="left">
              <ElButton link type="primary" @click="openDetail(row.request_id)">
                <Icon icon="ri:arrow-right-line" />
              </ElButton>
            </ElTooltip>
          </template>
        </ElTableColumn>
      </ElTable>

      <div class="pagination-row">
        <ElPagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.page_size"
          :total="pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next"
          @size-change="handleSizeChange"
          @current-change="loadRequests"
        />
      </div>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { fetchLogList } from '@/api/logs'
  import Icon from '@/components/core/base/art-svg-icon/index.vue'
  import LogSearch from './modules/log-search.vue'

  defineOptions({ name: 'LogsList' })

  const router = useRouter()
  const route = useRoute()
  const loading = ref(false)
  const tableData = ref<Api.Logs.LogGroup[]>([])
  const searchParams = ref<Api.Logs.SearchParams>({})
  const searchRef = ref<InstanceType<typeof LogSearch>>()
  const pagination = ref({ page: 1, page_size: 20, total: 0 })

  const loadRequests = async () => {
    loading.value = true
    try {
      const result = await fetchLogList({
        ...searchParams.value,
        page: pagination.value.page,
        page_size: pagination.value.page_size
      })
      tableData.value = result.data
      pagination.value.total = result.total
    } catch (error) {
      console.error('获取请求记录失败:', error)
      ElMessage.error('获取请求记录失败')
    } finally {
      loading.value = false
    }
  }

  const handleSearch = (params: Api.Logs.SearchParams) => {
    searchParams.value = params
    pagination.value.page = 1
    loadRequests()
  }
  const handleReset = () => {
    searchParams.value = {}
    pagination.value.page = 1
    router.replace({ query: {} })
    loadRequests()
  }
  const handleSizeChange = () => {
    pagination.value.page = 1
    loadRequests()
  }
  const openDetail = (requestId: string) => router.push(`/logs/detail/${requestId}`)
  const timeOnly = (value: string) => value.slice(11, 23)
  const formatDuration = (ms: number) =>
    ms < 1000 ? `${ms.toFixed(0)} ms` : `${(ms / 1000).toFixed(2)} s`
  const formatDate = (value: string) => new Date(value).toLocaleString('zh-CN', { hour12: false })
  const outcomeLabel = (outcome: Api.Logs.RequestOutcome) =>
    ({
      success: '成功',
      failure: '失败',
      rejected: '拒绝',
      in_progress: '进行中',
      completed: '完成',
      other: '其他'
    })[outcome]
  const outcomeType = (outcome: Api.Logs.RequestOutcome) =>
    ({
      success: 'success',
      failure: 'danger',
      rejected: 'warning',
      in_progress: 'primary',
      completed: 'info',
      other: 'info'
    })[outcome] as 'success' | 'danger' | 'warning' | 'primary' | 'info'
  const levelType = (level: Api.Logs.LogLevel) =>
    ({
      SUCCESS: 'success',
      ERROR: 'danger',
      CRITICAL: 'danger',
      WARNING: 'warning',
      INFO: 'primary',
      DEBUG: 'info'
    })[level] as 'success' | 'danger' | 'warning' | 'primary' | 'info'

  onMounted(() => {
    const outcome = route.query.outcome
    if (typeof outcome === 'string') {
      searchParams.value.outcome = outcome as Api.Logs.RequestOutcome
      if (searchRef.value) searchRef.value.searchForm.outcome = searchParams.value.outcome
    }
    loadRequests()
  })
</script>

<style scoped lang="scss">
  .request-list {
    display: flex;
    flex-direction: column;
    min-height: 0;
  }

  .page-heading {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 14px;
  }

  .page-heading h2 {
    margin: 0;
    font-size: 20px;
    line-height: 28px;
  }

  .page-heading span {
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }

  .table-panel {
    flex: 1;
    min-height: 520px;
  }

  :deep(.table-panel > .el-card__body) {
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .event-preview {
    padding: 8px 14px;
    background: var(--el-fill-color-lighter);
  }

  .event-row {
    display: grid;
    grid-template-columns: 92px 76px 150px minmax(0, 1fr);
    gap: 10px;
    align-items: center;
    min-height: 34px;
    font-size: 12px;
    border-bottom: 1px solid var(--el-border-color-lighter);
  }

  .event-row:last-child {
    border-bottom: 0;
  }

  .event-time,
  .event-name {
    color: var(--el-text-color-secondary);
  }

  .event-message {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .pagination-row {
    display: flex;
    justify-content: flex-end;
    padding-top: 14px;
  }
</style>
