<!-- 日志时间线组件 -->
<template>
  <ElCard shadow="never">
    <template #header>
      <div class="flex items-center justify-between">
        <span class="font-semibold">日志时间线</span>
        <div class="flex items-center gap-2">
          <ElButton
            v-if="hasLongTexts"
            link
            type="primary"
            size="small"
            @click="toggleAllExpand"
          >
            {{ allExpanded ? '全部收起' : '全部展开' }}
          </ElButton>
        </div>
      </div>
    </template>
    <ElTimeline>
      <ElTimelineItem
        v-for="log in logs"
        :key="log.id"
        :timestamp="log.timestamp"
        :color="getTimelineColor(log.level)"
        placement="top"
      >
        <ElCard :body-style="{ padding: '16px' }" :class="`log-card log-${log.level.toLowerCase()}`">
          <div class="flex items-center justify-between mb-2">
            <div class="flex items-center gap-2">
              <ElTag :type="getLevelType(log.level)" size="small">{{ log.level }}</ElTag>
              <span class="text-sm text-gray-600">
                {{ log.module }}.{{ log.function }}:{{ log.line }}
              </span>
            </div>
            <span class="text-xs text-gray-500">{{ log.ip }}</span>
          </div>
          <div class="log-message-wrapper">
            <div
              class="text-sm whitespace-pre-wrap transition-all duration-300"
              :class="{ 'message-collapsed': !expandedLogs[log.id] && isLongText(log.message) }"
            >
              {{ log.message }}
            </div>
            <div v-if="isLongText(log.message)" class="mt-2">
              <ElButton
                link
                type="primary"
                size="small"
                @click="toggleExpand(log.id)"
              >
                {{ expandedLogs[log.id] ? '收起' : '查看全部' }}
                <Icon
                  :icon="expandedLogs[log.id] ? 'ri:arrow-up-s-line' : 'ri:arrow-down-s-line'"
                  class="ml-1"
                />
              </ElButton>
            </div>
          </div>
        </ElCard>
      </ElTimelineItem>
    </ElTimeline>
  </ElCard>
</template>

<script setup lang="ts">
  import Icon from '@/components/core/base/art-svg-icon/index.vue'

  defineOptions({ name: 'LogTimeline' })

  interface Props {
    logs: Api.Logs.LogEntry[]
  }

  const props = defineProps<Props>()

  // 长文本阈值（字符数）
  const LONG_TEXT_THRESHOLD = 200

  // 每个日志的展开状态
  const expandedLogs = ref<Record<string, boolean>>({})

  // 是否所有长文本都已展开
  const allExpanded = computed(() => {
    const longTextLogs = props.logs.filter((log) => isLongText(log.message))
    if (longTextLogs.length === 0) return false
    return longTextLogs.every((log) => expandedLogs.value[log.id])
  })

  // 是否存在长文本
  const hasLongTexts = computed(() => {
    return props.logs.some((log) => isLongText(log.message))
  })

  // 判断是否为长文本
  const isLongText = (text: string): boolean => {
    return text.length > LONG_TEXT_THRESHOLD
  }

  // 切换单个日志的展开状态
  const toggleExpand = (logId: string) => {
    expandedLogs.value[logId] = !expandedLogs.value[logId]
  }

  // 切换所有日志的展开状态
  const toggleAllExpand = () => {
    const newState = !allExpanded.value
    props.logs.forEach((log) => {
      if (isLongText(log.message)) {
        expandedLogs.value[log.id] = newState
      }
    })
  }

  const getLevelType = (level: string) => {
    const typeMap: Record<string, any> = {
      DEBUG: 'info',
      INFO: 'primary',
      WARNING: 'warning',
      ERROR: 'danger',
      CRITICAL: 'danger'
    }
    return typeMap[level] || 'info'
  }

  const getTimelineColor = (level: string) => {
    const colorMap: Record<string, string> = {
      DEBUG: '#909399',
      INFO: '#409eff',
      WARNING: '#e6a23c',
      ERROR: '#f56c6c',
      CRITICAL: '#8b0000'
    }
    return colorMap[level] || '#909399'
  }
</script>

<style scoped lang="scss">
  .log-card {
    border-left: 3px solid #dcdfe6;
    transition: all 0.3s;

    &:hover {
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
    }

    &.log-error,
    &.log-critical {
      border-left-color: #f56c6c;
      background-color: #fef0f0;

      // 暗色主题下的背景色
      html.dark & {
        background-color: #3a1515;
        border-left-color: #f56c6c;
      }
    }

    &.log-warning {
      border-left-color: #e6a23c;
      background-color: #fdf6ec;

      // 暗色主题下的背景色
      html.dark & {
        background-color: #3a2a15;
        border-left-color: #e6a23c;
      }
    }

    &.log-info {
      border-left-color: #409eff;
    }

    &.log-debug {
      border-left-color: #909399;
    }
  }

  .log-message-wrapper {
    .message-collapsed {
      max-height: 120px;
      overflow: hidden;
      position: relative;

      &::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 40px;
        background: linear-gradient(to bottom, transparent, var(--el-bg-color));
      }
    }
  }
</style>
