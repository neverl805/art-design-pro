<template>
  <ElCard shadow="never" class="timeline-card">
    <template #header>
      <div class="panel-header">
        <span class="panel-title">事件时间线</span>
        <span class="event-count">{{ logs.length }} 条</span>
      </div>
    </template>
    <ElTimeline class="event-timeline">
      <ElTimelineItem
        v-for="log in logs"
        :key="log.id"
        :timestamp="formatDate(log.timestamp)"
        :color="timelineColor(log.level)"
        placement="top"
      >
        <div class="event-block" :class="`level-${log.level.toLowerCase()}`">
          <div class="event-header">
            <div class="event-meta">
              <ElTag :type="levelType(log.level)" size="small" effect="plain">{{
                log.level
              }}</ElTag>
              <code>{{ log.event }}</code>
              <span>{{ log.module }}:{{ log.function }}:{{ log.line }}</span>
            </div>
            <ElButton
              v-if="isLong(log.message)"
              link
              type="primary"
              size="small"
              @click="toggle(log.id)"
            >
              {{ expanded[log.id] ? '收起' : '展开' }}
            </ElButton>
          </div>
          <div
            class="event-message"
            :class="{ collapsed: isLong(log.message) && !expanded[log.id] }"
          >
            {{ log.message }}
          </div>
        </div>
      </ElTimelineItem>
    </ElTimeline>
  </ElCard>
</template>

<script setup lang="ts">
  defineOptions({ name: 'LogTimeline' })

  defineProps<{ logs: Api.Logs.LogEntry[] }>()
  const expanded = ref<Record<number, boolean>>({})
  const isLong = (message: string) => message.length > 220
  const formatDate = (value: string) => new Date(value).toLocaleString('zh-CN', { hour12: false })
  const toggle = (id: number) => {
    expanded.value[id] = !expanded.value[id]
  }
  const levelType = (level: Api.Logs.LogLevel) =>
    ({
      SUCCESS: 'success',
      ERROR: 'danger',
      CRITICAL: 'danger',
      WARNING: 'warning',
      INFO: 'primary',
      DEBUG: 'info'
    })[level] as 'success' | 'danger' | 'warning' | 'primary' | 'info'
  const timelineColor = (level: Api.Logs.LogLevel) =>
    ({
      SUCCESS: '#16a36f',
      ERROR: '#dc4c4c',
      CRITICAL: '#a92f2f',
      WARNING: '#d49124',
      INFO: '#3b82c4',
      DEBUG: '#71717a'
    })[level]
</script>

<style scoped lang="scss">
  .timeline-card {
    height: 100%;
  }

  .panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .panel-title {
    font-size: 14px;
    font-weight: 600;
  }

  .event-count {
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }

  .event-timeline {
    padding: 4px 2px 0;
  }

  .event-block {
    padding: 11px 12px;
    background: var(--el-bg-color);
    border: 1px solid var(--el-border-color-lighter);
    border-left: 3px solid #3b82c4;
    border-radius: 4px;
  }

  .event-block.level-success {
    border-left-color: #16a36f;
  }

  .event-block.level-warning {
    border-left-color: #d49124;
  }

  .event-block.level-error,
  .event-block.level-critical {
    border-left-color: #dc4c4c;
  }

  .event-block.level-debug {
    border-left-color: #71717a;
  }

  .event-header {
    display: flex;
    gap: 12px;
    align-items: flex-start;
    justify-content: space-between;
  }

  .event-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
    min-width: 0;
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }

  .event-meta code {
    color: var(--el-text-color-primary);
  }

  .event-message {
    margin-top: 8px;
    font-size: 13px;
    line-height: 1.55;
    word-break: break-word;
    white-space: pre-wrap;
  }

  .event-message.collapsed {
    display: -webkit-box;
    overflow: hidden;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 3;
  }
</style>
