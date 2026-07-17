<template>
  <ElCard shadow="never">
    <template #header>
      <div class="panel-header">
        <span class="panel-title">最近请求</span>
        <ElButton link type="primary" @click="router.push('/logs/list')">
          查看全部
          <Icon icon="ri:arrow-right-line" class="ml-1" />
        </ElButton>
      </div>
    </template>
    <ElTable :data="stats.recent_requests" size="small" empty-text="暂无请求">
      <ElTableColumn label="结果" width="88">
        <template #default="{ row }">
          <ElTag :type="outcomeType(row.outcome)" size="small" effect="plain">
            {{ outcomeLabel(row.outcome) }}
          </ElTag>
        </template>
      </ElTableColumn>
      <ElTableColumn prop="target_host" label="目标 Host" min-width="190" show-overflow-tooltip>
        <template #default="{ row }">{{ row.target_host || '--' }}</template>
      </ElTableColumn>
      <ElTableColumn prop="request_id" label="Request ID" min-width="210" show-overflow-tooltip />
      <ElTableColumn label="耗时" width="92" align="right">
        <template #default="{ row }">{{ formatDuration(row.duration_ms) }}</template>
      </ElTableColumn>
      <ElTableColumn prop="attempts" label="尝试" width="64" align="right" />
      <ElTableColumn label="开始时间" width="176">
        <template #default="{ row }">{{ formatDate(row.start_time) }}</template>
      </ElTableColumn>
      <ElTableColumn label="" width="52" align="right">
        <template #default="{ row }">
          <ElTooltip content="查看请求详情" placement="top">
            <ElButton link type="primary" @click="router.push(`/logs/detail/${row.request_id}`)">
              <Icon icon="ri:arrow-right-line" />
            </ElButton>
          </ElTooltip>
        </template>
      </ElTableColumn>
    </ElTable>
  </ElCard>
</template>

<script setup lang="ts">
  import Icon from '@/components/core/base/art-svg-icon/index.vue'

  defineOptions({ name: 'RecentRequests' })

  defineProps<{
    stats: Api.Logs.OverviewStats
    loading?: boolean
  }>()

  const router = useRouter()
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
  const formatDuration = (ms: number) =>
    ms < 1000 ? `${ms.toFixed(0)} ms` : `${(ms / 1000).toFixed(2)} s`
  const formatDate = (value: string) => new Date(value).toLocaleString('zh-CN', { hour12: false })
</script>

<style scoped lang="scss">
  .panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .panel-title {
    font-size: 14px;
    font-weight: 600;
  }
</style>
