<!-- 时间趋势图表 -->
<template>
  <ElCard shadow="never">
    <template #header>
      <div class="card-header flex items-center justify-between">
        <span class="font-semibold">日志时间趋势</span>
      </div>
    </template>
    <ArtLineChart
      v-if="xAxisData.length > 0"
      :xAxisData="xAxisData"
      :data="seriesData"
      :loading="loading"
      :showLegend="true"
      :showAreaColor="false"
      :smooth="true"
      :colors="['#f56c6c', '#e6a23c', '#409eff', '#909399']"
      height="300px"
    />
    <ElEmpty v-else description="暂无数据" />
  </ElCard>
</template>

<script setup lang="ts">
  defineOptions({ name: 'TimelineChart' })

  interface Props {
    stats: Api.Logs.OverviewStats | null
    loading?: boolean
  }

  const props = defineProps<Props>()

  const xAxisData = computed(() => {
    if (!props.stats?.timeline_data || props.stats.timeline_data.length === 0) {
      return []
    }

    const timelineData = props.stats.timeline_data
    return timelineData.map((item) => {
      const date = new Date(item.time)
      return `${date.getMonth() + 1}-${date.getDate()} ${date.getHours()}:00`
    })
  })

  const seriesData = computed(() => {
    if (!props.stats?.timeline_data || props.stats.timeline_data.length === 0) {
      return []
    }

    const timelineData = props.stats.timeline_data
    const levels = ['ERROR', 'WARNING', 'INFO', 'DEBUG']

    return levels
      .map((level) => {
        const data = timelineData.map((item) => item[level] || 0)
        // 如果该级别没有任何数据,则不显示
        if (data.every((v) => v === 0)) return null

        return {
          name: level,
          data,
          smooth: true
        }
      })
      .filter(Boolean) as Array<{ name: string; data: number[]; smooth: boolean }>
  })
</script>
