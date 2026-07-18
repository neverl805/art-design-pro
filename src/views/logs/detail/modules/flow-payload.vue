<template>
  <ElCard shadow="never" class="payload-card">
    <template #header>
      <div class="panel-header">
        <span class="panel-title">流程参数与指纹</span>
        <span class="payload-count">{{ totalEntries }} 组</span>
      </div>
    </template>

    <ElTabs v-model="activeTab">
      <ElTabPane name="request">
        <template #label>请求参数 {{ requestEntries.length }}</template>
        <ElEmpty v-if="!requestEntries.length" description="暂无请求参数" :image-size="56" />
        <section v-for="entry in requestEntries" :key="entry.id" class="payload-section">
          <div class="payload-toolbar">
            <span>{{ formatDate(entry.timestamp) }}</span>
            <ElTooltip content="复制请求参数" placement="top">
              <ElButton circle size="small" @click="copyPayload(entry.payload)">
                <Icon icon="ri:file-copy-line" />
              </ElButton>
            </ElTooltip>
          </div>
          <pre>{{ formatJson(entry.payload) }}</pre>
        </section>
      </ElTabPane>

      <ElTabPane name="response">
        <template #label>返回参数 {{ responseEntries.length }}</template>
        <ElEmpty v-if="!responseEntries.length" description="暂无返回参数" :image-size="56" />
        <section v-for="entry in responseEntries" :key="entry.id" class="payload-section">
          <div class="payload-toolbar">
            <span>{{ formatDate(entry.timestamp) }}</span>
            <ElTooltip content="复制返回参数" placement="top">
              <ElButton circle size="small" @click="copyPayload(entry.payload)">
                <Icon icon="ri:file-copy-line" />
              </ElButton>
            </ElTooltip>
          </div>
          <pre>{{ formatJson(entry.payload) }}</pre>
        </section>
      </ElTabPane>

      <ElTabPane name="trace">
        <template #label>指纹与尝试 {{ traceEntries.length }}</template>
        <ElEmpty v-if="!traceEntries.length" description="暂无指纹快照" :image-size="56" />
        <section v-for="entry in traceEntries" :key="entry.id" class="payload-section">
          <div class="payload-toolbar">
            <span>
              Attempt {{ attemptOf(entry.payload) }} · {{ formatDate(entry.timestamp) }}
            </span>
            <ElTooltip content="复制指纹快照" placement="top">
              <ElButton circle size="small" @click="copyPayload(entry.payload)">
                <Icon icon="ri:file-copy-line" />
              </ElButton>
            </ElTooltip>
          </div>
          <pre>{{ formatJson(entry.payload) }}</pre>
        </section>
      </ElTabPane>
    </ElTabs>
  </ElCard>
</template>

<script setup lang="ts">
  import Icon from '@/components/core/base/art-svg-icon/index.vue'

  defineOptions({ name: 'FlowPayload' })

  const props = defineProps<{ logs: Api.Logs.LogEntry[] }>()
  const activeTab = ref('request')

  const entriesFor = (event: string) =>
    props.logs
      .filter((log) => log.event === event)
      .map((log) => ({
        id: log.id,
        timestamp: log.timestamp,
        payload: log.attributes.payload
      }))
      .filter((entry) => entry.payload != null)

  const requestEntries = computed(() => entriesFor('request_payload'))
  const responseEntries = computed(() => entriesFor('response_payload'))
  const traceEntries = computed(() => entriesFor('hcaptcha_trace'))
  const totalEntries = computed(
    () => requestEntries.value.length + responseEntries.value.length + traceEntries.value.length
  )

  const formatJson = (value: unknown) => JSON.stringify(value, null, 2)
  const formatDate = (value: string) => new Date(value).toLocaleString('zh-CN', { hour12: false })
  const attemptOf = (value: unknown) => {
    if (value && typeof value === 'object' && 'attempt' in value) {
      return String((value as Record<string, unknown>).attempt ?? '--')
    }
    return '--'
  }
  const copyPayload = async (value: unknown) => {
    const text = formatJson(value)
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text)
    } else {
      const textarea = document.createElement('textarea')
      textarea.value = text
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      textarea.remove()
    }
    ElMessage.success('已复制')
  }
</script>

<style scoped lang="scss">
  .payload-card {
    margin-bottom: 16px;
  }

  .panel-header,
  .payload-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .panel-title {
    font-size: 14px;
    font-weight: 600;
  }

  .payload-count,
  .payload-toolbar {
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }

  .payload-section + .payload-section {
    margin-top: 14px;
    border-top: 1px solid var(--el-border-color-lighter);
  }

  .payload-toolbar {
    min-height: 34px;
    padding: 4px 0;
  }

  .payload-section pre {
    max-height: 620px;
    padding: 12px;
    margin: 0;
    overflow: auto;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    font-size: 11px;
    line-height: 1.55;
    word-break: break-all;
    white-space: pre-wrap;
    background: var(--el-fill-color-light);
    border: 1px solid var(--el-border-color-lighter);
  }
</style>
