<!-- 日志总览仪表板 -->
<template>
  <div class="logs-dashboard">
    <!-- 顶部操作栏 -->
    <div class="dashboard-header mb-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <h3 class="text-lg font-semibold m-0">日志总览</h3>
          <div v-if="lastUpdateTime" class="text-sm text-gray-500">
            最后更新: {{ lastUpdateTime }}
          </div>
        </div>
        <div class="flex items-center gap-3">
          <ElSwitch
            v-model="autoRefresh"
            active-text="自动刷新"
            inactive-text=""
            @change="handleAutoRefreshChange"
          />
          <ElButton @click="handleManualRefresh" :loading="loading" v-ripple>
            <Icon icon="ri:refresh-line" class="mr-1" />
            手动刷新
          </ElButton>
          <ElButton type="danger" @click="showCleanDialog = true" v-ripple>
            <Icon icon="ri:delete-bin-line" class="mr-1" />
            清除日志
          </ElButton>
        </div>
      </div>
    </div>

    <!-- 统计卡片 -->
    <transition name="fade-slide">
      <StatsCards v-if="overviewStats" :stats="overviewStats" :loading="loading" />
    </transition>

    <!-- 图表区域 -->
    <ElRow :gutter="20" class="mt-5">
      <ElCol :xs="24" :sm="24" :md="12">
        <transition name="fade-slide" :style="{ transitionDelay: '0.1s' }">
          <LevelChart v-if="overviewStats" :stats="overviewStats" :loading="loading" />
        </transition>
      </ElCol>
      <ElCol :xs="24" :sm="24" :md="12">
        <transition name="fade-slide" :style="{ transitionDelay: '0.2s' }">
          <IpStats v-if="overviewStats" :stats="overviewStats" :loading="loading" />
        </transition>
      </ElCol>
    </ElRow>

    <!-- 时间趋势图 -->
    <div class="mt-5">
      <transition name="fade-slide" :style="{ transitionDelay: '0.3s' }">
        <TimelineChart v-if="overviewStats" :stats="overviewStats" :loading="loading" />
      </transition>
    </div>

    <!-- 最近日志 -->
    <div class="mt-5">
      <transition name="fade-slide" :style="{ transitionDelay: '0.4s' }">
        <RecentLogs v-if="overviewStats" :stats="overviewStats" :loading="loading" />
      </transition>
    </div>

    <!-- 清除日志对话框 -->
    <ElDialog v-model="showCleanDialog" title="清除日志" width="500px" :close-on-click-modal="false">
      <div class="clean-dialog-content">
        <ElAlert type="warning" :closable="false" class="mb-4">
          <template #title>
            <div class="font-semibold">警告：此操作不可恢复</div>
          </template>
          <div class="text-sm">删除的日志将无法恢复，请谨慎操作</div>
        </ElAlert>

        <div class="mb-4">
          <div class="text-sm text-gray-600 mb-3">选择要保留的日志天数：</div>
          <ElRadioGroup v-model="cleanDays" class="clean-options">
            <ElRadio :value="7" size="large" border>保留最近7天</ElRadio>
            <ElRadio :value="15" size="large" border>保留最近15天</ElRadio>
            <ElRadio :value="30" size="large" border>保留最近30天</ElRadio>
            <ElRadio :value="60" size="large" border>保留最近60天</ElRadio>
            <ElRadio :value="90" size="large" border>保留最近90天</ElRadio>
            <ElRadio :value="-1" size="large" border>自定义天数</ElRadio>
            <ElRadio :value="0" size="large" border class="danger-option">
              <span class="text-red-600 font-semibold">清除所有日志</span>
            </ElRadio>
          </ElRadioGroup>
        </div>

        <div v-if="cleanDays === -1" class="mb-4">
          <ElInputNumber
            v-model="customDays"
            :min="1"
            :max="365"
            controls-position="right"
            placeholder="输入天数"
            class="w-full"
          />
        </div>

        <div class="text-sm text-gray-500">
          <Icon icon="ri:information-line" class="mr-1" />
          <span v-if="cleanDays === 0" class="text-red-600 font-semibold">
            将删除所有日志（{{ overviewStats?.total || 0 }}条）
          </span>
          <span v-else>
            将删除 {{ finalCleanDays }} 天前的所有日志
          </span>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end gap-2">
          <ElButton @click="showCleanDialog = false">取消</ElButton>
          <ElButton type="danger" @click="handleCleanLogs" :loading="cleanLoading">
            确认清除
          </ElButton>
        </div>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
  import { fetchLogOverview, cleanOldLogs } from '@/api/logs'
  import StatsCards from './modules/stats-cards.vue'
  import LevelChart from './modules/level-chart.vue'
  import TimelineChart from './modules/timeline-chart.vue'
  import IpStats from './modules/ip-stats.vue'
  import RecentLogs from './modules/recent-logs.vue'
  import Icon from '@/components/core/base/art-svg-icon/index.vue'

  defineOptions({ name: 'LogsDashboard' })

  const loading = ref(false)
  const overviewStats = ref<Api.Logs.OverviewStats | null>(null)
  const autoRefresh = ref(true)
  const lastUpdateTime = ref<string>('')

  // 清除日志相关状态
  const showCleanDialog = ref(false)
  const cleanDays = ref(30) // 默认保留30天
  const customDays = ref(30)
  const cleanLoading = ref(false)

  // 最终清除天数
  const finalCleanDays = computed(() => {
    if (cleanDays.value === 0) return 0 // 清除所有
    return cleanDays.value === -1 ? customDays.value : cleanDays.value
  })

  // 获取总览统计
  const getOverviewStats = async (showMessage = false) => {
    loading.value = true
    try {
      overviewStats.value = await fetchLogOverview()
      lastUpdateTime.value = new Date().toLocaleString('zh-CN', {
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
      if (showMessage) {
        ElMessage.success('数据已刷新')
      }
    } catch (error) {
      console.error('获取统计数据失败:', error)
      ElMessage.error('获取统计数据失败')
    } finally {
      loading.value = false
    }
  }

  // 手动刷新
  const handleManualRefresh = () => {
    getOverviewStats(true)
  }

  // 自动刷新
  const refreshInterval = ref<NodeJS.Timeout | null>(null)

  const startAutoRefresh = () => {
    // 每30秒刷新一次
    refreshInterval.value = setInterval(() => {
      getOverviewStats()
    }, 30000)
  }

  const stopAutoRefresh = () => {
    if (refreshInterval.value) {
      clearInterval(refreshInterval.value)
      refreshInterval.value = null
    }
  }

  // 处理自动刷新开关变化
  const handleAutoRefreshChange = (value: boolean) => {
    if (value) {
      startAutoRefresh()
      ElMessage.success('已开启自动刷新（30秒）')
    } else {
      stopAutoRefresh()
      ElMessage.info('已关闭自动刷新')
    }
  }

  // 处理清除日志
  const handleCleanLogs = async () => {
    const days = finalCleanDays.value

    // 构建确认消息
    let confirmMessage = ''
    if (days === 0) {
      confirmMessage = `确定要删除所有日志吗？共 ${overviewStats.value?.total || 0} 条日志将被永久删除！`
    } else {
      confirmMessage = `确定要删除 ${days} 天前的所有日志吗？此操作不可恢复！`
    }

    // 二次确认
    ElMessageBox.confirm(confirmMessage, '确认删除', {
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      type: 'warning',
      confirmButtonClass: 'el-button--danger'
    })
      .then(async () => {
        cleanLoading.value = true
        try {
          const result = await cleanOldLogs(days)
          ElMessage.success(result.message)
          showCleanDialog.value = false
          // 刷新数据
          await getOverviewStats()
        } catch (error: any) {
          console.error('清除日志失败:', error)
          ElMessage.error(error.message || '清除日志失败')
        } finally {
          cleanLoading.value = false
        }
      })
      .catch(() => {
        // 用户取消
      })
  }

  onMounted(() => {
    getOverviewStats()
    if (autoRefresh.value) {
      startAutoRefresh()
    }
  })

  onUnmounted(() => {
    stopAutoRefresh()
  })
</script>

<style scoped lang="scss">
  .logs-dashboard {
    padding: 0;

    .dashboard-header {
      padding: 16px;
      background: var(--el-bg-color);
      border-radius: 8px;
      border: 1px solid var(--el-border-color-light);
    }
  }

  .clean-dialog-content {
    .clean-options {
      display: flex;
      flex-direction: column;
      gap: 12px;
      width: 100%;

      :deep(.el-radio) {
        width: 100%;
        margin-right: 0;
      }

      .danger-option {
        :deep(.el-radio__label) {
          color: var(--el-color-danger);
        }

        &.is-checked {
          :deep(.el-radio__inner) {
            border-color: var(--el-color-danger);
            background-color: var(--el-color-danger);
          }
        }
      }
    }
  }

  // 淡入滑动动画
  .fade-slide-enter-active,
  .fade-slide-leave-active {
    transition: all 0.3s ease;
  }

  .fade-slide-enter-from {
    opacity: 0;
    transform: translateY(20px);
  }

  .fade-slide-leave-to {
    opacity: 0;
    transform: translateY(-20px);
  }
</style>
