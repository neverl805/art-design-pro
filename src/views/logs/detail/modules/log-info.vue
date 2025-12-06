<!-- 日志详细信息组件 -->
<template>
  <ElCard shadow="never" class="log-info-card">
    <template #header>
      <div class="font-semibold">基本信息</div>
    </template>
    <ElDescriptions :column="1" border>
      <ElDescriptionsItem label="请求ID">
        <ElText type="primary" tag="b" class="break-all">{{ logGroup.request_id }}</ElText>
      </ElDescriptionsItem>
      <ElDescriptionsItem label="IP地址">
        {{ logGroup.ip }}
      </ElDescriptionsItem>
      <ElDescriptionsItem label="日志条数">
        <ElTag>{{ logGroup.count }}</ElTag>
      </ElDescriptionsItem>
      <ElDescriptionsItem label="开始时间">
        {{ logGroup.start_time }}
      </ElDescriptionsItem>
      <ElDescriptionsItem label="结束时间">
        {{ logGroup.end_time }}
      </ElDescriptionsItem>
      <ElDescriptionsItem label="持续时间">
        <ElTag type="info">{{ formatDuration(logGroup.duration_ms) }}</ElTag>
      </ElDescriptionsItem>
      <ElDescriptionsItem label="状态">
        <ElTag v-if="logGroup.has_error" type="danger">有错误</ElTag>
        <ElTag v-else type="success">正常</ElTag>
      </ElDescriptionsItem>
      <ElDescriptionsItem label="级别分布">
        <div class="flex gap-2 flex-wrap">
          <ElTag v-if="logGroup.levels.CRITICAL" type="danger" size="small">
            CRITICAL: {{ logGroup.levels.CRITICAL }}
          </ElTag>
          <ElTag v-if="logGroup.levels.ERROR" type="danger" size="small">
            ERROR: {{ logGroup.levels.ERROR }}
          </ElTag>
          <ElTag v-if="logGroup.levels.WARNING" type="warning" size="small">
            WARNING: {{ logGroup.levels.WARNING }}
          </ElTag>
          <ElTag v-if="logGroup.levels.INFO" type="primary" size="small">
            INFO: {{ logGroup.levels.INFO }}
          </ElTag>
          <ElTag v-if="logGroup.levels.DEBUG" type="info" size="small">
            DEBUG: {{ logGroup.levels.DEBUG }}
          </ElTag>
        </div>
      </ElDescriptionsItem>
    </ElDescriptions>

    <div class="mt-4">
      <div class="font-semibold mb-3">级别分布图</div>
      <div style="height: 200px">
        <ArtRingChart :data="chartData" height="200px" />
      </div>
    </div>
  </ElCard>
</template>

<script setup lang="ts">
  defineOptions({ name: 'LogInfo' })

  interface Props {
    logGroup: Api.Logs.LogGroup
  }

  const props = defineProps<Props>()

  const chartData = computed(() => {
    const levelColors: Record<string, string> = {
      DEBUG: '#909399',
      INFO: '#409eff',
      WARNING: '#e6a23c',
      ERROR: '#f56c6c',
      CRITICAL: '#8b0000'
    }

    return Object.entries(props.logGroup.levels).map(([level, count]) => ({
      name: level,
      value: count,
      itemStyle: { color: levelColors[level] || '#909399' }
    }))
  })

  const formatDuration = (ms: number) => {
    if (ms < 1000) {
      return `${ms.toFixed(0)}ms`
    } else if (ms < 60000) {
      return `${(ms / 1000).toFixed(2)}s`
    } else {
      return `${(ms / 60000).toFixed(2)}min`
    }
  }
</script>

<style scoped lang="scss">
  .log-info-card {
    height: 100%;
  }
</style>
