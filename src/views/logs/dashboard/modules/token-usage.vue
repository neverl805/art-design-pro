<template>
  <ElCard shadow="never" class="token-panel">
    <template #header>
      <div class="panel-header">
        <span class="panel-title">Token 配额</span>
        <ElTag :type="stats.token_usage.available ? 'success' : 'info'" size="small" effect="plain">
          {{ stats.token_usage.available ? '已连接' : '未连接' }}
        </ElTag>
      </div>
    </template>
    <ElTable
      :data="stats.token_usage.tokens"
      size="small"
      height="240"
      empty-text="暂无 token 数据"
    >
      <ElTableColumn prop="token_hint" label="Token" min-width="110" />
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
  defineOptions({ name: 'TokenUsage' })
  defineProps<{ stats: Api.Logs.OverviewStats }>()
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
</style>
