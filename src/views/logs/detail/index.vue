<template>
  <div class="request-detail" v-loading="loading">
    <header class="detail-toolbar">
      <div class="toolbar-left">
        <ElTooltip content="返回请求记录" placement="bottom">
          <ElButton circle @click="router.back()"><Icon icon="ri:arrow-left-line" /></ElButton>
        </ElTooltip>
        <div>
          <div class="detail-title">请求详情</div>
          <div class="request-id">{{ requestId }}</div>
        </div>
        <ElTag v-if="logGroup" :type="outcomeType(logGroup.outcome)" size="small" effect="plain">
          {{ outcomeLabel(logGroup.outcome) }}
        </ElTag>
      </div>
      <ElTooltip content="刷新详情" placement="bottom">
        <ElButton circle :loading="loading" @click="loadDetail"
          ><Icon icon="ri:refresh-line"
        /></ElButton>
      </ElTooltip>
    </header>

    <div v-if="logGroup" class="detail-grid">
      <aside><LogInfo :log-group="logGroup" /></aside>
      <main>
        <ChainTiming :spans="logGroup.spans" :metrics="logGroup.trace_metrics" />
        <LogTimeline :logs="logGroup.logs" />
      </main>
    </div>
    <ElEmpty v-else-if="!loading" description="未找到请求" />
  </div>
</template>

<script setup lang="ts">
  import { fetchLogDetail } from '@/api/logs'
  import Icon from '@/components/core/base/art-svg-icon/index.vue'
  import ChainTiming from './modules/chain-timing.vue'
  import LogInfo from './modules/log-info.vue'
  import LogTimeline from './modules/log-timeline.vue'

  defineOptions({ name: 'LogsDetail' })

  const router = useRouter()
  const route = useRoute()
  const requestId = computed(() => String(route.params.requestId || ''))
  const loading = ref(false)
  const logGroup = ref<Api.Logs.LogGroup | null>(null)

  const loadDetail = async () => {
    if (!requestId.value) return
    loading.value = true
    try {
      logGroup.value = await fetchLogDetail(requestId.value)
    } catch (error) {
      console.error('获取请求详情失败:', error)
      ElMessage.error('获取请求详情失败')
    } finally {
      loading.value = false
    }
  }
  const outcomeLabel = (outcome: Api.Logs.RequestOutcome) =>
    ({
      success: '成功',
      failure: '失败',
      rejected: '拒绝',
      in_progress: '进行中',
      completed: '完成',
      other: '其他'
    })[outcome]
  const outcomeType = (outcome: Api.Logs.RequestOutcome) =>
    ({
      success: 'success',
      failure: 'danger',
      rejected: 'warning',
      in_progress: 'primary',
      completed: 'info',
      other: 'info'
    })[outcome] as 'success' | 'danger' | 'warning' | 'primary' | 'info'

  onMounted(loadDetail)
  watch(requestId, loadDetail)
</script>

<style scoped lang="scss">
  .request-detail {
    min-height: 100%;
  }

  .detail-toolbar {
    display: flex;
    gap: 16px;
    align-items: center;
    justify-content: space-between;
    padding-bottom: 14px;
    margin-bottom: 16px;
    border-bottom: 1px solid var(--el-border-color-light);
  }

  .toolbar-left {
    display: flex;
    gap: 12px;
    align-items: center;
    min-width: 0;
  }

  .detail-title {
    font-size: 18px;
    font-weight: 600;
  }

  .request-id {
    max-width: 520px;
    overflow: hidden;
    font-size: 12px;
    color: var(--el-text-color-secondary);
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .detail-grid {
    display: grid;
    grid-template-columns: minmax(300px, 380px) minmax(0, 1fr);
    gap: 16px;
    align-items: start;
  }

  .detail-grid main {
    min-width: 0;
  }

  @media (width <= 980px) {
    .detail-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
