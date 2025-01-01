<script setup lang="ts">
/* Third Party */
import { ref, computed, nextTick } from "vue";
import { useRouter } from "vue-router";

/* Components */
import Checkbox from "../common/Checkbox.vue";

/* Types */
import type { ISchool } from "../../types/school";
import type { ITableInfo } from "../../types/common/common.ts";

/* Props */
const props = defineProps<{
  data: any[];
  tableInfo: ITableInfo;
  loading?: boolean;
  totalCount?: number;
  currentPage?: number;
  perPage?: number;
  perPageOptions?: number[];
  detailRoute?: string;
}>();

/* Emits */
const emit = defineEmits<{
  (e: "update", id: number, data: any): void;
  (e: "delete", id: number): void;
  (e: "select", items: string[]): void;
  (e: "update:currentPage", page: number): void;
  (e: "update:perPage", count: number): void;
}>();

/* REFS */
const router = useRouter();
const tableRef = ref<HTMLElement | null>(null);
const scrollPosition = ref(0);
const selectedItems = ref<string[]>([]);

/* Computed */
const allSelected = computed({
  get: () => {
    return props.data.length > 0 && selectedItems.value.length === props.data.length;
  },
  set: (value: boolean) => {
    selectedItems.value = value
        ? props.data.map(item => item.id.toString())
        : [];
  }
});

const totalPages = computed(() => {
  if (!props.totalCount || !props.perPage) return 1;
  return Math.ceil(props.totalCount / props.perPage);
});

/* Data Processing Functions */
/**
 * 데이터 파싱 함수
 * @param field 필드 이름
 * @param item 데이터 객체
 */
const parsedData = (field: string | string[], item: any) => {
  const getValue = (obj: any, keys: string[]): any => {
    if (!obj) return undefined;
    const [currentKey, ...remainingKeys] = keys;
    const currentValue = obj[currentKey];
    if (remainingKeys.length === 0) return currentValue;
    if (Array.isArray(currentValue)) {
      return currentValue.flatMap(item => getValue(item, remainingKeys));
    }
    return getValue(currentValue, remainingKeys);
  };

  const result = typeof field === "string" ? item[field] : getValue(item, field);
  
  if (typeof result === "string" && result.startsWith("http")) {
    const fileName = result.split("/").pop() || result;
    return `<a href="${result}" target="_blank" title="${result}">${fileName}</a>`;
  }

  return Array.isArray(result) ? result.join(", ") : result;
};

/* Scroll Position Handlers */
const saveScrollPosition = () => {
  console.log("saveScrollPosition");
  console.log(tableRef.value);
  if (tableRef.value) {
    const tableTop = tableRef.value.getBoundingClientRect().top;
    scrollPosition.value = window.scrollY + tableTop;
  }
};

const restoreScrollPosition = () => {
  nextTick(() => {
    window.scrollTo({
      top: scrollPosition.value,
      behavior: "instant"
    });
  });
};

/* Event Handlers */
const toggleSelectAll = () => {
  emit("select", selectedItems.value);
};

const handleEdit = (item: ISchool) => {
  emit("update", item.id, item);
};

const handleDelete = (item: ISchool) => {
  if (confirm("정말 삭제하시겠습니까?")) {
    emit("delete", item.id);
  }
};

const handleRowClick = (item: any) => {
  if (props.detailRoute) {
    router.push({
      name: props.detailRoute,
      params: { id: item.id }
    });
  }
};

/* Pagination Handlers */
const handlePageChange = (page: number) => {
  saveScrollPosition();
  emit("update:currentPage", page);
  nextTick(() => {
    restoreScrollPosition();
  });
};

const handlePerPageChange = (count: number) => {
  saveScrollPosition();
  emit("update:perPage", count);
  nextTick(() => {
    restoreScrollPosition();
  });
};
</script>

<template>
  <div class="data-table-wrapper" ref="tableRef">
    <div class="table-controls">
      <div class="total-count">
        총 {{ totalCount || data.length }}건
      </div>
      <div class="per-page-control">
        <select 
          v-if="perPageOptions"
          :value="perPage"
          @change="handlePerPageChange(Number(($event.target as HTMLSelectElement).value))"
        >
          <option 
            v-for="option in perPageOptions" 
            :key="option" 
            :value="option"
          >
            {{ option }}개씩 보기
          </option>
        </select>
      </div>
    </div>

    <table class="data-table">
      <thead>
      <tr>
        <th>
          <Checkbox
              v-model="allSelected"
              @change="toggleSelectAll"
          />
        </th>
        <th v-for="column in tableInfo.columns" :key="column.comment">
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
        <td :colspan="tableInfo.columns.length + 2" class="no-data">
          데이터가 없습니다
        </td>
      </tr>
      <tr 
        v-else 
        v-for="item in data" 
        :key="item.id"
        :class="{ clickable: detailRoute }"
        @click="handleRowClick(item)"
      >
        <td>
          <Checkbox
              v-model="selectedItems"
              :value="item.id.toString()"
          />
        </td>
        <td 
          v-for="column in tableInfo.columns" 
          :key="Array.isArray(column.name) ? column.name.join('.') : column.name"
          v-html="parsedData(column.name, item)"
        >
        </td>
        <td>
          <div class="action-buttons">
            <button
              class="action-button edit"
              @click="handleEdit(item)"
            >
              수정
            </button>
            <button
              class="action-button delete"
              @click="handleDelete(item)"
            >
              삭제
            </button>
          </div>
        </td>
      </tr>
      </tbody>
    </table>

    <div v-if="totalPages > 1" class="pagination">
      <button 
        :disabled="currentPage === 1"
        @click="handlePageChange((currentPage || 1) - 1)"
      >
        이전
      </button>
      <span>{{ currentPage }} / {{ totalPages }}</span>
      <button 
        :disabled="currentPage === totalPages"
        @click="handlePageChange((currentPage || 1) + 1)"
      >
        다음
      </button>
    </div>
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

.action-buttons {
  display: flex;
  gap: 4px;
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

.action-button.edit:hover {
  background: #e3f2fd;
  border-color: #2196f3;
  color: #1976d2;
}

.action-button.delete {
  border-color: #ffcdd2;
}

.action-button.delete:hover {
  background: #ffebee;
  border-color: #ef5350;
  color: #d32f2f;
}

.table-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.total-count {
  color: var(--text-color);
}

.per-page-control select {
  padding: 4px 8px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background-color: var(--bg-color);
  color: var(--text-color);
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 1rem;
}

.pagination button {
  padding: 4px 12px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background-color: var(--bg-color);
  color: var(--text-color);
  cursor: pointer;
}

.pagination button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.clickable {
  cursor: pointer;
}

.clickable:hover {
  background-color: var(--bg-hover);
}

:deep(a) {
  color: var(--link-color, #0066cc);
  text-decoration: none;
}

:deep(a:hover) {
  text-decoration: underline;
}
</style>
