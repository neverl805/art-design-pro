<template>
  <ElCard shadow="never">
    <template #header>
      <div class="panel-title">Solve 趋势</div>
    </template>
    <ArtLineChart
      v-if="xAxisData.length"
      :x-axis-data="xAxisData"
      :data="seriesData"
      :loading="loading"
      :show-legend="true"
      :show-area-color="false"
      :smooth="true"
      :colors="['#16a36f', '#dc4c4c', '#d49124']"
      height="280px"
    />
    <ElEmpty v-else description="暂无趋势数据" />
  </ElCard>
</template>

<script setup lang="ts">
  defineOptions({ name: 'SolveTimelineChart' })

  const props = defineProps<{
    stats: Api.Logs.OverviewStats
    loading?: boolean
  }>()

  const xAxisData = computed(() =>
    props.stats.timeline_data.map((item) => {
      const date = new Date(item.time.replace(' ', 'T'))
      return `${date.getMonth() + 1}-${date.getDate()} ${String(date.getHours()).padStart(2, '0')}:00`
    })
  )

  const seriesData = computed(() => [
    { name: '成功', data: props.stats.timeline_data.map((item) => item.success), smooth: true },
    { name: '失败', data: props.stats.timeline_data.map((item) => item.failure), smooth: true },
    { name: '拒绝', data: props.stats.timeline_data.map((item) => item.rejected), smooth: true }
  ])
</script>

<style scoped lang="scss">
  .panel-title {
    font-size: 14px;
    font-weight: 600;
  }
</style>
