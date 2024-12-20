<script setup lang="ts">
/* Third Party */
import { ref, reactive, onMounted } from 'vue';

/* Components */
import SearchForm from '../../components/admin/SearchForm.vue';
import DataTable from '../../components/admin/DataTable.vue';
import FormModal from '../../components/common/FormModal.vue';

/* Types */
import type { ISearchConfig } from '../../types/common/common';
import type { IFormConfig } from '../../types/common/form';
import type { ILecture, ILectureSearchParams } from '../../types/lecture';
import type { ITeacher } from '../../types/teacher';
import type { ITableInfo } from "../../types/common/common";

/* APIs */
import { fetchLectures, createLecture, updateLecture } from '../../api/lecture';
import { fetchTeachers } from '../../api/teacher';

/* 검색 파라미터 for SearchForm.vue */
const searchParams = ref<ILectureSearchParams>({
  lectureCode: "",
  period: {
    start: "",
    end: ""
  },
  page: 1,
  limit: 50
});

/* 검색 옵션 for SearchForm.vue */
const searchConfig: ISearchConfig = {
  fields: [
    {
      name: 'lectureCode',
      label: '강의 코드',
      type: 'text',
      placeholder: '강의 코드를 입력하세요'
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
    { label: '3개월', value: '3months' }
  ]
};

/* 강의 추가/수정 폼 관련 */
const lectureForm = reactive<Partial<ILecture>>({
  lectureCode: '',
  lectureStartDate: '',
  lectureEndDate: '',
  teacherId: undefined,
  lectureIsShow: 0
});
const isEditing = ref(false);
const editingId = ref<string | null>(null);
const showForm = ref(false);

/**
 * 강의 폼 설정
 * @description FormModal 컴포넌트에서 사용할 폼 필드 설정
 * @see getTeachers
 */
 const lectureFormConfig: IFormConfig = {
  title: '강의 정보',
  fields: [
    { 
      name: 'lectureCode', 
      label: '강의 코드', 
      type: 'text', 
      required: true,
      disabled: false 
    },
    { 
      name: 'lectureStartDate', 
      label: '시작일', 
      type: 'date', 
      required: true 
    },
    { 
      name: 'lectureEndDate', 
      label: '종료일', 
      type: 'date', 
      required: true 
    },
    { 
      name: 'teacherId', 
      label: '강사 ID', 
      type: 'select', 
      required: true,
      options: []
    },
    { 
      name: 'lectureIsShow', 
      label: '노출 여부', 
      type: 'select', 
      required: true,
      options: [
        { label: '노출', value: 1 },
        { label: '비노출', value: 0 }
      ]
    }
  ]
};

/* 테이블 정보 for DataTable.vue */
const lectureTableInfo = ref<ITableInfo>({
    tableName: "lecture",
    tableComment: "강의",
    columns: [
        { name: 'lectureCode', comment: '강의 코드' },
        { name: 'lectureStartDate', comment: '시작일' },
        { name: 'lectureEndDate', comment: '종료일' },
        { name: 'teacherId', comment: '강사 ID' },
        { name: 'lectureIsShow', comment: '노출 여부' },
        { name: 'createdAt', comment: '등록일자' }
    ]
});

/* 강의 데이터 for DataTable.vue */
const lectureData = ref<ILecture[]>([]);
const loading = ref<boolean>(false);
const totalCount = ref<number>(0)
const currentPage = ref<number>(1)
const perPage = ref<number>(50)
const totalPages = ref<number>(1)

/* 검색 처리 */
const handleSearch = async () => {
  try {
    loading.value = true;
    const result = await fetchLectures(searchParams.value);
    lectureData.value = result.data.items;
    totalCount.value = result.data.count;
    totalPages.value = Math.ceil(totalCount.value / perPage.value);
  } catch (error) {
    alert('강의 목록을 불러오는 중 오류가 발생했습니다.');
    console.error('Failed to fetch lectures:', error);
  } finally {
    loading.value = false;
  }
};

/**
 * 폼 제출 처리
 * @param formData - 제출된 폼 데이터
 */
 const handleFormSubmit = async (formData: Record<string, any>) => {
  try {
    if (isEditing.value && editingId.value) {
      const response = await updateLecture(parseInt(editingId.value), formData);
      if (response.code === "SC-04") {
        /* TODO: 응답 코드 협상 */
        alert('강의 정보가 수정되었습니다.');
        showForm.value = false;
        await handleSearch();
      }
    } else {
      const response = await createLecture(formData);
      if (response.code === "SC-04") {
        /* TODO: 응답 코드 협상 */
        alert('강의가 추가되었습니다.');
        showForm.value = false;
        await handleSearch();
      }
    }
  } catch (error) {
    console.error('Failed to submit lecture:', error);
    alert('처리 중 오류가 발생했습니다.');
  }
};

const handlePageChange = (page: number) => {
  currentPage.value = page;
  handleSearch();
};

const handlePerPageChange = (count: number) => {
  perPage.value = count;
  currentPage.value = 1; // 페이지 수 변경시 첫 페이지로
  handleSearch();
};

/* 폼 초기화 */
const resetForm = () => {
  Object.keys(lectureForm).forEach(key => {
    if (key === 'teacherId') {
      (lectureForm as any)[key] = undefined;
    } else if (key === 'lectureIsShow') {
      (lectureForm as any)[key] = 0;
    } else {
      (lectureForm as any)[key] = '';
    }
  });
  isEditing.value = false
  editingId.value = null;
};

/**
 * 강사 목록 조회
 * @memberof onMounted - 컴포넌트 마운트 시 호출
 * @see lectureFormConfig - 강사 목록 조회
 */
const getTeachers = async () => {
  const response = await fetchTeachers();
  lectureFormConfig.fields[3].options = (response.data as ITeacher[])
    .map((teacher: ITeacher) => ({ label: teacher.teacherName, value: teacher.id }));
};

/**
 * 수정 시작
 * @param id - 수정할 강의 ID
 * @param lecture - 수정할 강의 데이터
 */
const startEdit = (id: number, lecture: ILecture) => {
  isEditing.value = true;
  editingId.value = id.toString();
  Object.assign(lectureForm, {
    lectureCode: lecture.lectureCode,
    lectureStartDate: lecture.lectureStartDate,
    lectureEndDate: lecture.lectureEndDate,
    teacherId: lecture.teacherId,
    lectureIsShow: lecture.lectureIsShow
  });
  showForm.value = true;
};

/* 컴포넌트 마운트 시 검색 처리 */
onMounted(() => {
  handleSearch();
  getTeachers();
});
</script>

<template>
  <div class="lecture-management">
    <h2>강의 관리</h2>

    <!-- 검색 영역 -->
    <SearchForm
      :config="searchConfig"
      v-model:searchParams="searchParams"
      @search="handleSearch"
    />

    <!-- 데이터 관리 영역 -->
    <div class="section-divider"></div>
    <div class="data-management-section">
      <div class="section-header">
        <h3>강의 목록</h3>
        <button 
          class="add-btn"
          @click="() => { isEditing = false; showForm = true; resetForm(); }"
        >
          강의 추가
        </button>
      </div>

      <!-- 데이터 테이블 -->
      <DataTable
        :data="lectureData"
        :table-info="lectureTableInfo"
        :loading="loading"
        :total-count="totalCount"
        :current-page="currentPage"
        :per-page="perPage"
        :per-page-options="[50, 100]"
        @update="startEdit"
        @update:current-page="handlePageChange"
        @update:per-page="handlePerPageChange"
      />
    </div>

    <!-- 강의 추가/수정 모달 -->
    <FormModal
      v-model:show="showForm"
      :config="lectureFormConfig"
      :initial-data="lectureForm"
      :is-edit="isEditing"
      @submit="handleFormSubmit"
    />
  </div>
</template>

<style scoped>
.lecture-management {
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

.data-management-section {
  padding: 1rem 0;
  width: 100%;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  width: 100%;
}

.add-btn {
  padding: 8px 16px;
  background-color: var(--button-bg);
  color: var(--button-text);
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.add-btn:hover {
  opacity: 0.9;
}
</style>
