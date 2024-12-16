<script setup lang="ts">
/* Third Party */
import { ref, reactive, onMounted, computed } from 'vue';
import * as XLSX from 'xlsx';

/* Components */
import SearchForm from '../../../components/admin/SearchForm.vue';
import DataTable from '../../../components/admin/DataTable.vue';
import ReadOnlyTable from '../../../components/common/ReadOnlyTable.vue';

/* Types */
import type { ISearchConfig } from '../../../types/common/common';
import type { IStudentUploadData, IStudent, ILecture, IStudentForm, IStudentSearchParams} from '../../../types/student';
import type { ITableInfo } from "../../../types/common/common";

/* APIs */
import { fetchStudents, createStudent, updateStudent } from '../../../api/student';

/* 검색 파라미터 for SearchForm.vue */
const searchParams = ref<IStudentSearchParams>({
  studentName: "",
  schoolName: "",
  period: {
    start: "",
    end: ""
  }
});

/* 검색 옵션 for SearchForm.vue */
const searchConfig: ISearchConfig = {
  fields: [
    {
      name: 'studentName',
      label: '이름',
      type: 'text',
      placeholder: '이름을 입력하세요'
    },
    {
      name: 'schoolName',
      label: '학교',
      type: 'text',
      placeholder: '학교를 입력하세요'
    }
  ]
};

/* 파일 업로드 관련 */
const fileInput = ref<HTMLInputElement | null>(null);
const parsedData = ref<IStudentUploadData>({ lectures: [] });
const isLoading = ref(false);

/* 학생 목록 관련 */
const students = ref<IStudent[]>([]);

/* 학생 추가/수정 폼 관련*/
const studentForm = reactive<IStudentForm>({
  studentName: '',
  studentCode: '',
  studentPhone: '',
  parentName: '',
  parentPhone: '',
  schoolName: ''
});
const isEditing = ref(false);
const editingId = ref<string | null>(null);
const showForm = ref(false);

/* 테이블 정보 for DataTable.vue */
const studentTableInfo = ref<ITableInfo>({
  tableName: "student",
  tableComment: "학생",
  columns: [
    { name: 'studentCode', comment: '학생 코드' },
    { name: 'studentName', comment: '이름' },
    { name: 'schoolName', comment: '학교' },
    { name: 'studentPhone', comment: '연락처' },
    { name: 'createdAt', comment: '등록일자' }
  ]
});

/* 검색 처리 */
const handleSearch = async () => {
  try {
    isLoading.value = true;
    const response = await fetchStudents();
    students.value = response.data;
  } catch (error) {
    console.error('Failed to fetch students:', error);
  } finally {
    isLoading.value = false;
  }
};

/* 파일 업로드 event handler */
const handleFileUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (!target.files?.length) return;

  try {
    isLoading.value = true;
    const file = target.files[0];
    const data = await readExcelFile(file);
    processExcelData(data);
  } catch (error) {
    console.error('파일 처리 중 오류 발생:', error);
    alert('파일 처리 중 오류가 발생했습니다.');
  } finally {
    isLoading.value = false;
    if (fileInput.value) fileInput.value.value = '';
  }
};

const readExcelFile = (file: File): Promise<any[][]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // 수식의 계산된 결과값을 가져오도록 옵션 설정
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
          header: 1,
          raw: false,  // 문자열로 변환
          dateNF: 'yyyy-mm-dd',  // 날짜 형식 지정
          defval: ''  // 빈 셀 처리
        });
        
        resolve(jsonData as any[][]);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsBinaryString(file);
  });
};

/* 엑셀 데이터 처리 */
const processExcelData = (data: any[][]) => {
  // 헤더 행 제거
  const rows = data.slice(1);
  
  const lectureMap = new Map<string, ILecture>();

  rows.forEach((row) => {
    const [
      _no, studentCode, _type, studentName, schoolName,
      studentPhone, parentPhone
    ] = row;

    // 기본 비밀번호 생성 (실제 구현시 보안을 고려해야 함)
    const password = studentPhone.slice(-4);

    const student: IStudent = {
      studentName,
      studentPhone,
      studentCode,
      password,
      parents: [{
        parentName: studentName,
        parentPhone,
        password
      }],
      school: {
        schoolName
      }
    };

    if (!lectureMap.has(studentCode)) {
      lectureMap.set(studentCode, {
        lectureCode: studentCode,
        lectureStartDate: "2024-12-15", // 실제 데이터에 맞게 수정 필요
        lectureEndDate: "2024-12-16",   // 실제 데이터에 맞게 수정 필요
        students: []
      });
    }

    lectureMap.get(studentCode)?.students.push(student);
    console.log(lectureMap.get(studentCode));
  });

  parsedData.value = {
    lectures: Array.from(lectureMap.values())
  };
};

/* 엑셀 업로드 event handler */
const handleUpload = async () => {
  try {
    isLoading.value = true;
    // API 호출 로직 구현 필요
    console.log('업로드할 데이터:', parsedData.value);
    alert('데이터가 성공적으로 업로드되었습니다.');
  } catch (error) {
    console.error('업로드 중 오류 발생:', error);
    alert('데이터 업로드 중 오류가 발생했습니다.');
  } finally {
    isLoading.value = false;
  }
};

/* 폼 초기화 */
const resetForm = () => {
  Object.keys(studentForm).forEach(key => {
    studentForm[key as keyof IStudentForm] = '';
  });
  isEditing.value = false;
  editingId.value = null;
};

/* 학생 추가 */
const handleAddStudent = async () => {
  try {
    const response = await createStudent({
      ...studentForm,
      password: studentForm.studentPhone.slice(-4)
    });

    if (response.success) {
      alert('학생이 추가되었습니다.');
      resetForm();
      showForm.value = false;
      await fetchStudents();
    }
    
  } catch (error) {
    console.error('학생 추가 실패:', error);
    alert('학생 추가에 실패했습니다.');
  }
};

/* 학생 수정 */
const handleEditStudent = async () => {
  if (!editingId.value) return;
  
  try {
    const response = await updateStudent(editingId.value, studentForm);
    if (response.success) {
      alert('학생 정보가 수정되었습니다.');
      resetForm();
      showForm.value = false;
      await fetchStudents();
    }
  } catch (error) {
    console.error('학생 수정 실패:', error);
    alert('학생 정보 수정에 실패했습니다.');
  }
};



/* 학생 수정 시작 */
const startEdit = (id: number, student: IStudent) => {
  isEditing.value = true;
  editingId.value = id.toString();
  Object.assign(studentForm, {
    studentName: student.studentName,
    studentCode: student.studentCode,
    studentPhone: student.studentPhone,
    parentName: student.parents[0].parentName,
    parentPhone: student.parents[0].parentPhone,
    schoolName: student.school.schoolName
  });
  showForm.value = true;
};

/* 컴포넌트 마운트 시 검색 처리 */
onMounted(() => {
  handleSearch();
});

/* 미리보기 테이블 헤더 */
const previewHeaders = [
  { key: 'lectureCode', label: '강의 코드' },
  { key: 'studentName', label: '이름' },
  { key: 'schoolName', label: '학교' },
  { key: 'studentPhone', label: '학생 연락처' },
  { key: 'parentPhone', label: '보호자 연락처' }
];

/* 미리보기 테이블 데이터 변환 */
const previewItems = computed(() => {
  return parsedData.value.lectures.flatMap(lecture => 
    lecture.students.map(student => ({
      lectureCode: lecture.lectureCode,
      studentName: student.studentName,
      schoolName: student.school.schoolName,
      studentPhone: student.studentPhone,
      parentPhone: student.parents[0].parentPhone
    }))
  );
});
</script>

<template>
  <div class="student-management">
    <h2>학생 관리</h2>

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
        <h3>학생 목록</h3>
        <button 
          class="add-btn"
          @click="showForm = true; resetForm()"
        >
          학생 추가
        </button>
      </div>

      <!-- 학생 추가/수정 폼 -->
      <div v-if="showForm" class="student-form">
        <h3>{{ isEditing ? '학생 정보 수정' : '새 학생 추가' }}</h3>
        <form @submit.prevent="isEditing ? handleEditStudent() : handleAddStudent()">
          <div class="form-group">
            <label>이름</label>
            <input v-model="studentForm.studentName" required />
          </div>
          <div class="form-group">
            <label>학생 코드</label>
            <input v-model="studentForm.studentCode" required :disabled="isEditing" />
          </div>
          <div class="form-group">
            <label>학생 연락처</label>
            <input v-model="studentForm.studentPhone" required />
          </div>
          <div class="form-group">
            <label>보호자 이름</label>
            <input v-model="studentForm.parentName" required />
          </div>
          <div class="form-group">
            <label>보호자 연락처</label>
            <input v-model="studentForm.parentPhone" required />
          </div>
          <div class="form-group">
            <label>학교</label>
            <input v-model="studentForm.schoolName" required />
          </div>
          <div class="form-actions">
            <button type="submit">{{ isEditing ? '수정' : '추가' }}</button>
            <button type="button" @click="showForm = false">취소</button>
          </div>
        </form>
      </div>

      <!-- 데이터 테이블 -->
      <DataTable
        :data="students"
        :table-info="studentTableInfo"
        :loading="isLoading"
        @update="startEdit"
      />
    </div>

    <!-- 업로드 영역 -->
    <div class="section-divider"></div>
    <div class="upload-section">
      <div class="section-header">
        <h3>엑셀 업로드</h3>
        <div class="upload-controls">
          <input
            ref="fileInput"
            type="file"
            accept=".xlsx, .xls"
            @change="handleFileUpload"
            :disabled="isLoading"
          />
          <button 
            @click="handleUpload"
            :disabled="isLoading || !parsedData.lectures.length"
            class="upload-btn"
          >
            {{ isLoading ? '처리중...' : '업로드' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 업로드 데이터 미리보기 -->
    <ReadOnlyTable
      v-if="parsedData.lectures.length"
      :headers="previewHeaders"
      :items="previewItems"
      keyField="studentPhone"
    >
      <template #title>업로드 데이터 미리보기</template>
    </ReadOnlyTable>
  </div>
</template>

<style scoped>
.student-management {
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

.upload-section {
  padding: 1rem 0;
  width: 100%;
}

.upload-controls {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.upload-btn {
  padding: 8px 16px;
  background-color: var(--button-bg);
  color: var(--button-text);
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.preview-section {
  margin-top: 20px;
  width: 100%;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background-color: var(--bg-color);
  padding: 20px;
  box-sizing: border-box;
}

.preview-section > div:last-child {
  width: 100%;
  overflow-x: auto;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-color);
}

.preview-header h4 {
  margin: 0;
  font-size: 1.1rem;
  color: var(--text-color);
}

.preview-count {
  color: var(--text-color);
  font-size: 0.9rem;
  background-color: var(--button-bg);
  color: var(--button-text);
  padding: 4px 8px;
  border-radius: 4px;
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

.student-form {
  margin: 20px 0;
  padding: 20px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background-color: var(--bg-color);
  width: 100%;
}

.form-group {
  margin-bottom: 15px;
  display: flex;
  gap: 10px;
  align-items: center;
}

.form-group label {
  width: 120px;
  text-align: right;
}

.form-group input {
  flex: 1;
  padding: 8px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
}

.form-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 20px;
}

.actions {
  display: flex;
  gap: 5px;
}

.actions button {
  padding: 4px 8px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.actions button.delete {
  background-color: #ff4444;
  color: white;
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