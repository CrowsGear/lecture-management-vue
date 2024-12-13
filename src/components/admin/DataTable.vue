<script setup lang="ts">
import { ref, computed } from 'vue'
import Checkbox from '../common/Checkbox.vue'
import type { ISchool } from '../../types/school'
import type { ITableInfo } from "../../types/tableInfo.ts";

const props = defineProps<{
  data: ISchool[];
  tableInfo: ITableInfo;
  loading?: boolean;
}>()

const emit = defineEmits<{
  (e: 'update', id: number, data: Partial<ISchool>): void;
  (e: 'select', items: string[]): void;
}>()

const selectedItems = ref<string[]>([])

const allSelected = computed({
  get: () => {
    return props.data.length > 0 && selectedItems.value.length === props.data.length
  },
  set: (value: boolean) => {
    selectedItems.value = value
        ? props.data.map(item => item.id.toString())
        : []
  }
})

const toggleSelectAll = () => {
  emit('select', selectedItems.value)
}

const handleEdit = (item: ISchool) => {
  emit('update', item.id, item)
}

</script>

<template>
  <div class="data-table-wrapper">
    <table class="data-table">
      <thead>
      <tr>
        <th>
          <Checkbox
              v-model="allSelected"
              @change="toggleSelectAll"
          />
        </th>
        <th v-for="column in tableInfo.columns" :key="column.name">
          {{ column.comment }}
        </th>
        <th></th>
      </tr>
      </thead>
      <tbody>
      <tr v-if="loading">
        <td colspan="7" class="loading">
          데이터를 불러오는 중...
        </td>
      </tr>
      <tr v-else-if="data.length === 0">
        <td colspan="7" class="no-data">
          데이터가 없습니다
        </td>
      </tr>
      <tr v-else v-for="item in data" :key="item.id">
        <td>
          <Checkbox
              v-model="selectedItems"
              :value="item.id.toString()"
          />
        </td>
        <td v-for="field in tableInfo.columns" :key="field.name">
          {{ item[field.name] }}
        </td>
        <td>
          <button
              class="action-button"
              @click="handleEdit(item)"
          >
            수정
          </button>
        </td>
      </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.data-table-wrapper {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  border: 1px solid #ddd;
}

.data-table th,
.data-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

.data-table th {
  background: #f5f5f5;
  font-weight: bold;
}

.loading,
.no-data {
  text-align: center;
  padding: 20px;
}

.product-image {
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 4px;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
}

.status-badge.active {
  background: #e8f5e9;
  color: #2e7d32;
}

.status-badge.inactive {
  background: #ffebee;
  color: #c62828;
}

.action-button {
  padding: 4px 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  cursor: pointer;
}

.action-button:hover {
  background: #f5f5f5;
}
</style>
