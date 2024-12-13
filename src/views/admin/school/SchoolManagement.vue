<script setup lang="ts">
import { ref, onMounted } from 'vue'
import SearchForm from '../../../components/admin/SearchForm.vue'
import DataTable from '../../../components/admin/DataTable.vue'
import type { ISchoolSearchParams, ISchool } from '../../../types/school'
import type { ITableInfo } from "../../../types/tableInfo.ts";
import { fetchSchools } from '../../../api/school'

const searchParams = ref<ISchoolSearchParams>({
  schoolName: "",
  period: {
    start: "",
    end: ""
  }
})

const schoolData = ref<ISchool[]>([])
const schoolTableInfo = ref<ITableInfo>({
  tableName: "school",
  tableComment: "학교",
  columns: [
    { name: 'id', comment: 'ID' },
    { name: 'schoolName', comment: '학교명' },
    { name: 'createdAt', comment: '등록일자' }
  ]
})
const loading = ref<boolean>(false)
const totalCount = ref<number>(0)
const currentPage = ref<number>(1)
const perPage = ref<number>(50)
const totalPages = ref<number>(1)

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

const handleUpdate = async (id: number, data: Partial<ISchool>) => {
  // 업데이트 로직 구현
  console.log(id, data);
}

const handlePrevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
    handleSearch()
  }
}

const handleNextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
    handleSearch()
  }
}

onMounted(() => {
  handleSearch()
})
</script>

<template>
  <div class="school-management">
    <SearchForm
        v-model:searchParams="searchParams"
        @search="handleSearch"
    />
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
}

.data-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 20px 0;
}

.pagination-controls {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 20px;
}
</style>
