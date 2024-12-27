<script setup lang="ts">
import { computed } from "vue";
import type { ITableHeader } from "../../types/common/common";

const props = defineProps<{
  /* 테이블 헤더 정보 */
  headers: ITableHeader[];
  
  /* 테이블 데이터 */
  items: any[];
  
  /* 전체 데이터 수 */
  totalCount?: number;
  
  /* 각 행의 고유 키로 사용할 필드명 (기본값: 'id') */
  keyField?: string;
}>();

/* 각 행의 고유 키 값을 가져오는 함수 */
const getRowKey = (item: any) => {
  return props.keyField ? item[props.keyField] : item.id;
};

/* 전체 데이터 수 표시 텍스트 */
const totalCountText = computed(() => {
  if (typeof props.totalCount === "number") {
    return `총 ${props.totalCount}건`;
  }
  return `총 ${props.items.length}건`;
});
</script>

<template>
  <div class="readonly-table-wrapper">
    <div class="table-header">
      <h4 v-if="$slots.title">
        <slot name="title"></slot>
      </h4>
      <span class="total-count">{{ totalCountText }}</span>
    </div>
    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th 
              v-for="header in headers" 
              :key="header.key"
              :style="header.width ? { width: header.width } : {}"
            >
              {{ header.label }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="items.length === 0">
            <td :colspan="headers.length" class="no-data">
              데이터가 없습니다
            </td>
          </tr>
          <tr v-else v-for="item in items" :key="getRowKey(item)">
            <td 
              v-for="header in headers" 
              :key="header.key"
            >
              {{ item[header.key] }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.readonly-table-wrapper {
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background-color: var(--bg-color);
  padding: 20px;
  box-sizing: border-box;
  width: 100%;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-color);
}

.table-header h4 {
  margin: 0;
  font-size: 1.1rem;
  color: var(--text-color);
}

.total-count {
  font-size: 0.9rem;
  background-color: var(--button-bg);
  color: var(--button-text);
  padding: 4px 8px;
  border-radius: 4px;
}

.table-container {
  width: 100%;
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  min-width: 800px;
  margin-bottom: 0;
}

th, td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid var(--border-color);
}

th {
  background-color: var(--table-header-bg);
  font-weight: bold;
  white-space: nowrap;
}

tr:hover {
  background-color: var(--table-stripe-bg);
}

tbody tr:last-child td {
  border-bottom: none;
}

.no-data {
  text-align: center;
  padding: 2rem;
  color: var(--text-color);
}
</style> 