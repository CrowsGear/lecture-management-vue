<script setup lang="ts">
/* Third Party */
import { ref, onMounted } from 'vue'

/* Components */
import SearchForm from '../../../components/admin/SearchForm.vue'
import DataTable from '../../../components/admin/DataTable.vue'

/* Types */
import type { ISchoolSearchParams, ISchool } from '../../../types/school'
import type { ISearchConfig } from '../../../types/common/common';
import type { ITableInfo } from "../../../types/common/common.ts";

/* APIs */
import { fetchSchools } from '../../../api/school';

/* 검색 파라미터 for SearchForm.vue */
const searchParams = ref<ISchoolSearchParams>({
  schoolName: "",
  period: {
    start: "",
    end: ""
  }
})

/* 검색 옵션 for SearchForm.vue */
const searchConfig: ISearchConfig = {
  fields: [
    {
      name: 'schoolName',
      label: '학교명',
      type: 'text',
      placeholder: '학교명을 입력하세요'
    },
    {
      name: 'period',
      label: '등록기간',
      type: 'period'
    }
  ],
  periods: [
    { label: '오늘', value: 'today' },
    { label: '1주일', value: 'week' },
    { label: '1개월', value: 'month' },
    { label: '3개월', value: '3months' },
    { label: '6개월', value: '6months' }
  ]
}

/* 학교 데이터 for DataTable.vue */
const schoolData = ref<ISchool[]>([])

/* 테이블 정보 for DataTable.vue */
const schoolTableInfo = ref<ITableInfo>({
  tableName: "school",
  tableComment: "학교",
  columns: [
    { name: 'id', comment: 'ID' },
    { name: 'schoolName', comment: '학교명' },
    { name: 'createdAt', comment: '등록일자' }
  ]
  });

/* 로딩 상태 */
const loading = ref<boolean>(false)

/* 페이지 정보 */
const totalCount = ref<number>(0)
const currentPage = ref<number>(1)
const perPage = ref<number>(50)
const totalPages = ref<number>(1)

/* 검색 함수 for SearchForm.vue */
const handleSearch = async () => {

  loading.value = true;

  try {
    const result = await fetchSchools(searchParams.value);
    schoolData.value = result.data
    totalCount.value = schoolData.value.length
    totalPages.value = Math.ceil(totalCount.value / perPage.value)
  } catch (error) {
    console.error('Failed to fetch schools:', error)
  } finally {
    loading.value = false
  }
}

/* 업데이트 함수 for DataTable.vue */
const handleUpdate = async (id: number, data: Partial<ISchool>) => {
  // 업데이트 로직 구현
  console.log(id, data);
}

/* 이전 페이지 함수 */
const handlePrevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
    handleSearch()
  }
}

/* 다음 페이지 함수 */
const handleNextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
    handleSearch()
  }
}

/* 컴포넌트 마운트 시 검색 함수 실행 */
onMounted(() => {
  handleSearch()
})
</script>

<template>
  <div class="school-management">
    <h2>학교 관리</h2>
    <SearchForm
        :config="searchConfig"
        v-model:searchParams="searchParams"
        @search="handleSearch"
    />
    <div class="section-divider"></div>
    <div class="data-controls">
      <div class="total-count">
        총 {{ totalCount }}건
      </div>
      <div class="per-page">
        <select v-model="perPage">
          <option value="50">50개씩 보기</option>
          <option value="100">100개씩 보기</option>
        </select>
      </div>
    </div>
    <DataTable
        :data="schoolData"
        :table-info="schoolTableInfo"
        :loading="loading"
        @update="handleUpdate"
    />
    <div class="pagination-controls">
      <button @click="handlePrevPage">이전</button>
      <span>{{ currentPage }} / {{ totalPages }}</span>
      <button @click="handleNextPage">다음</button>
    </div>
  </div>
</template>

<style scoped>
.school-management {
  padding: 20px;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

.section-divider {
  height: 1px;
  background-color: var(--divider-color);
  margin: 2rem 0;
  width: 100%;
}

.data-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 20px 0;
  width: 100%;
}

.data-table {
  width: 100%;
  overflow-x: auto;
}

.pagination-controls {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 20px;
  width: 100%;
}
</style>
