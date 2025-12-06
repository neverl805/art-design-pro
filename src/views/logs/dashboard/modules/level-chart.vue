<!-- 日志级别分布图表 -->
<template>
  <ElCard class="h-90" shadow="never">
    <template #header>
      <div class="card-header flex items-center justify-between">
        <span class="font-semibold">日志级别分布</span>
      </div>
    </template>
    <ArtRingChart
      v-if="chartData.length > 0"
      :data="chartData"
      :loading="loading"
      height="300px"
    />
    <ElEmpty v-else description="暂无数据" />
  </ElCard>
</template>

<script setup lang="ts">
  defineOptions({ name: 'LevelChart' })

  interface Props {
    stats: Api.Logs.OverviewStats | null
    loading?: boolean
  }

  const props = defineProps<Props>()

  const chartData = computed(() => {
    if (!props.stats?.level_distribution) return []

    const levelColors: Record<string, string> = {
      DEBUG: '#909399',
      INFO: '#409eff',
      WARNING: '#e6a23c',
      ERROR: '#f56c6c',
      CRITICAL: '#8b0000'
    }

    return Object.entries(props.stats.level_distribution).map(([level, count]) => ({
      name: level,
      value: count,
      itemStyle: { color: levelColors[level] || '#909399' }
    }))
  })
</script>
