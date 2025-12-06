<!-- 日志统计卡片 -->
<template>
  <ElRow :gutter="20">
    <ElCol :xs="24" :sm="12" :md="6">
      <div class="stats-card-wrapper" @click="goToList()">
        <ArtStatsCard
          title="总日志数"
          :value="stats?.total || 0"
          icon="ri:file-list-3-line"
          color="#5470c6"
          :loading="loading"
          class="stats-card clickable"
        >
          <template #extra>
            <div class="card-extra">
              <div v-if="stats && stats.request_count" class="text-xs text-gray-500">
                <Icon icon="ri:list-check" class="mr-1" />
                {{ stats.request_count }} 个请求
              </div>
              <ElTag size="small" effect="plain" class="mt-1">
                <Icon icon="ri:eye-line" class="mr-1" />
                点击查看
              </ElTag>
            </div>
          </template>
        </ArtStatsCard>
      </div>
    </ElCol>
    <ElCol :xs="24" :sm="12" :md="6">
      <div class="stats-card-wrapper" @click="goToList('ERROR')">
        <ArtStatsCard
          title="错误日志"
          :value="stats?.error_count || 0"
          icon="ri:error-warning-line"
          color="#ee6666"
          :loading="loading"
          class="stats-card clickable"
        >
          <template #extra>
            <div class="card-extra">
              <ElTag v-if="stats && stats.error_count > 0" type="danger" size="small" effect="dark">
                需关注
              </ElTag>
              <div v-if="stats && stats.total > 0" class="text-xs text-gray-500 mt-1">
                占比: {{ getPercentage(stats.error_count, stats.total) }}%
              </div>
            </div>
          </template>
        </ArtStatsCard>
      </div>
    </ElCol>
    <ElCol :xs="24" :sm="12" :md="6">
      <div class="stats-card-wrapper" @click="goToList('WARNING')">
        <ArtStatsCard
          title="警告日志"
          :value="stats?.warning_count || 0"
          icon="ri:alert-line"
          color="#fac858"
          :loading="loading"
          class="stats-card clickable"
        >
          <template #extra>
            <div class="card-extra">
              <ElTag v-if="stats && stats.warning_count > 0" type="warning" size="small" effect="dark">
                注意
              </ElTag>
              <div v-if="stats && stats.total > 0" class="text-xs text-gray-500 mt-1">
                占比: {{ getPercentage(stats.warning_count, stats.total) }}%
              </div>
            </div>
          </template>
        </ArtStatsCard>
      </div>
    </ElCol>
    <ElCol :xs="24" :sm="12" :md="6">
      <div class="stats-card-wrapper" @click="goToList('INFO')">
        <ArtStatsCard
          title="信息日志"
          :value="stats?.info_count || 0"
          icon="ri:information-line"
          color="#91cc75"
          :loading="loading"
          class="stats-card clickable"
        >
          <template #extra>
            <div class="card-extra">
              <div v-if="stats && stats.ip_count" class="text-xs text-gray-500">
                <Icon icon="ri:global-line" class="mr-1" />
                {{ stats.ip_count }} 个IP
              </div>
              <div v-if="stats && stats.total > 0" class="text-xs text-gray-500 mt-1">
                占比: {{ getPercentage(stats.info_count, stats.total) }}%
              </div>
            </div>
          </template>
        </ArtStatsCard>
      </div>
    </ElCol>
  </ElRow>

  <!-- 额外统计信息卡片 -->
  <ElRow :gutter="20" class="mt-5" v-if="stats">
    <ElCol :xs="24" :sm="12" :md="8">
      <ElCard shadow="never" class="stat-info-card">
        <div class="flex items-center justify-between">
          <div>
            <div class="text-sm text-gray-500 mb-1">SUCCESS日志</div>
            <div class="text-2xl font-bold text-gray-700">{{ stats.success_count || 0 }}</div>
          </div>
          <div class="stat-icon success">
            <Icon icon="ri:checkbox-circle-line" :size="28" />
          </div>
        </div>
        <div class="mt-2 text-xs text-gray-500">
          占比: {{ stats.total > 0 ? getPercentage(stats.success_count, stats.total) : 0 }}%
        </div>
      </ElCard>
    </ElCol>
    <ElCol :xs="24" :sm="12" :md="8">
      <ElCard shadow="never" class="stat-info-card">
        <div class="flex items-center justify-between">
          <div>
            <div class="text-sm text-gray-500 mb-1">请求总数</div>
            <div class="text-2xl font-bold text-gray-700">{{ stats.request_count || 0 }}</div>
          </div>
          <div class="stat-icon request">
            <Icon icon="ri:send-plane-line" :size="28" />
          </div>
        </div>
        <div class="mt-2 text-xs text-gray-500">
          平均每个请求: {{ stats.request_count > 0 ? (stats.total / stats.request_count).toFixed(1) : 0 }} 条日志
        </div>
      </ElCard>
    </ElCol>
    <ElCol :xs="24" :sm="12" :md="8">
      <ElCard shadow="never" class="stat-info-card">
        <div class="flex items-center justify-between">
          <div>
            <div class="text-sm text-gray-500 mb-1">访问IP数</div>
            <div class="text-2xl font-bold text-gray-700">{{ stats.ip_count || 0 }}</div>
          </div>
          <div class="stat-icon ip">
            <Icon icon="ri:global-line" :size="28" />
          </div>
        </div>
        <div class="mt-2 text-xs text-gray-500">
          平均每IP: {{ stats.ip_count > 0 ? (stats.request_count / stats.ip_count).toFixed(1) : 0 }} 个请求
        </div>
      </ElCard>
    </ElCol>
  </ElRow>
</template>

<script setup lang="ts">
  import { useRouter } from 'vue-router'
  import Icon from '@/components/core/base/art-svg-icon/index.vue'

  defineOptions({ name: 'StatsCards' })

  interface Props {
    stats: Api.Logs.OverviewStats | null
    loading?: boolean
  }

  defineProps<Props>()

  const router = useRouter()

  // 计算百分比
  const getPercentage = (count: number, total: number): string => {
    if (total === 0) return '0'
    return ((count / total) * 100).toFixed(1)
  }

  // 跳转到日志列表页，并带上筛选条件
  const goToList = (level?: string) => {
    if (level) {
      router.push({
        path: '/logs/list',
        query: { level }
      })
    } else {
      router.push('/logs/list')
    }
  }
</script>

<style scoped lang="scss">
  .stats-card-wrapper {
    .stats-card {
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

      &.clickable {
        cursor: pointer;
      }

      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
      }
    }

    .card-extra {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 4px;
    }
  }

  .stat-info-card {
    transition: all 0.3s;
    border: 1px solid var(--el-border-color-light);

    &:hover {
      border-color: var(--el-color-primary);
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
    }

    .stat-icon {
      width: 56px;
      height: 56px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, var(--color-light) 0%, var(--color-lighter) 100%);

      &.success {
        --color-light: #67c23a;
        --color-lighter: #c8e6c9;
        color: #67c23a;
      }

      &.request {
        --color-light: #91cc75;
        --color-lighter: #c8e6c9;
        color: #91cc75;
      }

      &.ip {
        --color-light: #5470c6;
        --color-lighter: #a5b8e6;
        color: #5470c6;
      }
    }
  }
</style>
