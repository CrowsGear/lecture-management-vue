<script setup lang="ts">
/* Third Party */
import { ref, reactive, onMounted, computed } from "vue";
import * as XLSX from "xlsx";

/* Components */
import SearchForm from "../../components/admin/SearchForm.vue";
import DataTable from "../../components/admin/DataTable.vue";
import ReadOnlyTable from "../../components/common/ReadOnlyTable.vue";
import FormModal from "../../components/common/FormModal.vue";

/* Types */
import type { ISearchConfig } from "../../types/common/common";
import type { IFormConfig } from "../../types/common/form";
import type { IExcelUploadData, IStudent, IStudentExcelData, ILectureExcelData, IStudentForm, IStudentSubmitData, IStudentSearchParams} from "../../types/student";
import type { ITeacherExcelData } from "../../types/teacher";
import type { ITableInfo } from "../../types/common/common";

/* APIs */
import { fetchStudents, createStudent, updateStudent, uploadStudents } from "../../api/student";

/* constants */
const PHONE_REGEX_1 = /^\d{3}-\d{3,4}-\d{4}$/;
const PHONE_REGEX_2 = /^\d{11}$/;
const STUDENT_SHEET_NAME = "report_info";

const isEditing = ref(false);

/* 검색 파라미터 for SearchForm.vue */
const searchParams = ref<IStudentSearchParams>({
  studentName: "",
  studentPhone: "",
  schoolName: "",
  startDate: undefined,
  endDate: undefined,
  page: 1,
  limit: 50
});

/* 검색 옵션 for SearchForm.vue */
const searchConfig: ISearchConfig = {
  fields: [
    {
      name: "studentName",
      label: "이름",
      type: "text",
      placeholder: "이름을 입력하세요"
    },
    {
      name: "studentPhone",
      label: "학생 연락처",
      type: "text",
      placeholder: "학생 연락처를 입력하세요"
    },
    {
      name: "schoolName",
      label: "학교",
      type: "text",
      placeholder: "학교를 입력하세요"
    },
    {
      name: "lectureCode",
      label: "강의 코드",
      type: "text",
      placeholder: "강의 코드를 입력하세요"
    }
  ]
};


/* 폼 설정 for FormModal.vue */
const formConfig: IFormConfig = {
  title: isEditing.value ? "학생 수정" : "학생 추가",
  fields: [
    { name: "studentName", label: "이름", type: "text", required: true },
    { name: "studentCode", label: "학생 코드", type: "text", required: true },
    { name: "studentPhone", label: "학생 연락처", type: "text", required: true },
    { name: "parentPhone", label: "보호자 연락처", type: "text", required: true },
    { name: "schoolName", label: "학교", type: "text", required: true },
    { name: "studentGrade", label: "학년", type: "number", required: true },
    { name: "isAttend", label: "재원", type: "number", required: true },
  ]
};


/* 학생 추가/수정 폼 관련 for FormModal.vue */
const studentForm = reactive<IStudentForm>({
  studentName: "",
  studentPhone: "",
  parentPhone: "",
  schoolName: "",
  studentGrade: 1,
  isAttend: 1
});

const createStudentUpdateSubmitData = (formData: IStudentForm): IStudentSubmitData => {
  return {
    student: {
      studentName: formData.studentName,
      studentPhone: formData.studentPhone,
    },
    parents: [{
      parentName: formData.studentName,
      parentPhone: formData.parentPhone,
      password: formData.parentPhone.slice(-4)
    }],
    school: {
      id: 1,
      schoolName: formData.schoolName
    },
    lectures: [{
      id: 1
    }]
  };
};

const editingId = ref<string | null>(null);
const showForm = ref(false);

/* 파일 업로드 관련 */
const fileInput = ref<HTMLInputElement | null>(null);
const parsedData = ref<IExcelUploadData>({ lectures: [] });
const upLoading = ref(false);


/* 테이블 정보 for DataTable.vue */
const studentTableInfo = ref<ITableInfo>({
  tableName: "student",
  tableComment: "학생",
  columns: [
    { name: "studentCode", comment: "학생 코드" },
    { name: ["lectureStudents", "lecture", "lectureCode"], comment: "강의 코드" },
    { name: "studentName", comment: "이름" },
    { name: ["school", "schoolName"], comment: "학교" },
    { name: "studentPhone", comment: "연락처" },
    { name: ["studentParents", "parent", "parentPhone"], comment: "보호자 연락처" },
    { name: "createdAt", comment: "등록일자" }
  ]
});

/* 학생 목록 관련 for DataTable.vue */
const studentData = ref<IStudent[]>([]);
const loading = ref<boolean>(false);
const totalCount = ref<number>(0);
const currentPage = ref<number>(1);
const perPage = ref<number>(50);
const totalPages = ref<number>(1);

/* 검색 처리 */
const handleSearch = async () => {
  try {
    loading.value = true;
    const result = await fetchStudents(searchParams.value);
    studentData.value = result.data.items;
    totalCount.value = result.data.count;
    totalPages.value = Math.ceil(totalCount.value / perPage.value);
  } catch (error) {
    console.error("Failed to fetch students:", error);
  } finally {
    loading.value = false;
  }
};

/* 페이지 변경 처리 */
const handlePageChange = (page: number) => {
  currentPage.value = page;
  searchParams.value.page = page;
  handleSearch();
};

/* 페이지 당 학생 수 변경 처리 */
const handlePerPageChange = (count: number) => {
  perPage.value = count;
  searchParams.value.page = 1;
  searchParams.value.limit = count;
  handleSearch();
};

/* 폼 제출 처리 */
const handleFormSubmit = async (formData: Record<string, any>) => {
  try {
    if (isEditing.value && editingId.value) {
      console.log(formData);
      // TODO: 수정 API 구현
      const submitData = createStudentUpdateSubmitData(formData as IStudentForm);
      const response = await updateStudent(editingId.value, submitData);
      if (response.code === "ST-04") {
        alert("학생 정보가 수정되었습니다.");
        showForm.value = false;
        await handleSearch();
      }
    } else {
      const response = await createStudent(formData as IStudentForm);
      if (response.code === "ST-02") {
        alert("학생이 추가되었습니다.");
        showForm.value = false;
        await handleSearch();
      }
    }
  } catch (error) {
    console.error("학생 추가/수정 실패:", error);
    alert("학생 추가/수정에 실패했습니다.");
  }
};

/* 파일 업로드 event handler 
 * @param event 파일 업로드 이벤트
 * @see readExcelFile - 엑셀 파일 읽기
 */
const handleFileUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (!target.files?.length) return;

  try {
    upLoading.value = true;
    const file = target.files[0];
    await readExcelFile(file);
  } catch (error) {
    console.error("파일 처리 중 오류 발생:", error);
    alert("파일 처리 중 오류가 발생했습니다.");
  } finally {
    upLoading.value = false;
    if (fileInput.value) fileInput.value.value = "";
  }
};

/**
 * 엑셀 파일 읽기
 * @param file 엑셀 파일
 * @see processExcelData - 엑셀 데이터 처리
 * @memberof handleFileUpload
 */
const readExcelFile = (file: File): Promise<void> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: "binary" });

        const worksheets = Object.keys(workbook.Sheets).filter(name => name.includes(STUDENT_SHEET_NAME));

        worksheets.forEach(worksheet => {
          const jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[worksheet], { 
            header: 1,
            raw: false,  // 문자열로 변환
            dateNF: "yyyy-mm-dd",  // 날짜 형식 지정
            defval: ""  // 빈 셀 처리
          });
          processExcelData(jsonData as any[][]);
        });
        resolve();
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsBinaryString(file);
  });
};

/** 엑셀 데이터 처리 
 * @param data 엑셀 데이터
 * @memberof readExcelFile
 */
const processExcelData = (data: any[][]) => {
  try {

    let errorCount = 0;
    let errorMessage = "";
    
    /* 강의 정보 추출 */
    const lectureRows = data.slice(3, 7);
    const teacherName = lectureRows[0][2];
    const lectureTitle = lectureRows[1][2];
    const lectureCode = lectureRows[2][2];
    
    /* 강의 시작일, 종료일 추출 */
    const rawlectureStartDate = lectureRows[3][2];
    const [year, month, day] = rawlectureStartDate.split("_");
    const lectureStartDate = `${year.length === 2 ? '20' + year : year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
    const lectureEndDate = `${year.length === 2 ? '20' + year : year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
   
    /* 학생 정보 추출 */
    const studentRows = data.slice(9);
    
    /* 강의 정보 맵 생성 */
    const lectureMap = new Map<string, ILectureExcelData>();

  
    for (const row of studentRows) {
      const [
        _emptyCell, 
        _no, 
        _unusedCode, 
        rawIsAttend, // 재원
        studentName, // 이름
        _unusedschool, // 학교(미사용)
        rawStudentPhone,
        rawParentPhone, // 보호자 연락처
        studentCode, // 학생 코드 (31x + 1007031218)(ex. ST311007031218)
        rawSchoolCode, // 학교 코드 (ex. 서울_1)
      ] = row;
  
      /* 이름 또는 학생 코드가 없으면 건너뜀 */
      if (!studentName && !studentCode) continue;

      /* 이름 유효성 검사 */
      if (!studentName) {
        errorCount++;
        errorMessage += `${studentName}: ${studentCode} 이름이 없습니다.\n`;
        continue;
      }

      /* 학생 코드 유효성 검사 */
      if (!studentCode) {
        errorCount++;
        errorMessage += `${studentName}: ${studentCode} 학생 코드가 없습니다.\n`;
        continue;
      }

      /* 학생 연락처 추출 & 유효성 검사 */
      const studentPhone = rawStudentPhone.replace(/[-()]/g, "");
      if (!studentPhone) {
        errorCount++;
        errorMessage += `${studentName}: ${studentCode} 학생 연락처가 없습니다.\n`;
        continue;
      }
      if (!PHONE_REGEX_1.test(studentPhone) && !PHONE_REGEX_2.test(studentPhone)) {
        errorCount++;
        errorMessage += `${studentName}: ${studentCode} 학생 연락처가 올바르지 않습니다. ${studentPhone}\n`;
        continue;
      }

      /* 보호자 연락처 추출 */
      const parentPhone = rawParentPhone.replace(/[-()]/g, "");
      if (!parentPhone) {
        errorCount++;
        errorMessage += `${studentName}: ${studentCode} 보호자 연락처가 없습니다.\n`;
        continue;
      }
      if (!PHONE_REGEX_1.test(parentPhone) && !PHONE_REGEX_2.test(parentPhone)) {
        errorCount++;
        errorMessage += `${studentName}: ${studentCode} 보호자 연락처가 올바르지 않습니다. ${parentPhone}\n`;
        continue;
      }

      /* 재원 값 추출 & 유효성 검사 */
      const isAttend = Number(rawIsAttend);
      if (![1, 2].includes(isAttend)) {
        errorCount++;
        errorMessage += `${studentName}: ${studentCode} 재원 값이 올바르지 않습니다. ${rawIsAttend}\n`;
        continue;
      }

      /* 학교 정보 추출 & 유효성 검사 */
      const schoolName = rawSchoolCode.split("_")[0];
      if (!schoolName) {
        errorCount++;
        errorMessage += `${studentName}: ${studentCode} 학교 이름이 없습니다.\n`;
        continue;
      }

      /* 학년 추출 & 유효성 검사 */
      const studentGrade = parseInt(rawSchoolCode.split("_")[1]);
      if (!studentGrade) {
        errorCount++;
        errorMessage += `${studentName}: ${studentCode} 학년이 없습니다.\n`;
        continue;
      }
  
      /* 학생 정보 추출 */
      const student: IStudentExcelData = {
        studentName,
        studentPhone,
        studentCode,
        studentGrade,
        isAttend,
        parents: [{
          parentPhone,
        }],
        school: {
          schoolName
        }
      };

      const teacher: ITeacherExcelData = {
        teacherName,
      };
  
      if (!lectureMap.has(lectureCode)) {
        lectureMap.set(lectureCode, {
          lectureCode: lectureCode,
          title: lectureTitle,
          description: "",
          lectureStartDate,
          lectureEndDate,
          teacher,
          students: [],
        });
      }
  
      if (student.studentCode) lectureMap.get(lectureCode)?.students.push(student);
    }

    /* 오류가 있으면 오류 메시지 반환 */
    if (errorCount > 0) {
      throw new Error(`${lectureCode}: ${lectureTitle} 강의 데이터 검증 에러.\n: ${errorCount}개의 오류가 발생했습니다.\n${errorMessage}`);
    }

    parsedData.value = {
      lectures: [ ...parsedData.value.lectures, ...Array.from(lectureMap.values()) ]
    };

    alert(`${lectureCode}: ${lectureTitle} 강의 데이터 검증 완료.`);
  } catch(err) {
    console.error(err);
    alert((err as Error).message);
  }
};

/* 엑셀 업로드 event handler */
const handleUpload = async () => {
  try {
    upLoading.value = true;
  
    /* 엑셀 데이터 업로드 */
    const response = await uploadStudents(parsedData.value);

    /* 엑셀 데이터 업로드 결과 처리 */
    if (response.code === "EX-02") {
      alert("데이터가 성공적으로 업로드되었습니다.");
      await handleSearch();
    } else {
      alert(`${response.code}: ${response.message}`);
    }
  } catch (error) {
    alert(`업로드중 오류 발생: ${(error as Error).message}`);
  } finally {
    upLoading.value = false;

    /* 엑셀 데이터 초기화 */
    if (fileInput.value) fileInput.value.value = "";
    parsedData.value = { lectures: [] };
  }
};

/* 폼 초기화 */
const resetForm = () => {
  studentForm.studentName = "";
  studentForm.studentPhone = "";
  studentForm.parentPhone = "";
  studentForm.schoolName = "";
  isEditing.value = false;
  editingId.value = null;
};

/* 학생 수정 시작 */
const startEdit = (id: number, student: IStudent) => {
  isEditing.value = true;
  editingId.value = id.toString();
  Object.assign(studentForm, {
    studentName: student.studentName,
    studentCode: student.studentCode,
    studentPhone: student.studentPhone,
    parentPhone: student.studentParents?.[0]?.parent?.parentPhone,
    schoolName: student.school?.schoolName
  });
  showForm.value = true;
};

/* 미리보기 테이블 헤더 */
const previewHeaders = [
  { key: "lectureCode", label: "강의 코드" },
  { key: "studentName", label: "이름" },
  { key: "isAttend", label: "재원" },
  { key: "schoolName", label: "학교" },
  { key: "studentGrade", label: "학년"},
  { key: "studentPhone", label: "학생 연락처" },
  { key: "parentPhone", label: "보호자 연락처" },
  { key: "studentCode", label: "학생 코드" },
];

/* 미리보기 테이블 데이터 변환 */
const previewItems = computed(() => {
  return parsedData.value.lectures.flatMap(lecture => 
    lecture.students.map(student => ({
      lectureCode: lecture.lectureCode,
      studentName: student.studentName,
      schoolName: student.school.schoolName,
      studentPhone: student.studentPhone,
      parentPhone: student.parents[0].parentPhone,
      studentCode: student.studentCode,
      isAttend: student.isAttend,
      studentGrade: student.studentGrade,
    }))
  );
});

/* 컴포넌트 마운트 시 검색 처리 */
onMounted(() => {
  handleSearch();
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

      <!-- 데이터 테이블 -->
      <DataTable
        :data="studentData"
        :table-info="studentTableInfo"
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

    <!-- 업로드 영역 -->
    <div class="section-divider"></div>
    <div class="upload-section">
      <div class="section-header">
        <h3>엑셀 업로드</h3>
        <div class="upload-controls">
          <input
            ref="fileInput"
            type="file"
            accept=".xlsx, .xls, .xlsm"
            @change="handleFileUpload"
            :disabled="upLoading"
          />
          <button 
            @click="handleUpload"
            :disabled="upLoading || !parsedData.lectures.length"
            class="upload-btn"
          >
            {{ upLoading ? '처리중...' : '업로드' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 업로드 데이터 미리보기 -->
    <ReadOnlyTable
      v-if="parsedData.lectures.length"
      :headers="previewHeaders"
      :items="previewItems"
      keyField="studentCode"
    >
      <template #title>업로드 데이터 미리보기</template>
    </ReadOnlyTable>

    <!-- 폼 모달 -->
    <FormModal
      :show="showForm"
      :config="formConfig"
      :initialData="studentForm"
      :isEdit="isEditing"
      @update:show="showForm = $event"
      @submit="handleFormSubmit"
    />
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