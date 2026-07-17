<template>
  <ElRow :gutter="16" class="metric-grid">
    <ElCol v-for="item in metrics" :key="item.key" :xs="24" :sm="12" :lg="6">
      <ElCard shadow="never" class="metric-card">
        <div class="metric-heading">
          <span>{{ item.label }}</span>
          <span class="metric-icon" :class="item.tone">
            <Icon :icon="item.icon" :size="20" />
          </span>
        </div>
        <div class="metric-value" v-loading="Boolean(loading)">{{ item.value }}</div>
        <div class="metric-note">{{ item.note }}</div>
      </ElCard>
    </ElCol>
  </ElRow>
</template>

<script setup lang="ts">
  import Icon from '@/components/core/base/art-svg-icon/index.vue'

  defineOptions({ name: 'StatsCards' })

  const props = defineProps<{
    stats: Api.Logs.OverviewStats
    loading?: boolean
  }>()

  const formatDuration = (ms: number) => {
    if (!ms) return '0 ms'
    return ms < 1000 ? `${ms.toFixed(0)} ms` : `${(ms / 1000).toFixed(2)} s`
  }

  const metrics = computed(() => [
    {
      key: 'total',
      label: 'Solve 请求',
      value: props.stats.solve_total.toLocaleString(),
      note: `${props.stats.window_hours} 小时窗口 · ${props.stats.in_progress_count} 个进行中`,
      icon: 'ri:send-plane-line',
      tone: 'blue'
    },
    {
      key: 'success',
      label: '成功率',
      value: `${props.stats.success_rate.toFixed(1)}%`,
      note: `${props.stats.success_count} 成功 · ${props.stats.failure_count} 失败`,
      icon: 'ri:checkbox-circle-line',
      tone: 'green'
    },
    {
      key: 'latency',
      label: '平均耗时',
      value: formatDuration(props.stats.average_duration_ms),
      note: `P95 ${formatDuration(props.stats.p95_duration_ms)}`,
      icon: 'ri:timer-line',
      tone: 'amber'
    },
    {
      key: 'tokens',
      label: 'Token 余量',
      value: props.stats.token_usage.available
        ? props.stats.token_usage.remaining.toLocaleString()
        : '--',
      note: props.stats.token_usage.available
        ? `${props.stats.token_usage.used} 已使用 · ${props.stats.token_usage.pending} 预留中`
        : '账本未连接',
      icon: 'ri:key-2-line',
      tone: 'gray'
    }
  ])
</script>

<style scoped lang="scss">
  .metric-grid {
    row-gap: 16px;
  }

  .metric-card {
    height: 138px;
    border-color: var(--el-border-color-light);

    :deep(.el-card__body) {
      box-sizing: border-box;
      height: 100%;
      padding: 18px;
    }
  }

  .metric-heading {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 13px;
    color: var(--el-text-color-secondary);
  }

  .metric-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 6px;

    &.blue {
      color: #2563eb;
      background: #eff6ff;
    }

    &.green {
      color: #16835d;
      background: #ecfdf5;
    }

    &.amber {
      color: #b45309;
      background: #fffbeb;
    }

    &.gray {
      color: #52525b;
      background: #f4f4f5;
    }
  }

  .metric-value {
    min-height: 38px;
    margin-top: 8px;
    font-size: 28px;
    font-weight: 650;
    line-height: 38px;
    color: var(--el-text-color-primary);
  }

  .metric-note {
    overflow: hidden;
    font-size: 12px;
    color: var(--el-text-color-secondary);
    text-overflow: ellipsis;
    white-space: nowrap;
  }
</style>
