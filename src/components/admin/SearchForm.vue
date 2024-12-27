<script setup lang="ts">
import { ref, watch } from "vue";
import DatePicker from "../common/DatePicker.vue";
import type { ISearchConfig, ISearchParams } from "../../types/common/common";

/* 컴포넌트 속성 */
const props = defineProps<{
  /* 검색 옵션 */ 
  config: ISearchConfig;

  /* 검색 파라미터 */
  searchParams: ISearchParams;
}>();

/* 컴포넌트 이벤트 */
const emit = defineEmits<{
  /* 검색 파라미터 업데이트 */
  (e: "update:searchParams", value: ISearchParams): void;

  /* 검색 함수 */
  (e: "search"): void;
}>();


/* 검색 파라미터 */
const localParams = ref({ ...props.searchParams });

/* 선택된 기간 */
const selectedPeriod = ref("");

/* 검색 파라미터 업데이트 */
watch(() => props.searchParams, (newVal) => {
  localParams.value = { ...newVal };
}, { deep: true });

/* 기간 설정 */
const setPeriod = (period: string) => {
  selectedPeriod.value = period;
  // 기간 설정 로직 구현
  // TODO: 선택된 기간에 따라 start, end 날짜 계산
};

/* 검색 조건 초기화 */
const resetForm = () => {
  localParams.value = Object.keys(localParams.value).reduce((acc, key) => {
    if (typeof localParams.value[key] === "object" && localParams.value[key] !== null) {
      acc[key] = { ...localParams.value[key] };
      Object.keys(acc[key]).forEach(subKey => {
        acc[key][subKey] = "";
      });
    } else {
      acc[key] = "";
    }
    return acc;
  }, {} as ISearchParams);
};

/* 검색 함수 */
const emitSearch = () => {
  emit("update:searchParams", localParams.value);
  emit("search");
};

/**
 * Enter 키 입력 핸들러
 * @param event - 키보드 이벤트
 */
const handleKeyPress = (event: KeyboardEvent) => {
  if (event.key === "Enter") {
    emit("search");
  }
};
</script>

<template>
  <div class="search-form">
    <div 
      v-for="field in config.fields" 
      :key="field.name"
      class="search-row"
    >
      <label>{{ field.label }}</label>
      
      <!-- 텍스트 입력 -->
      <input
        v-if="field.type === 'text'"
        v-model="localParams[field.name]"
        :placeholder="field.placeholder"
        @keypress="handleKeyPress"
      >
      
      <!-- 날짜 선택 -->
      <DatePicker
        v-else-if="field.type === 'date'"
        v-model="localParams[field.name]"
      />
      
      <!-- Select 박스 -->
      <select
        v-else-if="field.type === 'select'"
        v-model="localParams[field.name]"
      >
        <option value="">전체</option>
        <option
          v-for="option in field.options"
          :key="option.value"
          :value="option.value"
        >
          {{ option.label }}
        </option>
      </select>
      
      <!-- 기간 선택 -->
      <div v-else-if="field.type === 'period'" class="period-selector">
        <button
          v-for="period in config.periods"
          :key="period.value"
          @click="setPeriod(period.value)"
          :class="{ active: selectedPeriod === period.value }"
        >
          {{ period.label }}
        </button>
        <DatePicker v-model="localParams.startDate" />
        <span>~</span>
        <DatePicker v-model="localParams.endDate" />
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
  background: var(--bg-color);
  padding: 20px;
  border-radius: 4px;
  border: 1px solid var(--border-color);
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

.search-row input,
.search-row select {
  flex: 1;
  padding: 8px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background-color: var(--bg-color);
  color: var(--text-color);
}

.period-selector {
  display: flex;
  gap: 10px;
  align-items: center;
  flex: 1;
}

.period-selector button {
  padding: 6px 12px;
  border: 1px solid var(--border-color);
  background: var(--bg-color);
  color: var(--text-color);
  border-radius: 4px;
  cursor: pointer;
}

.period-selector button.active {
  background: var(--button-bg);
  color: var(--button-text);
  border-color: var(--button-bg);
}

.form-controls {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 20px;
}

.form-controls button {
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  border: 1px solid var(--border-color);
  background: var(--bg-color);
  color: var(--text-color);
}

.form-controls button.primary {
  background: var(--button-bg);
  color: var(--button-text);
  border-color: var(--button-bg);
}
</style>
