<!-- IP访问统计 -->
<template>
  <ElCard class="h-90" shadow="never">
    <template #header>
      <div class="card-header flex items-center justify-between">
        <span class="font-semibold">IP访问统计 Top10</span>
      </div>
    </template>
    <ArtHBarChart
      v-if="xAxisData.length > 0"
      :xAxisData="xAxisData"
      :data="seriesData"
      :loading="loading"
      :colors="['#5470c6']"
      height="300px"
    />
    <ElEmpty v-else description="暂无数据" />
  </ElCard>
</template>

<script setup lang="ts">
  defineOptions({ name: 'IpStats' })

  interface Props {
    stats: Api.Logs.OverviewStats | null
    loading?: boolean
  }

  const props = defineProps<Props>()

  const xAxisData = computed(() => {
    if (!props.stats?.ip_stats || props.stats.ip_stats.length === 0) {
      return []
    }

    const ipStats = props.stats.ip_stats.slice(0, 10)
    return ipStats.map((item) => item.ip).reverse()
  })

  const seriesData = computed(() => {
    if (!props.stats?.ip_stats || props.stats.ip_stats.length === 0) {
      return []
    }

    const ipStats = props.stats.ip_stats.slice(0, 10)
    return ipStats.map((item) => item.count).reverse()
  })
</script>
