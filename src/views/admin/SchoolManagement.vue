<script setup lang="ts">
/* Third Party */
import { ref, onMounted } from 'vue'

/* Components */
import SearchForm from '../../components/admin/SearchForm.vue'
import DataTable from '../../components/admin/DataTable.vue'

/* Types */
import type { ISchoolSearchParams, ISchool } from '../../types/school.ts'
import type { ISearchConfig } from '../../types/common/common.ts';
import type { ITableInfo } from "../../types/common/common.ts";

/* APIs */
import { fetchSchools, deleteSchool } from '../../api/school.ts';

/* 검색 파라미터 for SearchForm.vue */
const searchParams = ref<ISchoolSearchParams>({
  schoolName: "",
  period: {
    start: "",
    end: ""
  },
  page: 1,
  limit: 50
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

/* 학교 데이터 for DataTable.vue */
const schoolData = ref<ISchool[]>([]);
const loading = ref<boolean>(false);
const totalCount = ref<number>(0);
const currentPage = ref<number>(1);
const perPage = ref<number>(50);
const totalPages = ref<number>(1);


/* 검색 함수 for SearchForm.vue */
const handleSearch = async () => {

  loading.value = true;

  try {
    const result = await fetchSchools(searchParams.value);
    schoolData.value = result.data.items;
    totalCount.value = result.data.count;
    totalPages.value = Math.ceil(totalCount.value / perPage.value);
  } catch (error) {
    console.error('Failed to fetch schools:', error)
  } finally {
    loading.value = false;
  }
}

/* 업데이트 함수 for DataTable.vue */
const handleUpdate = async (id: number, data: Partial<ISchool>) => {
  // 업데이트 로직 구현
  console.log(id, data);
}

/* 삭제 함수 for DataTable.vue */
const handleDelete = async (id: number) => {
  try {
    loading.value = true;
    const response = await deleteSchool(id);
    if (response.code === "SC-04") {
      alert('삭제되었습니다.');
      await handleSearch();
    }
  } catch (error) {
    console.error('Failed to delete school:', error);
    alert('삭제 중 오류가 발생했습니다.');
  } finally {
    loading.value = false;
  }
};

/* 페이지 변경 핸들러 */
const handlePageChange = (page: number) => {
  currentPage.value = page;
  handleSearch();
};

/* 페이지당 항목 수 변경 핸들러 */
const handlePerPageChange = (count: number) => {
  perPage.value = count;
  currentPage.value = 1; // 페이지 수 변경시 첫 페이지로
  handleSearch();
};

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
    <DataTable
        :data="schoolData"
        :table-info="schoolTableInfo"
        :loading="loading"
        :total-count="totalCount"
        :current-page="currentPage"
        :per-page="perPage"
        :per-page-options="[50, 100]"
        @update="handleUpdate"
        @delete="handleDelete"
        @update:current-page="handlePageChange"
        @update:per-page="handlePerPageChange"
    />
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
</style>
