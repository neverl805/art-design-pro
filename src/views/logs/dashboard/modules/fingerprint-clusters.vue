<template>
  <ElCard shadow="never" class="cluster-panel">
    <template #header>
      <div class="panel-header">
        <div>
          <span class="panel-title">指纹与代理组合 Solve 成功率</span>
          <span v-if="stats" class="coverage">
            覆盖 {{ stats.covered_samples }} / {{ stats.sample_total }} ·
            {{ stats.coverage_rate.toFixed(1) }}%
          </span>
        </div>
        <ElSelect
          v-model="selectedDimensions"
          multiple
          collapse-tags
          collapse-tags-tooltip
          :max-collapse-tags="3"
          size="small"
          class="dimension-select"
          placeholder="选择聚类维度"
        >
          <ElOption
            v-for="option in dimensionOptions"
            :key="option.value"
            :label="option.label"
            :value="option.value"
          />
        </ElSelect>
      </div>
    </template>

    <ElTable
      :data="stats?.clusters || []"
      size="small"
      v-loading="Boolean(loading)"
      empty-text="暂无带指纹维度的样本"
      max-height="460"
    >
      <ElTableColumn label="组合" min-width="300">
        <template #default="{ row }">
          <div class="dimension-tags">
            <ElTag
              v-for="name in stats?.group_by || []"
              :key="name"
              size="small"
              effect="plain"
              type="info"
            >
              {{ dimensionLabel(name) }}: {{ displayValue(row.dimensions[name]) }}
            </ElTag>
          </div>
        </template>
      </ElTableColumn>
      <ElTableColumn prop="total" label="样本" width="70" align="right" />
      <ElTableColumn label="成功分布" min-width="190">
        <template #default="{ row }">
          <div class="distribution-head">
            <strong>{{ row.success_rate.toFixed(1) }}%</strong>
            <span>{{ row.success }} 成功 · {{ row.failure }} 失败</span>
          </div>
          <div class="distribution-track">
            <span class="success-bar" :style="{ width: `${row.success_rate}%` }"></span>
            <span class="failure-bar" :style="{ width: `${100 - row.success_rate}%` }"></span>
          </div>
        </template>
      </ElTableColumn>
      <ElTableColumn label="直通率" width="86" align="right">
        <template #default="{ row }">{{ row.direct_rate.toFixed(1) }}%</template>
      </ElTableColumn>
      <ElTableColumn label="Solve 平均 / P95" width="154" align="right">
        <template #default="{ row }">
          {{ formatDuration(row.average_duration_ms) }} /
          {{ formatDuration(row.p95_duration_ms) }}
        </template>
      </ElTableColumn>
      <ElTableColumn label="HTTP / 沙箱" width="142" align="right">
        <template #default="{ row }">
          {{ formatDuration(row.average_http_ms) }} /
          {{ formatDuration(row.average_sandbox_ms) }}
        </template>
      </ElTableColumn>
    </ElTable>
  </ElCard>
</template>

<script setup lang="ts">
  defineOptions({ name: 'FingerprintClusters' })

  const props = defineProps<{
    stats: Api.Logs.FingerprintClusterResponse | null
    dimensions: string[]
    loading?: boolean
  }>()
  const emit = defineEmits<{ change: [dimensions: string[]] }>()

  const selectedDimensions = ref([...props.dimensions])
  const dimensionOptions = [
    { label: 'Profile', value: 'profile_variant' },
    { label: 'Profile ID', value: 'profile_id' },
    { label: '语言', value: 'locale' },
    { label: '时区', value: 'timezone' },
    { label: 'hCaptcha 版本', value: 'hcaptcha_version' },
    { label: 'VMData slots', value: 'vmdata_slots' },
    { label: '代理国家', value: 'proxy_country' },
    { label: '代理 ASN', value: 'proxy_asn' },
    { label: '代理 ISP', value: 'proxy_isp' },
    { label: '代理端点', value: 'proxy_endpoint' },
    { label: '代理协议', value: 'proxy_scheme' },
    { label: '代理会话', value: 'proxy_session_mode' },
    { label: '代理时区', value: 'proxy_timezone' }
  ]

  watch(
    selectedDimensions,
    (value) => {
      if (value.length) emit('change', [...value])
    },
    { deep: true }
  )
  watch(
    () => props.dimensions,
    (value) => {
      if (value.join(',') !== selectedDimensions.value.join(',')) {
        selectedDimensions.value = [...value]
      }
    },
    { deep: true }
  )

  const dimensionLabel = (value: string) =>
    dimensionOptions.find((option) => option.value === value)?.label || value
  const displayValue = (value: string | number | boolean | null | undefined) =>
    value === null || value === undefined || value === '' ? '--' : String(value)
  const formatDuration = (ms: number) =>
    ms < 1000 ? `${ms.toFixed(0)} ms` : `${(ms / 1000).toFixed(2)} s`
</script>

<style scoped lang="scss">
  .cluster-panel {
    min-height: 250px;
  }

  .panel-header {
    display: flex;
    gap: 14px;
    align-items: center;
    justify-content: space-between;
  }

  .panel-title {
    font-size: 14px;
    font-weight: 600;
  }

  .coverage {
    margin-left: 10px;
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }

  .dimension-select {
    width: min(520px, 48vw);
  }

  .dimension-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
  }

  .distribution-head {
    display: flex;
    gap: 8px;
    align-items: baseline;
    justify-content: space-between;
    margin-bottom: 5px;
  }

  .distribution-head strong {
    font-size: 12px;
  }

  .distribution-head span {
    font-size: 11px;
    color: var(--el-text-color-secondary);
  }

  .distribution-track {
    display: flex;
    width: 100%;
    height: 7px;
    overflow: hidden;
    background: var(--el-fill-color-light);
  }

  .success-bar {
    background: #16a36f;
  }

  .failure-bar {
    background: #dc4c4c;
  }

  @media (width <= 800px) {
    .panel-header {
      flex-direction: column;
      align-items: flex-start;
    }

    .dimension-select {
      width: 100%;
    }

    .coverage {
      display: block;
      margin: 4px 0 0;
    }
  }
</style>
