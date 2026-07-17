<template>
  <ElCard shadow="never" class="search-panel">
    <ElForm :model="searchForm" label-position="top">
      <ElRow :gutter="14">
        <ElCol :xs="24" :sm="12" :lg="6">
          <ElFormItem label="Request ID">
            <ElInput v-model="searchForm.request_id" placeholder="Request ID" clearable />
          </ElFormItem>
        </ElCol>
        <ElCol :xs="24" :sm="12" :lg="4">
          <ElFormItem label="结果">
            <ElSelect v-model="searchForm.outcome" placeholder="全部结果" clearable>
              <ElOption label="成功" value="success" />
              <ElOption label="失败" value="failure" />
              <ElOption label="拒绝" value="rejected" />
              <ElOption label="进行中" value="in_progress" />
            </ElSelect>
          </ElFormItem>
        </ElCol>
        <ElCol :xs="24" :sm="12" :lg="6">
          <ElFormItem label="目标 Host">
            <ElInput v-model="searchForm.target_host" placeholder="example.com" clearable />
          </ElFormItem>
        </ElCol>
        <ElCol :xs="24" :sm="12" :lg="4">
          <ElFormItem label="日志级别">
            <ElSelect v-model="searchForm.level" placeholder="全部级别" clearable>
              <ElOption v-for="level in levels" :key="level" :label="level" :value="level" />
            </ElSelect>
          </ElFormItem>
        </ElCol>
        <ElCol :xs="24" :sm="12" :lg="4">
          <ElFormItem label="客户端 IP">
            <ElInput v-model="searchForm.ip" placeholder="127.0.0.1" clearable />
          </ElFormItem>
        </ElCol>
        <ElCol :xs="24" :lg="10">
          <ElFormItem label="时间范围">
            <ElDatePicker
              v-model="timeRange"
              type="datetimerange"
              range-separator="至"
              start-placeholder="开始时间"
              end-placeholder="结束时间"
              value-format="YYYY-MM-DDTHH:mm:ss"
              class="date-range"
            />
          </ElFormItem>
        </ElCol>
        <ElCol :xs="24" :sm="16" :lg="8">
          <ElFormItem label="关键词">
            <ElInput v-model="searchForm.keyword" placeholder="错误、事件或消息" clearable />
          </ElFormItem>
        </ElCol>
        <ElCol :xs="24" :sm="8" :lg="6" class="action-column">
          <ElButton type="primary" @click="handleSearch">
            <Icon icon="ri:search-line" class="mr-1" />
            查询
          </ElButton>
          <ElButton @click="handleReset">
            <Icon icon="ri:restart-line" class="mr-1" />
            重置
          </ElButton>
        </ElCol>
      </ElRow>
    </ElForm>
  </ElCard>
</template>

<script setup lang="ts">
  import Icon from '@/components/core/base/art-svg-icon/index.vue'

  defineOptions({ name: 'LogSearch' })

  const emit = defineEmits<{
    search: [params: Api.Logs.SearchParams]
    reset: []
  }>()

  const levels: Api.Logs.LogLevel[] = ['DEBUG', 'INFO', 'SUCCESS', 'WARNING', 'ERROR', 'CRITICAL']
  const searchForm = ref<Api.Logs.SearchParams>({})
  const timeRange = ref<[string, string] | null>(null)

  const handleSearch = () => {
    const params = { ...searchForm.value }
    if (timeRange.value) {
      params.start_time = timeRange.value[0]
      params.end_time = timeRange.value[1]
    }
    emit('search', params)
  }

  const handleReset = () => {
    searchForm.value = {}
    timeRange.value = null
    emit('reset')
  }

  defineExpose({ searchForm, timeRange })
</script>

<style scoped lang="scss">
  .search-panel {
    margin-bottom: 16px;
  }

  .date-range {
    width: 100%;
  }

  .action-column {
    display: flex;
    align-items: flex-end;
    padding-bottom: 18px;
  }

  :deep(.el-form-item) {
    margin-bottom: 12px;
  }
</style>
