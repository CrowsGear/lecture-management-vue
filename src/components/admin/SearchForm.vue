<script setup lang="ts">
import { ref } from 'vue'
import DatePicker from '../common/DatePicker.vue'
import type { ISchoolSearchParams } from '../../types/school'

const props = defineProps<{
  searchParams: ISchoolSearchParams
}>()

const emit = defineEmits<{
  (e: 'update:searchParams', value: ISchoolSearchParams): void
  (e: 'search'): void
}>()

const localParams = ref({ ...props.searchParams })

const periods = [
  { label: '오늘', value: 'today' },
  { label: '1주일', value: 'week' },
  { label: '1개월', value: 'month' },
  { label: '3개월', value: '3months' },
  { label: '6개월', value: '6months' },
]

const selectedPeriod = ref('')

const setPeriod = (period: string) => {
  selectedPeriod.value = period
  // 기간 설정 로직
}

const resetForm = () => {
  localParams.value = {
    schoolName: '',
    period: {
      start: '',
      end: ''
    }
  }
}

const emitSearch = () => {
  emit('update:searchParams', localParams.value)
  emit('search')
}

</script>

<template>
  <div class="search-form">
    <div class="search-row">
      <label>학교명검색</label>
      <input
          type="text"
          v-model="localParams.schoolName"
          placeholder="내용을 입력해주세요"
      >
    </div>
    <div class="search-row">
      <label>등록기간</label>
      <div class="period-selector">
        <button
            v-for="period in periods"
            :key="period.value"
            @click="setPeriod(period.value)"
            :class="{ active: selectedPeriod === period.value }"
        >
          {{ period.label }}
        </button>
        <DatePicker v-model="localParams.period.start" />
        <span>~</span>
        <DatePicker v-model="localParams.period.end" />
      </div>
    </div>
    <div class="form-controls">
      <button @click="resetForm">검색조건초기화</button>
      <button @click="emitSearch" class="primary">검색</button>
    </div>
  </div>
</template>

<style scoped>
.search-form {
  background: #f5f5f5;
  padding: 20px;
  border-radius: 4px;
}

.search-row {
  display: flex;
  margin-bottom: 15px;
  align-items: center;
}

.search-row label {
  width: 120px;
  font-weight: bold;
}

.checkbox-group {
  display: flex;
  gap: 15px;
}

.period-selector {
  display: flex;
  gap: 10px;
  align-items: center;
}

.form-controls {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 20px;
}

.primary {
  background: #1a73e8;
  color: white;
  padding: 8px 16px;
  border-radius: 4px;
}
</style>
