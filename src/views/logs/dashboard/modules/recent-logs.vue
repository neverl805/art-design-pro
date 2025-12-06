<!-- 最近日志列表 -->
<template>
  <ElCard shadow="never">
    <template #header>
      <div class="card-header flex items-center justify-between">
        <span class="font-semibold">最近日志</span>
        <ElButton link type="primary" @click="goToList">
          查看更多
          <Icon icon="ri:arrow-right-line" class="ml-1" />
        </ElButton>
      </div>
    </template>
    <div v-loading="loading" class="recent-logs">
      <div v-if="logs.length > 0" class="log-list">
        <transition-group name="log-item">
          <div
            v-for="log in logs"
            :key="log.id"
            class="log-item"
            :class="`log-${log.level.toLowerCase()}`"
          >
            <div class="log-header flex items-center justify-between">
              <div class="flex items-center gap-2 flex-wrap">
                <ElTag :type="getLevelType(log.level)" size="small">{{ log.level }}</ElTag>
                <span class="text-xs text-gray-500">{{ log.timestamp }}</span>
                <ElTag size="small" effect="plain">
                  <Icon icon="ri:global-line" class="mr-1" />
                  {{ log.ip }}
                </ElTag>
              </div>
              <ElButton
                link
                type="primary"
                size="small"
                @click="goToDetail(log.request_id)"
              >
                查看详情
                <Icon icon="ri:arrow-right-line" class="ml-1" />
              </ElButton>
            </div>
            <div class="log-body mt-2">
              <div class="text-sm text-gray-600 flex items-center gap-1">
                <Icon icon="ri:file-code-line" />
                {{ log.module }}.{{ log.function }}:{{ log.line }}
              </div>
              <div class="text-sm mt-2 log-message">{{ log.message }}</div>
            </div>
          </div>
        </transition-group>
      </div>
      <ElEmpty v-else description="暂无日志" />
    </div>
  </ElCard>
</template>

<script setup lang="ts">
  import { useRouter } from 'vue-router'
  import Icon from '@/components/core/base/art-svg-icon/index.vue'

  defineOptions({ name: 'RecentLogs' })

  interface Props {
    stats: Api.Logs.OverviewStats | null
    loading?: boolean
  }

  const props = defineProps<Props>()
  const router = useRouter()

  const logs = computed(() => props.stats?.recent_logs || [])

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

  const goToList = () => {
    router.push('/logs/list')
  }

  const goToDetail = (requestId: string) => {
    router.push(`/logs/detail/${requestId}`)
  }
</script>

<style scoped lang="scss">
  .recent-logs {
    min-height: 400px;

    .log-list {
      .log-item {
        padding: 16px;
        margin-bottom: 12px;
        border-radius: 8px;
        border: 1px solid var(--el-border-color-light);
        background: var(--el-bg-color);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        cursor: pointer;

        &:hover {
          border-color: var(--el-color-primary);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          transform: translateY(-2px);
        }

        &:last-child {
          margin-bottom: 0;
        }

        &.log-error,
        &.log-critical {
          background: linear-gradient(to right, #fef0f0 0%, var(--el-bg-color) 20%);
          border-left: 3px solid #f56c6c;

          // 暗色主题下的背景渐变
          html.dark & {
            background: linear-gradient(to right, #3a1515 0%, var(--el-bg-color) 20%);
          }
        }

        &.log-warning {
          background: linear-gradient(to right, #fdf6ec 0%, var(--el-bg-color) 20%);
          border-left: 3px solid #e6a23c;

          // 暗色主题下的背景渐变
          html.dark & {
            background: linear-gradient(to right, #3a2a15 0%, var(--el-bg-color) 20%);
          }
        }

        &.log-info {
          border-left: 3px solid #409eff;
        }

        &.log-debug {
          border-left: 3px solid #909399;
        }

        .log-header {
          padding-bottom: 8px;
          border-bottom: 1px solid var(--el-border-color-lighter);
        }

        .log-body {
          .log-message {
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
            line-height: 1.6;
            color: var(--el-text-color-regular);
          }
        }
      }
    }
  }

  // 列表项动画
  .log-item-enter-active,
  .log-item-leave-active {
    transition: all 0.3s ease;
  }

  .log-item-enter-from {
    opacity: 0;
    transform: translateX(-20px);
  }

  .log-item-leave-to {
    opacity: 0;
    transform: translateX(20px);
  }

  .log-item-move {
    transition: transform 0.3s ease;
  }
</style>
