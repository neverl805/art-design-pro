<template>
  <ElCard shadow="never" class="panel-card">
    <template #header>
      <div class="panel-title">请求结果</div>
    </template>
    <ArtRingChart
      v-if="stats.solve_total > 0"
      :data="chartData"
      :loading="loading"
      :show-legend="true"
      legend-position="right"
      :center-text="`${stats.success_rate.toFixed(1)}%`"
      height="280px"
    />
    <ElEmpty v-else description="暂无请求" />
  </ElCard>
</template>

<script setup lang="ts">
  defineOptions({ name: 'OutcomeChart' })

  const props = defineProps<{
    stats: Api.Logs.OverviewStats
    loading?: boolean
  }>()

  const chartData = computed(() => [
    { name: '成功', value: props.stats.success_count, itemStyle: { color: '#16a36f' } },
    { name: '失败', value: props.stats.failure_count, itemStyle: { color: '#dc4c4c' } },
    { name: '拒绝', value: props.stats.rejected_count, itemStyle: { color: '#d49124' } },
    { name: '进行中', value: props.stats.in_progress_count, itemStyle: { color: '#3b82c4' } }
  ])
</script>

<style scoped lang="scss">
  .panel-card {
    min-height: 348px;
  }

  .panel-title {
    font-size: 14px;
    font-weight: 600;
  }
</style>
