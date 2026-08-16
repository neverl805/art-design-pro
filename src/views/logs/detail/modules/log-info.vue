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
      <ElDescriptionsItem label="节点">
        <ElTag v-if="logGroup.node" size="small" effect="plain" type="info">
          {{ logGroup.node }}
        </ElTag>
        <span v-else>--</span>
      </ElDescriptionsItem>
      <ElDescriptionsItem label="Token">
        <!-- 完整值：api_tokens 没有名称列，token 本身就是唯一能认出调用方的东西，
             脱敏后缀在多个 token 尾部相同时根本区分不出是谁。 -->
        <code class="break-all">{{ logGroup.token_value || logGroup.token_hint || '--' }}</code>
        <span v-if="logGroup.token_remaining != null" class="muted">
          · 剩余 {{ logGroup.token_remaining }}
        </span>
        <!-- 账本里查不到（已删除，或后缀撞车无法唯一确定）时说明原因，
             免得把一个脱敏值误读成完整 token。 -->
        <div v-if="!logGroup.token_value && logGroup.token_hint" class="muted">
          账本中未能唯一匹配，仅显示脱敏值
        </div>
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
            <!-- 配对池模式下语言/时区本就与出口地区不一致（这是服务端刻意为之的策略），
                 因此后端不再下发 *_geo_match，这里改为显示来源，避免每一行都挂红色“偏离”。 -->
            <ElTag
              v-if="logGroup.fingerprint.geo_pair_source"
              :type="logGroup.fingerprint.geo_pair_source === 'pool' ? 'success' : 'info'"
              size="small"
              effect="plain"
            >
              {{ logGroup.fingerprint.geo_pair_source === 'pool' ? '实测配对池' : '出口推导' }}
            </ElTag>
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
          <template v-if="logGroup.fingerprint.proxy_country">
            {{ logGroup.fingerprint.proxy_country }}
            <template v-if="logGroup.fingerprint.proxy_city">
              · {{ logGroup.fingerprint.proxy_city }}
            </template>
          </template>
          <!-- 出口未被识别时后端不下发国家/时区（占位值会被误当成实测结果），这里说明原因。 -->
          <span v-else class="muted">未识别（代理串未含地区标记，且未做网络查询）</span>
          <div class="muted">
            {{ logGroup.fingerprint.proxy_timezone || '--' }} ·
            {{ logGroup.fingerprint.proxy_exit_ip || '--' }} · 来源
            {{ logGroup.fingerprint.proxy_geo_source || '--' }}
          </div>
        </ElDescriptionsItem>
        <ElDescriptionsItem label="ASN / ISP">
          {{ logGroup.fingerprint.proxy_asn || '--' }} ·
          {{ logGroup.fingerprint.proxy_isp || '--' }}
        </ElDescriptionsItem>
      </ElDescriptions>

      <ElDivider content-position="left">浏览器渲染身份</ElDivider>
      <ElDescriptions :column="1" border size="small">
        <ElDescriptionsItem label="Safari / 平台">
          Safari {{ logGroup.fingerprint.safari_version || '--' }} ·
          {{ logGroup.fingerprint.platform || '--' }}
          <template v-if="logGroup.fingerprint.architecture">
            ({{ logGroup.fingerprint.architecture }})
          </template>
          <div class="muted">
            {{
              logGroup.fingerprint.visible == null
                ? '--'
                : logGroup.fingerprint.visible
                  ? '可见模式'
                  : '隐形模式'
            }}
          </div>
        </ElDescriptionsItem>
        <ElDescriptionsItem label="屏幕 / 视口">
          {{ dimension(logGroup.fingerprint.screen_width, logGroup.fingerprint.screen_height) }}
          · 视口
          {{ dimension(logGroup.fingerprint.viewport_width, logGroup.fingerprint.viewport_height) }}
          <div class="muted">
            DPR {{ logGroup.fingerprint.device_scale_factor ?? '--' }} · 色深
            {{ logGroup.fingerprint.color_depth ?? '--' }} · 触点
            {{ logGroup.fingerprint.max_touch_points ?? '--' }}
          </div>
        </ElDescriptionsItem>
        <ElDescriptionsItem label="硬件">
          {{ logGroup.fingerprint.hardware_concurrency ?? '--' }} 核 ·
          <!-- 真实 Safari 不暴露 deviceMemory，缺失是正确的，不能显示成 0。 -->
          {{
            logGroup.fingerprint.device_memory_gb == null
              ? '内存未暴露'
              : logGroup.fingerprint.device_memory_gb + ' GB'
          }}
        </ElDescriptionsItem>
        <ElDescriptionsItem label="设备指纹">
          <div class="muted break-all">
            canvas {{ logGroup.fingerprint.canvas_salt || '--' }} · webgl
            {{ logGroup.fingerprint.webgl_render_salt || '--' }}
            ({{ logGroup.fingerprint.webgl_unmasked_renderer || '--' }})
          </div>
          <div class="muted break-all">
            audio {{ logGroup.fingerprint.audio_offline_render_value || '--' }} · worker stack
            {{ logGroup.fingerprint.worker_stack_fingerprint || '--' }}
          </div>
        </ElDescriptionsItem>
        <ElDescriptionsItem label="轨迹采样">
          刷新 {{ logGroup.fingerprint.display_refresh_hz ?? '--' }} Hz · 指针
          {{ logGroup.fingerprint.pointer_dispatch_hz ?? '--' }} Hz · 量化
          {{ logGroup.fingerprint.timestamp_quantum_ms ?? '--' }} ms
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

  /** `1512 × 982`，任一边缺失就整体判为未知——半个尺寸比没有尺寸更容易被误读。 */
  const dimension = (width: number | null, height: number | null) =>
    width == null || height == null ? '--' : `${width} × ${height}`

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
