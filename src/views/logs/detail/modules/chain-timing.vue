<template>
  <ElCard shadow="never" class="timing-card">
    <template #header>
      <div class="panel-header">
        <div>
          <span class="panel-title">链路接口耗时</span>
          <span class="span-count">{{ filteredSpans.length }} / {{ spans.length }}</span>
        </div>
        <ElSegmented v-model="category" :options="categoryOptions" size="small" />
      </div>
    </template>

    <div class="metric-strip">
      <div v-for="metric in metrics" :key="metric.label" class="metric-item">
        <span>{{ metric.label }}</span>
        <strong>{{ metric.value }}</strong>
      </div>
    </div>

    <ElTable :data="filteredSpans" size="small" empty-text="暂无结构化链路数据">
      <ElTableColumn prop="attempt" label="Attempt" width="76" align="center" />
      <ElTableColumn label="类型" width="82">
        <template #default="{ row }">
          <ElTag :type="categoryType(row.category)" size="small" effect="plain">
            {{ categoryLabel(row.category) }}
          </ElTag>
        </template>
      </ElTableColumn>
      <ElTableColumn label="操作" min-width="170">
        <template #default="{ row }">
          <div class="operation-name">{{ row.name }}</div>
          <div v-if="row.host || row.path" class="operation-path">
            {{ row.method }} {{ row.host }}{{ row.path }}
          </div>
          <div v-else-if="row.engine_ms != null" class="operation-path">
            engine {{ formatDuration(row.engine_ms) }}
            <template v-if="row.peak_memory_bytes">
              · peak {{ formatBytes(row.peak_memory_bytes) }}
            </template>
          </div>
        </template>
      </ElTableColumn>
      <ElTableColumn label="状态" width="76" align="center">
        <template #default="{ row }">
          <ElTag
            v-if="row.status != null"
            :type="row.status < 400 ? 'success' : 'danger'"
            size="small"
            effect="plain"
          >
            {{ row.status }}
          </ElTag>
          <ElTag
            v-else-if="row.ok != null"
            :type="row.ok ? 'success' : 'danger'"
            size="small"
            effect="plain"
          >
            {{ row.ok ? 'OK' : 'ERR' }}
          </ElTag>
          <span v-else>--</span>
        </template>
      </ElTableColumn>
      <ElTableColumn label="耗时" width="104" align="right">
        <template #default="{ row }">
          <strong class="duration-value">{{ formatDuration(row.duration_ms) }}</strong>
        </template>
      </ElTableColumn>
      <ElTableColumn label="相对链路位置" min-width="180">
        <template #default="{ row }">
          <div class="waterfall-track">
            <span class="waterfall-bar" :class="row.category" :style="waterfallStyle(row)"></span>
          </div>
        </template>
      </ElTableColumn>
    </ElTable>
  </ElCard>
</template>

<script setup lang="ts">
  defineOptions({ name: 'ChainTiming' })

  const props = defineProps<{
    spans: Api.Logs.TraceSpan[]
    metrics: Api.Logs.TraceMetrics
  }>()

  const category = ref('all')
  const categoryOptions = [
    { label: '全部', value: 'all' },
    { label: 'HTTP', value: 'http' },
    { label: '沙箱', value: 'sandbox' },
    { label: '阶段', value: 'phase' }
  ]
  const filteredSpans = computed(() =>
    category.value === 'all'
      ? props.spans
      : props.spans.filter((span) => span.category === category.value)
  )
  const timelineTotal = computed(() => Math.max(props.metrics.total_ms, 1))
  const metrics = computed(() => [
    { label: '链路总耗时', value: formatDuration(props.metrics.total_ms) },
    { label: '并发排队', value: formatDuration(props.metrics.queue_wait_ms) },
    { label: 'HTTP 累计', value: formatDuration(props.metrics.http_total_ms) },
    { label: '沙箱累计', value: formatDuration(props.metrics.sandbox_total_ms) },
    { label: '沙箱峰值内存', value: formatBytes(props.metrics.sandbox_peak_memory_bytes) }
  ])

  const categoryLabel = (value: Api.Logs.TraceSpan['category']) =>
    ({ http: 'HTTP', sandbox: '沙箱', phase: '阶段' })[value]
  const categoryType = (value: Api.Logs.TraceSpan['category']) =>
    ({ http: 'primary', sandbox: 'warning', phase: 'info' })[value] as
      | 'primary'
      | 'warning'
      | 'info'
  const formatDuration = (ms: number) => {
    if (!ms) return '0 ms'
    return ms < 1000 ? `${ms.toFixed(1)} ms` : `${(ms / 1000).toFixed(3)} s`
  }
  const formatBytes = (bytes: number) => {
    if (!bytes) return '0 MB'
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`
  }
  const waterfallStyle = (span: Api.Logs.TraceSpan) => {
    const start = span.start_ms || 0
    const left = Math.min(96, Math.max(0, (start / timelineTotal.value) * 100))
    const width = Math.max(2, Math.min(100 - left, (span.duration_ms / timelineTotal.value) * 100))
    return { left: `${left}%`, width: `${width}%` }
  }
</script>

<style scoped lang="scss">
  .timing-card {
    margin-bottom: 16px;
  }

  .panel-header {
    display: flex;
    gap: 12px;
    align-items: center;
    justify-content: space-between;
  }

  .panel-title {
    font-size: 14px;
    font-weight: 600;
  }

  .span-count {
    margin-left: 8px;
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }

  .metric-strip {
    display: grid;
    grid-template-columns: repeat(5, minmax(0, 1fr));
    margin-bottom: 14px;
    border: 1px solid var(--el-border-color-lighter);
  }

  .metric-item {
    min-width: 0;
    padding: 10px 12px;
    border-right: 1px solid var(--el-border-color-lighter);
  }

  .metric-item:last-child {
    border-right: 0;
  }

  .metric-item span {
    display: block;
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }

  .metric-item strong {
    display: block;
    margin-top: 4px;
    overflow: hidden;
    font-size: 14px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .operation-name {
    font-weight: 600;
  }

  .operation-path {
    margin-top: 2px;
    overflow: hidden;
    font-size: 11px;
    color: var(--el-text-color-secondary);
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .duration-value {
    font-size: 12px;
  }

  .waterfall-track {
    position: relative;
    width: 100%;
    height: 10px;
    overflow: hidden;
    background: var(--el-fill-color-light);
  }

  .waterfall-bar {
    position: absolute;
    top: 1px;
    height: 8px;
    background: #3b82c4;
  }

  .waterfall-bar.sandbox {
    background: #d49124;
  }

  .waterfall-bar.phase {
    background: #71717a;
  }

  @media (width <= 720px) {
    .panel-header {
      flex-direction: column;
      align-items: flex-start;
    }

    .metric-strip {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .metric-item:nth-child(even) {
      border-right: 0;
    }

    .metric-item:not(:nth-last-child(-n + 2)) {
      border-bottom: 1px solid var(--el-border-color-lighter);
    }
  }
</style>
