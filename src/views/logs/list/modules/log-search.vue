<!-- 日志搜索组件 -->
<template>
  <ElCard shadow="never" class="mb-5">
    <ElForm :model="searchForm" label-width="80px">
      <ElRow :gutter="20">
        <ElCol :xs="24" :sm="12" :md="8" :lg="6">
          <ElFormItem label="请求ID">
            <ElInput
              v-model="searchForm.request_id"
              placeholder="请输入请求ID"
              clearable
            />
          </ElFormItem>
        </ElCol>
        <ElCol :xs="24" :sm="12" :md="8" :lg="6">
          <ElFormItem label="日志级别">
            <ElSelect
              v-model="searchForm.level"
              placeholder="请选择日志级别"
              clearable
            >
              <ElOption label="DEBUG" value="DEBUG" />
              <ElOption label="INFO" value="INFO" />
              <ElOption label="WARNING" value="WARNING" />
              <ElOption label="ERROR" value="ERROR" />
              <ElOption label="CRITICAL" value="CRITICAL" />
            </ElSelect>
          </ElFormItem>
        </ElCol>
        <ElCol :xs="24" :sm="12" :md="8" :lg="6">
          <ElFormItem label="IP地址">
            <ElInput
              v-model="searchForm.ip"
              placeholder="请输入IP地址"
              clearable
            />
          </ElFormItem>
        </ElCol>
        <ElCol :xs="24" :sm="12" :md="8" :lg="6">
          <ElFormItem label="模块名">
            <ElInput
              v-model="searchForm.module"
              placeholder="请输入模块名"
              clearable
            />
          </ElFormItem>
        </ElCol>
        <ElCol :xs="24" :sm="24" :md="16" :lg="12">
          <ElFormItem label="时间范围">
            <ElDatePicker
              v-model="timeRange"
              type="datetimerange"
              range-separator="至"
              start-placeholder="开始时间"
              end-placeholder="结束时间"
              value-format="YYYY-MM-DD HH:mm:ss"
              style="width: 100%"
            />
          </ElFormItem>
        </ElCol>
        <ElCol :xs="24" :sm="12" :md="8" :lg="6">
          <ElFormItem label="关键词">
            <ElInput
              v-model="searchForm.keyword"
              placeholder="请输入关键词"
              clearable
            />
          </ElFormItem>
        </ElCol>
        <ElCol :xs="24" :sm="24" :md="24" :lg="6">
          <ElFormItem label-width="0">
            <ElSpace wrap>
              <ElButton type="primary" @click="handleSearch" v-ripple>
                <Icon icon="ri:search-line" class="mr-1" />
                搜索
              </ElButton>
              <ElButton @click="handleReset" v-ripple>
                <Icon icon="ri:refresh-line" class="mr-1" />
                重置
              </ElButton>
            </ElSpace>
          </ElFormItem>
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

  const searchForm = ref<Api.Logs.SearchParams>({
    request_id: undefined,
    level: undefined,
    ip: undefined,
    module: undefined,
    keyword: undefined
  })

  const timeRange = ref<[string, string] | null>(null)

  const handleSearch = () => {
    const params: Api.Logs.SearchParams = {
      ...searchForm.value
    }

    if (timeRange.value) {
      params.start_time = timeRange.value[0]
      params.end_time = timeRange.value[1]
    }

    emit('search', params)
  }

  const handleReset = () => {
    searchForm.value = {
      request_id: undefined,
      level: undefined,
      ip: undefined,
      module: undefined,
      keyword: undefined
    }
    timeRange.value = null
    emit('reset')
  }

  defineExpose({
    searchForm,
    timeRange
  })
</script>
