<template>
  <ElCard shadow="never" class="info-card">
    <template #header><span class="panel-title">请求摘要</span></template>
    <ElDescriptions :column="1" border size="small">
      <ElDescriptionsItem label="结果">
        <ElTag :type="outcomeType(logGroup.outcome)" size="small" effect="plain">
          {{ outcomeLabel(logGroup.outcome) }}
        </ElTag>
      </ElDescriptionsItem>
      <ElDescriptionsItem label="Request ID">
        <ElText type="primary" class="break-all">{{ logGroup.request_id }}</ElText>
      </ElDescriptionsItem>
      <ElDescriptionsItem label="Session ID">
        <span class="break-all">{{ logGroup.session_id }}</span>
      </ElDescriptionsItem>
      <ElDescriptionsItem label="目标 Host">{{ logGroup.target_host || '--' }}</ElDescriptionsItem>
      <ElDescriptionsItem label="接口"
        >{{ logGroup.method }} {{ logGroup.path }}</ElDescriptionsItem
      >
      <ElDescriptionsItem label="HTTP 状态">{{ logGroup.http_status ?? '--' }}</ElDescriptionsItem>
      <ElDescriptionsItem label="客户端 IP">{{ logGroup.ip }}</ElDescriptionsItem>
      <ElDescriptionsItem label="开始时间">{{
        formatDate(logGroup.start_time)
      }}</ElDescriptionsItem>
      <ElDescriptionsItem label="Solve 耗时">{{
        formatDuration(logGroup.duration_ms)
      }}</ElDescriptionsItem>
      <ElDescriptionsItem label="尝试次数">{{ logGroup.attempts ?? '--' }}</ElDescriptionsItem>
      <ElDescriptionsItem label="上游请求">{{
        logGroup.upstream_requests ?? '--'
      }}</ElDescriptionsItem>
      <ElDescriptionsItem label="模式">
        {{ logGroup.direct == null ? '--' : logGroup.direct ? 'Direct' : 'Task' }}
      </ElDescriptionsItem>
      <ElDescriptionsItem label="Token">
        {{ logGroup.token_hint || '--' }}
        <span v-if="logGroup.token_remaining != null" class="muted">
          · 剩余 {{ logGroup.token_remaining }}
        </span>
      </ElDescriptionsItem>
      <ElDescriptionsItem label="日志条数">{{ logGroup.count }}</ElDescriptionsItem>
    </ElDescriptions>

    <template v-if="logGroup.fingerprint.fingerprint_key">
      <ElDivider content-position="left">指纹与代理快照</ElDivider>
      <ElDescriptions :column="1" border size="small">
        <ElDescriptionsItem label="组合 Key">
          <code>{{ logGroup.fingerprint.fingerprint_key }}</code>
        </ElDescriptionsItem>
        <ElDescriptionsItem label="Profile">
          {{ logGroup.fingerprint.profile_variant || '--' }}
          <div class="muted break-all">{{ logGroup.fingerprint.profile_id || '--' }}</div>
        </ElDescriptionsItem>
        <ElDescriptionsItem label="语言 / 时区">
          {{ logGroup.fingerprint.locale || '--' }} · {{ logGroup.fingerprint.timezone || '--' }}
          <div class="match-row">
            <ElTag
              v-if="logGroup.fingerprint.locale_geo_match != null"
              :type="logGroup.fingerprint.locale_geo_match ? 'success' : 'danger'"
              size="small"
              effect="plain"
            >
              语言{{ logGroup.fingerprint.locale_geo_match ? '匹配' : '偏离' }}
            </ElTag>
            <ElTag
              v-if="logGroup.fingerprint.timezone_geo_match != null"
              :type="logGroup.fingerprint.timezone_geo_match ? 'success' : 'danger'"
              size="small"
              effect="plain"
            >
              时区{{ logGroup.fingerprint.timezone_geo_match ? '匹配' : '偏离' }}
            </ElTag>
          </div>
        </ElDescriptionsItem>
        <ElDescriptionsItem label="hCaptcha 版本">
          <span class="break-all">{{ logGroup.fingerprint.hcaptcha_version || '--' }}</span>
        </ElDescriptionsItem>
        <ElDescriptionsItem label="VMData / N">
          {{ logGroup.fingerprint.vmdata_length ?? '--' }} bytes ·
          {{ logGroup.fingerprint.vmdata_slots ?? '--' }} slots · N
          {{ logGroup.fingerprint.n_length ?? '--' }}
        </ElDescriptionsItem>
        <ElDescriptionsItem label="代理端点">
          {{ logGroup.fingerprint.proxy_scheme || '--' }}://{{
            logGroup.fingerprint.proxy_endpoint || '--'
          }}
          <div class="muted">
            {{ logGroup.fingerprint.proxy_session_mode || '--' }} ·
            {{ logGroup.fingerprint.proxy_endpoint_key || '--' }}
          </div>
        </ElDescriptionsItem>
        <ElDescriptionsItem label="出口地区">
          {{ logGroup.fingerprint.proxy_country || '--' }}
          <template v-if="logGroup.fingerprint.proxy_city">
            · {{ logGroup.fingerprint.proxy_city }}
          </template>
          <div class="muted">
            {{ logGroup.fingerprint.proxy_timezone || '--' }} ·
            {{ logGroup.fingerprint.proxy_exit_ip || '--' }}
          </div>
        </ElDescriptionsItem>
        <ElDescriptionsItem label="ASN / ISP">
          {{ logGroup.fingerprint.proxy_asn || '--' }} ·
          {{ logGroup.fingerprint.proxy_isp || '--' }}
        </ElDescriptionsItem>
      </ElDescriptions>
    </template>

    <div v-if="logGroup.error" class="error-block">
      <div class="error-title">失败原因</div>
      <div class="error-message">{{ logGroup.error }}</div>
    </div>
  </ElCard>
</template>

<script setup lang="ts">
  defineOptions({ name: 'LogInfo' })

  defineProps<{ logGroup: Api.Logs.LogGroup }>()

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
  const formatDuration = (ms: number) =>
    ms < 1000 ? `${ms.toFixed(0)} ms` : `${(ms / 1000).toFixed(3)} s`
  const formatDate = (value: string) => new Date(value).toLocaleString('zh-CN', { hour12: false })
</script>

<style scoped lang="scss">
  .info-card {
    height: 100%;
  }

  .panel-title {
    font-size: 14px;
    font-weight: 600;
  }

  .break-all {
    word-break: break-all;
  }

  .muted {
    font-size: 11px;
    color: var(--el-text-color-secondary);
  }

  .match-row {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-top: 5px;
  }

  .error-block {
    padding: 12px;
    margin-top: 14px;
    background: var(--el-color-danger-light-9);
    border-left: 3px solid #dc4c4c;
  }

  .error-title {
    margin-bottom: 6px;
    font-size: 12px;
    font-weight: 600;
    color: var(--el-color-danger);
  }

  .error-message {
    max-height: 180px;
    overflow: auto;
    font-size: 12px;
    line-height: 1.6;
    word-break: break-word;
  }
</style>
