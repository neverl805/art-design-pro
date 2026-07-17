<template>
  <ElCard shadow="never" class="panel-card">
    <template #header>
      <div class="panel-title">目标 Host</div>
    </template>
    <ElTable :data="stats.target_stats" height="280" size="small" empty-text="暂无目标数据">
      <ElTableColumn prop="host" label="Host" min-width="190" show-overflow-tooltip />
      <ElTableColumn prop="total" label="请求" width="68" align="right" />
      <ElTableColumn label="成功率" width="90" align="right">
        <template #default="{ row }">
          <span :class="rateClass(row.success_rate)">{{ row.success_rate.toFixed(1) }}%</span>
        </template>
      </ElTableColumn>
      <ElTableColumn label="平均耗时" width="100" align="right">
        <template #default="{ row }">{{ formatDuration(row.average_duration_ms) }}</template>
      </ElTableColumn>
    </ElTable>
  </ElCard>
</template>

<script setup lang="ts">
  defineOptions({ name: 'TargetStats' })

  defineProps<{
    stats: Api.Logs.OverviewStats
    loading?: boolean
  }>()

  const formatDuration = (ms: number) =>
    ms < 1000 ? `${ms.toFixed(0)} ms` : `${(ms / 1000).toFixed(1)} s`
  const rateClass = (rate: number) =>
    rate >= 80 ? 'rate-good' : rate >= 50 ? 'rate-warn' : 'rate-bad'
</script>

<style scoped lang="scss">
  .panel-card {
    min-height: 348px;
  }

  .panel-title {
    font-size: 14px;
    font-weight: 600;
  }

  .rate-good {
    color: #16835d;
  }

  .rate-warn {
    color: #b45309;
  }

  .rate-bad {
    color: #c24141;
  }
</style>
