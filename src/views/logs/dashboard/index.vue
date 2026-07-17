<template>
  <div class="monitor-dashboard">
    <header class="dashboard-toolbar">
      <div class="title-block">
        <div class="title-row">
          <h2>hCaptcha 服务监控</h2>
          <span class="service-state" :class="serviceOnline ? 'online' : 'offline'">
            <span class="state-dot"></span>
            {{ serviceOnline ? '服务在线' : '服务离线' }}
          </span>
          <ElTag
            v-if="overviewStats?.service.engine_available != null"
            :type="overviewStats.service.engine_available ? 'success' : 'danger'"
            size="small"
            effect="plain"
          >
            {{ overviewStats.service.engine_available ? '执行器正常' : '执行器缺失' }}
          </ElTag>
        </div>
        <div class="source-line">
          <span>{{ overviewStats?.source.indexed_logs.toLocaleString() || 0 }} 条已索引</span>
          <span>{{ overviewStats?.source.source_files || 0 }} 个日志源</span>
          <span v-if="lastUpdateTime">更新于 {{ lastUpdateTime }}</span>
        </div>
      </div>

      <div class="toolbar-actions">
        <ElSegmented v-model="windowHours" :options="windowOptions" size="small" />
        <ElSwitch v-model="autoRefresh" active-text="自动刷新" />
        <ElTooltip content="同步日志" placement="bottom">
          <ElButton circle :loading="syncing" @click="handleSync">
            <Icon icon="ri:database-2-line" />
          </ElButton>
        </ElTooltip>
        <ElTooltip content="刷新数据" placement="bottom">
          <ElButton circle :loading="loading" @click="loadOverview(true)">
            <Icon icon="ri:refresh-line" />
          </ElButton>
        </ElTooltip>
      </div>
    </header>

    <template v-if="overviewStats">
      <StatsCards :stats="overviewStats" :loading="loading" />

      <ElRow :gutter="16" class="section-row">
        <ElCol :xs="24" :lg="10">
          <LevelChart :stats="overviewStats" :loading="loading" />
        </ElCol>
        <ElCol :xs="24" :lg="14">
          <IpStats :stats="overviewStats" :loading="loading" />
        </ElCol>
      </ElRow>

      <ElRow :gutter="16" class="section-row">
        <ElCol :xs="24" :lg="15">
          <TimelineChart :stats="overviewStats" :loading="loading" />
        </ElCol>
        <ElCol :xs="24" :lg="9">
          <TokenUsage :stats="overviewStats" />
        </ElCol>
      </ElRow>

      <div class="section-row">
        <FingerprintClusters
          :stats="clusterStats"
          :dimensions="clusterDimensions"
          :loading="clusterLoading"
          @change="handleClusterDimensions"
        />
      </div>

      <div class="section-row">
        <RecentLogs :stats="overviewStats" :loading="loading" />
      </div>
    </template>

    <ElSkeleton v-else :rows="10" animated />
  </div>
</template>

<script setup lang="ts">
  import { fetchFingerprintClusters, fetchLogOverview, syncLogs } from '@/api/logs'
  import Icon from '@/components/core/base/art-svg-icon/index.vue'
  import StatsCards from './modules/stats-cards.vue'
  import LevelChart from './modules/level-chart.vue'
  import TimelineChart from './modules/timeline-chart.vue'
  import IpStats from './modules/ip-stats.vue'
  import RecentLogs from './modules/recent-logs.vue'
  import TokenUsage from './modules/token-usage.vue'
  import FingerprintClusters from './modules/fingerprint-clusters.vue'

  defineOptions({ name: 'LogsDashboard' })

  const overviewStats = ref<Api.Logs.OverviewStats | null>(null)
  const clusterStats = ref<Api.Logs.FingerprintClusterResponse | null>(null)
  const loading = ref(false)
  const syncing = ref(false)
  const clusterLoading = ref(false)
  const autoRefresh = ref(true)
  const windowHours = ref(24)
  const lastUpdateTime = ref('')
  const clusterDimensions = ref(['profile_variant', 'proxy_country', 'hcaptcha_version'])
  const windowOptions = [
    { label: '6 小时', value: 6 },
    { label: '24 小时', value: 24 },
    { label: '7 天', value: 168 }
  ]

  const serviceOnline = computed(() => overviewStats.value?.service.online === true)

  const loadOverview = async (notify = false) => {
    loading.value = true
    clusterLoading.value = true
    try {
      const [overview, clusters] = await Promise.all([
        fetchLogOverview(windowHours.value),
        fetchFingerprintClusters(windowHours.value, clusterDimensions.value)
      ])
      overviewStats.value = overview
      clusterStats.value = clusters
      lastUpdateTime.value = new Date().toLocaleTimeString('zh-CN', { hour12: false })
      if (notify) ElMessage.success('监控数据已刷新')
    } catch (error) {
      console.error('获取监控数据失败:', error)
      ElMessage.error('获取监控数据失败')
    } finally {
      loading.value = false
      clusterLoading.value = false
    }
  }

  const handleClusterDimensions = async (dimensions: string[]) => {
    clusterDimensions.value = dimensions
    clusterLoading.value = true
    try {
      clusterStats.value = await fetchFingerprintClusters(windowHours.value, dimensions)
    } catch (error) {
      console.error('获取指纹聚类失败:', error)
      ElMessage.error('获取指纹聚类失败')
    } finally {
      clusterLoading.value = false
    }
  }

  const handleSync = async () => {
    syncing.value = true
    try {
      const result = await syncLogs()
      await loadOverview()
      ElMessage.success(
        `同步完成，新增 ${result.imported} 条，中断 ${result.interrupted} 条，清理 ${result.pruned} 条旧数据`
      )
    } catch (error) {
      console.error('同步日志失败:', error)
      ElMessage.error('同步日志失败')
    } finally {
      syncing.value = false
    }
  }

  const pageActive = ref(false)
  const { pause, resume } = useIntervalFn(() => loadOverview(), 10_000, {
    immediate: false
  })

  watch(autoRefresh, (enabled) => (enabled && pageActive.value ? resume() : pause()))
  watch(windowHours, () => loadOverview())

  onActivated(() => {
    pageActive.value = true
    loadOverview()
    if (autoRefresh.value) resume()
  })

  onDeactivated(() => {
    pageActive.value = false
    pause()
  })
  onUnmounted(pause)
</script>

<style scoped lang="scss">
  .monitor-dashboard {
    padding: 0;
  }

  .dashboard-toolbar {
    display: flex;
    gap: 20px;
    align-items: center;
    justify-content: space-between;
    padding: 4px 0 16px;
    margin-bottom: 16px;
    border-bottom: 1px solid var(--el-border-color-light);
  }

  .title-block {
    min-width: 0;
  }

  .title-row {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    align-items: center;
  }

  .title-row h2 {
    margin: 0;
    font-size: 20px;
    line-height: 28px;
  }

  .service-state {
    display: inline-flex;
    gap: 6px;
    align-items: center;
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }

  .state-dot {
    width: 8px;
    height: 8px;
    background: #a1a1aa;
    border-radius: 50%;
  }

  .service-state.online .state-dot {
    background: #16a36f;
  }

  .service-state.offline .state-dot {
    background: #dc4c4c;
  }

  .source-line {
    display: flex;
    gap: 14px;
    margin-top: 5px;
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }

  .toolbar-actions {
    display: flex;
    flex-shrink: 0;
    gap: 10px;
    align-items: center;
  }

  .section-row {
    row-gap: 16px;
    margin-top: 16px;
  }

  @media (width <= 900px) {
    .dashboard-toolbar {
      flex-direction: column;
      align-items: flex-start;
    }

    .toolbar-actions {
      flex-wrap: wrap;
      width: 100%;
    }

    .source-line {
      flex-wrap: wrap;
      gap: 6px 12px;
    }
  }
</style>
