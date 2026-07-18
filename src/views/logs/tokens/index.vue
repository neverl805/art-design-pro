<template>
  <div class="token-page">
    <header class="page-toolbar">
      <div>
        <h2>Token 管理</h2>
        <p>{{ summary.total }} 条记录 · 更新于 {{ lastUpdatedAt || '--' }}</p>
      </div>
      <div class="toolbar-actions">
        <ElSwitch v-model="autoRefresh" active-text="自动刷新" />
        <ElTooltip content="刷新数据" placement="bottom">
          <ElButton circle :loading="loading" @click="loadTokens(true)">
            <Icon icon="ri:refresh-line" />
          </ElButton>
        </ElTooltip>
        <ElButton type="primary" @click="openCreate">
          <Icon icon="ri:add-line" />
          新增 Token
        </ElButton>
      </div>
    </header>

    <section class="summary-grid">
      <div class="summary-item total">
        <span>记录</span>
        <strong>{{ summary.total.toLocaleString() }}</strong>
      </div>
      <div class="summary-item remaining">
        <span>剩余次数</span>
        <strong>{{ summary.remaining.toLocaleString() }}</strong>
      </div>
      <div class="summary-item used">
        <span>已使用</span>
        <strong>{{ summary.used.toLocaleString() }}</strong>
      </div>
      <div class="summary-item pending">
        <span>预留中</span>
        <strong>{{ summary.pending.toLocaleString() }}</strong>
      </div>
    </section>

    <ElCard shadow="never" class="table-panel">
      <ElTable
        v-loading="loading"
        :data="summary.tokens"
        row-key="token_id"
        empty-text="暂无 Token 记录"
      >
        <ElTableColumn label="Token" min-width="240">
          <template #default="{ row }">
            <span class="token-value">{{ row.token || row.token_hint }}</span>
          </template>
        </ElTableColumn>
        <ElTableColumn label="摘要 ID" min-width="150" show-overflow-tooltip>
          <template #default="{ row }">{{ compactId(row.token_id) }}</template>
        </ElTableColumn>
        <ElTableColumn prop="remaining" label="剩余" width="120" align="right">
          <template #default="{ row }">{{ row.remaining.toLocaleString() }}</template>
        </ElTableColumn>
        <ElTableColumn prop="used" label="已用" width="110" align="right">
          <template #default="{ row }">{{ row.used.toLocaleString() }}</template>
        </ElTableColumn>
        <ElTableColumn prop="pending" label="预留" width="80" align="right" />
        <ElTableColumn label="状态" width="96" align="center">
          <template #default="{ row }">
            <ElTag :type="statusType(row)" size="small" effect="plain">
              {{ statusLabel(row) }}
            </ElTag>
          </template>
        </ElTableColumn>
        <ElTableColumn label="过期时间" width="180">
          <template #default="{ row }">{{ formatTimestamp(row.expires_at) }}</template>
        </ElTableColumn>
        <ElTableColumn label="更新时间" width="180">
          <template #default="{ row }">{{ formatTimestamp(row.updated_at) }}</template>
        </ElTableColumn>
        <ElTableColumn label="" width="132" fixed="right" align="center">
          <template #default="{ row }">
            <ElTooltip content="编辑" placement="top">
              <ElButton link type="primary" @click="openEdit(row)">
                <Icon icon="ri:edit-line" />
              </ElButton>
            </ElTooltip>
            <ElTooltip :content="row.enabled ? '停用' : '启用'" placement="top">
              <ElButton link :type="row.enabled ? 'warning' : 'success'" @click="toggleToken(row)">
                <Icon :icon="row.enabled ? 'ri:pause-circle-line' : 'ri:play-circle-line'" />
              </ElButton>
            </ElTooltip>
            <ElTooltip content="删除" placement="top">
              <ElButton link type="danger" @click="removeToken(row)">
                <Icon icon="ri:delete-bin-6-line" />
              </ElButton>
            </ElTooltip>
          </template>
        </ElTableColumn>
      </ElTable>
    </ElCard>

    <ElDialog v-model="createVisible" title="新增 Token" width="min(520px, 92vw)" destroy-on-close>
      <ElForm label-position="top">
        <ElFormItem label="Token">
          <ElInput
            v-model="createForm.token"
            type="password"
            show-password
            clearable
            autocomplete="off"
          />
        </ElFormItem>
        <div class="form-grid">
          <ElFormItem label="可用次数">
            <ElInputNumber v-model="createForm.remaining" :min="0" :max="1000000000" />
          </ElFormItem>
          <ElFormItem label="状态">
            <ElSwitch v-model="createForm.enabled" active-text="启用" inactive-text="停用" />
          </ElFormItem>
        </div>
        <ElFormItem label="过期时间">
          <ElDatePicker
            v-model="createForm.expiresAt"
            type="datetime"
            clearable
            placeholder="长期有效"
          />
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="createVisible = false">取消</ElButton>
        <ElButton type="primary" :loading="saving" @click="submitCreate">保存</ElButton>
      </template>
    </ElDialog>

    <ElDialog v-model="editVisible" title="编辑 Token" width="min(520px, 92vw)" destroy-on-close>
      <ElForm label-position="top">
        <ElFormItem label="Token">
          <ElInput :model-value="editing?.token || editing?.token_hint" disabled />
        </ElFormItem>
        <div class="form-grid">
          <ElFormItem label="剩余次数">
            <ElInputNumber v-model="editForm.remaining" :min="0" :max="1000000000" />
          </ElFormItem>
          <ElFormItem label="已使用次数">
            <ElInputNumber v-model="editForm.used" :min="0" :max="1000000000" />
          </ElFormItem>
        </div>
        <div class="form-grid">
          <ElFormItem label="状态">
            <ElSwitch v-model="editForm.enabled" active-text="启用" inactive-text="停用" />
          </ElFormItem>
          <ElFormItem label="过期时间">
            <ElDatePicker
              v-model="editForm.expiresAt"
              type="datetime"
              clearable
              placeholder="长期有效"
            />
          </ElFormItem>
        </div>
      </ElForm>
      <template #footer>
        <ElButton @click="editVisible = false">取消</ElButton>
        <ElButton type="primary" :loading="saving" @click="submitEdit">保存</ElButton>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
  import { ElMessageBox } from 'element-plus'
  import {
    createTokenRecord,
    deleteTokenRecord,
    fetchTokenRecords,
    updateTokenRecord
  } from '@/api/logs'
  import Icon from '@/components/core/base/art-svg-icon/index.vue'

  defineOptions({ name: 'LogsTokens' })

  const emptySummary = (): Api.Logs.TokenRecordList => ({
    total: 0,
    remaining: 0,
    used: 0,
    pending: 0,
    tokens: []
  })
  const summary = ref<Api.Logs.TokenRecordList>(emptySummary())
  const loading = ref(false)
  const saving = ref(false)
  const autoRefresh = ref(true)
  const lastUpdatedAt = ref('')
  const createVisible = ref(false)
  const editVisible = ref(false)
  const editing = ref<Api.Logs.TokenRecord | null>(null)
  const createForm = reactive({
    token: '',
    remaining: 100,
    enabled: true,
    expiresAt: null as Date | null
  })
  const editForm = reactive({
    remaining: 0,
    used: 0,
    enabled: true,
    expiresAt: null as Date | null
  })

  const loadTokens = async (notify = false) => {
    loading.value = true
    try {
      summary.value = await fetchTokenRecords()
      lastUpdatedAt.value = new Date().toLocaleTimeString('zh-CN', { hour12: false })
      if (notify) ElMessage.success('Token 数据已刷新')
    } catch (error) {
      console.error('获取 Token 数据失败:', error)
      ElMessage.error('获取 Token 数据失败')
    } finally {
      loading.value = false
    }
  }

  const openCreate = () => {
    Object.assign(createForm, {
      token: '',
      remaining: 100,
      enabled: true,
      expiresAt: null
    })
    createVisible.value = true
  }

  const submitCreate = async () => {
    if (!createForm.token.trim()) {
      ElMessage.warning('请输入 Token')
      return
    }
    saving.value = true
    try {
      await createTokenRecord({
        token: createForm.token.trim(),
        remaining: createForm.remaining,
        enabled: createForm.enabled,
        expires_at: createForm.expiresAt ? createForm.expiresAt.getTime() / 1000 : null
      })
      createVisible.value = false
      await loadTokens()
      ElMessage.success('Token 已保存')
    } catch (error) {
      console.error('保存 Token 失败:', error)
      ElMessage.error('保存 Token 失败')
    } finally {
      saving.value = false
    }
  }

  const openEdit = (record: Api.Logs.TokenRecord) => {
    editing.value = record
    Object.assign(editForm, {
      remaining: record.remaining,
      used: record.used,
      enabled: record.enabled,
      expiresAt: record.expires_at ? new Date(record.expires_at * 1000) : null
    })
    editVisible.value = true
  }

  const submitEdit = async () => {
    if (!editing.value) return
    saving.value = true
    try {
      await updateTokenRecord(editing.value.token_id, {
        remaining: editForm.remaining,
        used: editForm.used,
        enabled: editForm.enabled,
        expires_at: editForm.expiresAt ? editForm.expiresAt.getTime() / 1000 : null
      })
      editVisible.value = false
      await loadTokens()
      ElMessage.success('Token 已更新')
    } catch (error) {
      console.error('更新 Token 失败:', error)
      ElMessage.error('更新 Token 失败')
    } finally {
      saving.value = false
    }
  }

  const toggleToken = async (record: Api.Logs.TokenRecord) => {
    try {
      await updateTokenRecord(record.token_id, { enabled: !record.enabled })
      await loadTokens()
      ElMessage.success(record.enabled ? 'Token 已停用' : 'Token 已启用')
    } catch (error) {
      console.error('切换 Token 状态失败:', error)
      ElMessage.error('切换 Token 状态失败')
    }
  }

  const removeToken = async (record: Api.Logs.TokenRecord) => {
    try {
      await ElMessageBox.confirm(
        `将删除 ${record.token || record.token_hint} 及其已结算记录。`,
        '删除 Token',
        {
          confirmButtonText: '删除',
          cancelButtonText: '取消',
          confirmButtonClass: 'el-button--danger',
          type: 'warning'
        }
      )
      await deleteTokenRecord(record.token_id)
      await loadTokens()
      ElMessage.success('Token 已删除')
    } catch (error) {
      if (error === 'cancel' || error === 'close') return
      console.error('删除 Token 失败:', error)
      ElMessage.error('删除 Token 失败；请确认没有正在执行的预留请求')
    }
  }

  const compactId = (value: string) => `${value.slice(0, 10)}...${value.slice(-8)}`
  const formatTimestamp = (value: number | null) =>
    value !== null ? new Date(value * 1000).toLocaleString('zh-CN', { hour12: false }) : '长期有效'
  const isExpired = (record: Api.Logs.TokenRecord) =>
    record.expires_at !== null && record.expires_at <= Date.now() / 1000
  const statusLabel = (record: Api.Logs.TokenRecord) => {
    if (!record.enabled) return '已停用'
    if (isExpired(record)) return '已过期'
    if (record.remaining === 0) return '已用尽'
    return '可用'
  }
  const statusType = (record: Api.Logs.TokenRecord) => {
    if (!record.enabled || isExpired(record)) return 'danger'
    if (record.remaining === 0) return 'warning'
    return 'success'
  }

  const pageActive = ref(false)
  const { pause, resume } = useIntervalFn(() => loadTokens(), 5_000, { immediate: false })
  watch(autoRefresh, (enabled) => (enabled && pageActive.value ? resume() : pause()))
  onActivated(() => {
    pageActive.value = true
    loadTokens()
    if (autoRefresh.value) resume()
  })
  onDeactivated(() => {
    pageActive.value = false
    pause()
  })
  onUnmounted(pause)
</script>

<style scoped lang="scss">
  .token-page {
    display: flex;
    flex-direction: column;
    min-height: 0;
  }

  .page-toolbar {
    display: flex;
    gap: 20px;
    align-items: center;
    justify-content: space-between;
    padding: 4px 0 16px;
    margin-bottom: 16px;
    border-bottom: 1px solid var(--el-border-color-light);
  }

  .page-toolbar h2 {
    margin: 0;
    font-size: 20px;
    line-height: 28px;
  }

  .page-toolbar p {
    margin: 3px 0 0;
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }

  .toolbar-actions {
    display: flex;
    flex-shrink: 0;
    gap: 10px;
    align-items: center;
  }

  .summary-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 12px;
    margin-bottom: 16px;
  }

  .summary-item {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    min-width: 0;
    height: 82px;
    padding: 14px 16px;
    background: var(--el-bg-color);
    border: 1px solid var(--el-border-color-light);
    border-left: 3px solid #737b8c;
    border-radius: 6px;
  }

  .summary-item span {
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }

  .summary-item strong {
    overflow: hidden;
    font-size: 22px;
    line-height: 28px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .summary-item.remaining {
    border-left-color: #15986b;
  }

  .summary-item.used {
    border-left-color: #3478c7;
  }

  .summary-item.pending {
    border-left-color: #ca8a04;
  }

  .table-panel {
    min-height: 520px;
  }

  .token-value {
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    word-break: break-all;
  }

  .form-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px;
  }

  :deep(.el-input-number),
  :deep(.el-date-editor) {
    width: 100%;
  }

  @media (width <= 900px) {
    .page-toolbar {
      flex-direction: column;
      align-items: flex-start;
    }

    .toolbar-actions {
      flex-wrap: wrap;
      width: 100%;
    }

    .summary-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (width <= 560px) {
    .summary-grid,
    .form-grid {
      grid-template-columns: minmax(0, 1fr);
    }
  }
</style>
