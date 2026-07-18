<template>
  <ElCard shadow="never" class="token-panel">
    <template #header>
      <div class="panel-header">
        <span class="panel-title">Token 配额</span>
        <div class="panel-actions">
          <ElTag
            :type="stats.token_usage.available ? 'success' : 'info'"
            size="small"
            effect="plain"
          >
            {{ stats.token_usage.available ? '已连接' : '未连接' }}
          </ElTag>
          <ElTooltip content="管理 Token" placement="top">
            <ElButton link type="primary" @click="router.push('/logs/tokens')">
              <Icon icon="ri:settings-3-line" />
            </ElButton>
          </ElTooltip>
        </div>
      </div>
    </template>
    <ElTable
      :data="stats.token_usage.tokens"
      size="small"
      height="240"
      empty-text="暂无 token 数据"
    >
      <ElTableColumn label="Token" min-width="150">
        <template #default="{ row }">
          <span class="token-value">{{ row.token || row.token_hint }}</span>
        </template>
      </ElTableColumn>
      <ElTableColumn prop="remaining" label="剩余" width="80" align="right" />
      <ElTableColumn prop="used" label="已用" width="72" align="right" />
      <ElTableColumn prop="pending" label="预留" width="72" align="right" />
      <ElTableColumn label="状态" width="76" align="right">
        <template #default="{ row }">
          <ElTag :type="row.enabled ? 'success' : 'danger'" size="small" effect="plain">
            {{ row.enabled ? '启用' : '停用' }}
          </ElTag>
        </template>
      </ElTableColumn>
    </ElTable>
  </ElCard>
</template>

<script setup lang="ts">
  import Icon from '@/components/core/base/art-svg-icon/index.vue'

  defineOptions({ name: 'TokenUsage' })
  defineProps<{ stats: Api.Logs.OverviewStats }>()
  const router = useRouter()
</script>

<style scoped lang="scss">
  .token-panel {
    min-height: 308px;
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

  .token-value {
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    word-break: break-all;
  }

  .panel-actions {
    display: flex;
    gap: 8px;
    align-items: center;
  }
</style>
