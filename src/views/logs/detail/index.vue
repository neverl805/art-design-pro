<!-- 日志详情页 -->
<template>
  <div v-loading="loading" class="logs-detail-container">
    <!-- 固定顶部操作栏 -->
    <ElAffix :offset="0" class="detail-affix">
      <div class="detail-header">
        <div class="header-content">
          <div class="header-left">
            <ElButton @click="goBack" v-ripple>
              <Icon icon="ri:arrow-left-line" class="mr-1" />
              返回列表
            </ElButton>
            <ElDivider direction="vertical" />
            <div v-if="logGroup" class="header-info">
              <ElTag type="info" size="small">
                <Icon icon="ri:fingerprint-line" class="mr-1" />
                {{ logGroup.request_id }}
              </ElTag>
              <ElTag :type="logGroup.has_error ? 'danger' : 'success'" size="small" class="ml-2">
                {{ logGroup.has_error ? '有错误' : '正常' }}
              </ElTag>
            </div>
          </div>
          <div class="header-right">
            <ElButton @click="refreshData" :loading="loading" v-ripple>
              <Icon icon="ri:refresh-line" class="mr-1" />
              刷新
            </ElButton>
          </div>
        </div>
      </div>
    </ElAffix>

    <!-- 主内容区域 -->
    <div v-if="logGroup" class="detail-content">
      <!-- 左侧基本信息（使用 ElScrollbar） -->
      <div class="info-section">
        <ElScrollbar height="100%">
          <div class="info-wrapper">
            <LogInfo :log-group="logGroup" />
          </div>
        </ElScrollbar>
      </div>

      <!-- 右侧时间线（使用 ElScrollbar） -->
      <div class="timeline-section">
        <ElScrollbar height="100%">
          <div class="timeline-wrapper">
            <LogTimeline :logs="logGroup.logs" />
          </div>
        </ElScrollbar>
      </div>
    </div>

    <ElEmpty v-else-if="!loading" description="未找到日志数据" class="empty-state" />
  </div>
</template>

<script setup lang="ts">
  import { useRouter, useRoute } from 'vue-router'
  import { fetchLogDetail } from '@/api/logs'
  import LogInfo from './modules/log-info.vue'
  import LogTimeline from './modules/log-timeline.vue'
  import Icon from '@/components/core/base/art-svg-icon/index.vue'

  defineOptions({ name: 'LogsDetail' })

  const router = useRouter()
  const route = useRoute()
  const loading = ref(false)
  const logGroup = ref<Api.Logs.LogGroup | null>(null)

  const requestId = computed(() => route.params.requestId as string)

  // 获取日志详情
  const getLogDetail = async () => {
    if (!requestId.value) {
      ElMessage.error('请求ID不能为空')
      goBack()
      return
    }

    loading.value = true
    try {
      logGroup.value = await fetchLogDetail(requestId.value)
    } catch (error: any) {
      console.error('获取日志详情失败:', error)
      if (error?.response?.status === 404) {
        ElMessage.error('未找到该请求的日志')
      } else {
        ElMessage.error('获取日志详情失败')
      }
    } finally {
      loading.value = false
    }
  }

  // 返回列表
  const goBack = () => {
    router.back()
  }

  // 刷新
  const refreshData = () => {
    getLogDetail()
  }

  onMounted(() => {
    getLogDetail()
  })

  // 监听路由参数变化
  watch(requestId, () => {
    getLogDetail()
  })
</script>

<style scoped lang="scss">
  .logs-detail-container {
    height: 100%;
    display: flex;
    flex-direction: column;
    background: var(--el-bg-color-page);

    // 固定头部样式
    .detail-affix {
      z-index: 100;

      :deep(.el-affix) {
        background: var(--el-bg-color);
      }
    }

    .detail-header {
      background: var(--el-bg-color);
      border-bottom: 1px solid var(--el-border-color-light);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

      .header-content {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px 20px;
        max-width: 100%;

        .header-left {
          display: flex;
          align-items: center;
          gap: 12px;
          flex: 1;
          min-width: 0;

          .header-info {
            display: flex;
            align-items: center;
            overflow: hidden;

            :deep(.el-tag) {
              max-width: 400px;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
            }
          }
        }

        .header-right {
          display: flex;
          align-items: center;
          gap: 12px;
        }
      }
    }

    // 主内容区域
    .detail-content {
      flex: 1;
      display: flex;
      gap: 20px;
      padding: 20px;
      overflow: hidden;
      min-height: 0;

      .info-section {
        flex-shrink: 0;
        width: 380px;
        height: 100%;
        background: var(--el-bg-color);
        border-radius: 8px;
        overflow: hidden;

        .info-wrapper {
          padding: 4px;
        }

        // ElScrollbar 自定义样式
        :deep(.el-scrollbar__bar.is-vertical) {
          width: 6px;
          right: 2px;

          .el-scrollbar__thumb {
            background: var(--el-border-color);
            border-radius: 3px;

            &:hover {
              background: var(--el-border-color-dark);
            }
          }
        }
      }

      .timeline-section {
        flex: 1;
        height: 100%;
        background: var(--el-bg-color);
        border-radius: 8px;
        overflow: hidden;

        .timeline-wrapper {
          padding: 4px;
        }

        // ElScrollbar 自定义样式
        :deep(.el-scrollbar__bar.is-vertical) {
          width: 6px;
          right: 2px;

          .el-scrollbar__thumb {
            background: var(--el-border-color);
            border-radius: 3px;

            &:hover {
              background: var(--el-border-color-dark);
            }
          }
        }
      }

      // 响应式布局
      @media (max-width: 768px) {
        flex-direction: column;
        padding: 12px;

        .info-section {
          width: 100%;
          height: auto;
          max-height: 400px;
        }

        .timeline-section {
          height: auto;
          flex: 1;
        }
      }
    }

    .empty-state {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
</style>
