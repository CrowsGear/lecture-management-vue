<script setup lang="ts">
/* Third Party */ 
import { AxiosError } from "axios";
import { ref, onUnmounted, onMounted, computed } from "vue";

/* Components */
import SearchForm from "../../components/admin/SearchForm.vue";
import DataTable from "../../components/admin/DataTable.vue";
import FileDropZone from "../../components/common/FileDropZone.vue";
import ImagePreviewModal from "../../components/common/ImagePreviewModal.vue";

/* Types */
import type { IGrade, IParsedGradeImageName, IGradeSearchParams, IParsedGrade, IGradeUploadParams } from "../../types/grade";
import type { ISearchConfig } from "../../types/common/common";
import type { ITableInfo } from "../../types/common/common";

/* APIs */
import { validateGradeImage, uploadGradeImage, fetchGrades, deleteGrade, getSmsForm } from "../../api/grade";

/* CONSTANTS */
/**
 * 파일명 형식 정규식
 * @description 강의코드(15자이하)_YYMMDDHHMM_ST학번.확장자
 */
const FILE_NAME_PATTERN_1 = {
  pattern: /^[A-Za-z0-9-_]{1,15}_\d{10}_ST\d{10}\.(jpg|jpeg|png)$/i,
  message: "파일명 형식이 올바르지 않습니다.\n형식1: 강의코드(15자이하)_YYMMDDHHMM_ST학번.확장자"
};

/**
 * 파일명 형식 정규식 2
 * @description 강의코드(15자이하)_YYMMDDHHMM_CUSTOM학번_ST학번.확장자
 */
const FILE_NAME_PATTERN_2 = {
  pattern: /^[A-Za-z0-9-_]{1,15}_\d{10}_[A-Za-z0-9-_]{1,15}_ST\d{10}\.(jpg|jpeg|png)$/i,
  message: "파일명 형식이 올바르지 않습니다.\n형식2: 강의코드(15자이하)_YYMMDDHHMM_CUSTOM학번_ST학번.확장자"
};

/* REFS for Upload */
const isLoading = ref(false); // 로딩 상태
const uploadProgress = ref(0); // 업로드 진행 상태
const selectedFiles = ref<File[] | null>(null); // 선택된 파일 목록
const parsedSuccessImages = ref<IParsedGrade[]>([]); // 성공한 파일 목록
const parsedFailedImages = ref<IParsedGrade[]>([]); // 실패한 파일 목록
const smsMessageForm = ref<string>(""); // SMS 폼 기본값
const showSmsFormModal = ref(false); // SMS 폼 모달 표시 여부
const editableSmsForm = ref<string>(""); // 수정 가능한 SMS 폼

/* REFS for DataTable.vue */
const gradeData = ref<IGrade[]>([]); // 성적 데이터
const loading = ref(false); // 로딩 상태
const totalCount = ref(0); // 총 데이터 수
const currentPage = ref(1); // 현재 페이지
const perPage = ref(10); // 페이지당 데이터 수
const perPageOptions = ref([10, 25, 50, 100]); // 페이지당 데이터 수 옵션
const totalPages = ref(1); // 총 페이지 수

/* REFS for Image Preview Modal */
const showPreviewModal = ref(false);
const selectedPreviewUrl = ref("");
const selectedFileName = ref("");

/* REFS for Toggle */
const isFailedSmsExpanded = ref(true);  // SMS 발송 실패 섹션 토글 상태
const isAllListExpanded = ref(false);    // 전체 목록 섹션 토글 상태

/* COMPUTED */
const failedSmsData = computed(() => {
  return gradeData.value.filter(item => item.smsStatus !== 1);
});

const openPreviewModal = (image: IParsedGrade) => {
  selectedPreviewUrl.value = image.previewUrl;
  selectedFileName.value = image.fileName;
  showPreviewModal.value = true;
};

/* 파일 처리 관련 함수들 */
/**
 * 파일명 유효성 검사
 * @param file - 검사할 파일
 * @returns {boolean} 유효성 검사 결과
 * @see FILE_NAME_PATTERN_1
 * @see FILE_NAME_PATTERN_2
 * @memberof handleFileSelect
 */
const validateFileName = (file: File): boolean => {
  const validExtensions = ["jpg", "jpeg", "png"];
  const extension = file.name.split(".").pop()?.toLowerCase() || "";
  
  if (!validExtensions.includes(extension)) {
    alert("이미지 파일만 업로드 가능합니다.");
    return false;
  }

  if (
    !FILE_NAME_PATTERN_1.pattern.test(file.name) && 
    !FILE_NAME_PATTERN_2.pattern.test(file.name)
  ) {
    alert(FILE_NAME_PATTERN_1.message + "\n" + FILE_NAME_PATTERN_2.message);
    return false;
  }

  return true;
};

/**
 * 파일명 파싱 함수
 * @param fileName - 파일명
 * @returns {Partial<IParsedGradeImageName>} 파싱된 성적 이미지 정보
 * @see validateFileName
 * @memberof validateAndFilterGradeImage
 */
const parseFileName = (fileName: string): IParsedGradeImageName => {

  const fileNameWithoutExtension = fileName.split(".")[0];

  let lectureCode: string = "";
  let rawDateTime: string = "";
  let studentCode: string = "";
  
  // 파일명 형식1 의 경우
  if (FILE_NAME_PATTERN_1.pattern.test(fileName)) {
    [lectureCode, rawDateTime, studentCode] = fileNameWithoutExtension.split("_");
  }

  // 파일명 형식2 의 경우: CUSTOM학번은 무시.
  if (FILE_NAME_PATTERN_2.pattern.test(fileName)) {
    lectureCode = fileNameWithoutExtension.split("_")[0];
    rawDateTime = fileNameWithoutExtension.split("_")[1];
    studentCode = fileNameWithoutExtension.split("_")[3];
  }

  // 강의코드 길이 검증
  if (lectureCode.length > 15) {
    throw new Error(`${fileName}: 강의코드는 15자 이하여야 합니다.`);
  }
  
  // 강의일시 파싱 (YYMMDDHHMM)
  const year = "20" + rawDateTime.slice(0, 2);
  const month = rawDateTime.slice(2, 4);
  const day = rawDateTime.slice(4, 6);
  const hour = rawDateTime.slice(6, 8);
  const minute = rawDateTime.slice(8, 10);

  const examDateTime = `${year}-${month}-${day} ${hour}:${minute}:00`;

  return {
    fileName,
    rawDateTime,
    examDateTime,
    lectureCode,
    studentCode,
  };
};

/**
 * 파일 미리보기 URL 생성
 * @param file - 이미지 파일
 * @returns {string} 미리보기 URL
 * @memberof validateAndFilterGradeImage
 */
const createPreviewUrl = (file: File): string => {
  return URL.createObjectURL(file);
};

/**
 * 파일 유효성 검사 및 파일명 파싱
 * @param file - 검사할 파일
 * @returns {Promise<IParsedGrade | null>} 검증 결과
 * @see parseFileName
 * @see createPreviewUrl
 * @see validateGradeImage
 * @memberof handleFileSelect
 */
const validateAndFilterGradeImage = async (file: File): Promise<IParsedGrade | null> => {
  const parsedFileName = parseFileName(file.name);
  const previewUrl = createPreviewUrl(file);
  const filePath = `${parsedFileName.lectureCode}/${parsedFileName.rawDateTime}/${file.name}`;
  const params: Partial<IGradeUploadParams> = {
    lecture: {
      lectureCode: parsedFileName.lectureCode!,
      student: {
        studentCode: parsedFileName.studentCode!,
        grade: {
          gradeImageUrl: filePath
        } 
      },
      lectureSession: {
        sessionDate: parsedFileName.examDateTime!.split(" ")[0]
      }
    }
  };

  /* 성적 이미지 검증 */
  try {
    const validateResponse = await validateGradeImage(params);
    const smsFormResponse = await getSmsForm(params);

    if (validateResponse.code !== "GR-10") {
      throw new Error(validateResponse.message);
    }

    if (smsFormResponse.code !== "GR-12") {
      throw new Error(smsFormResponse.message);
    }

    params.smsForm = smsFormResponse.data.smsMessageForm;

    return {
      file,
      ...parsedFileName,
      params: params as IGradeUploadParams,
      previewUrl,
      smsForm: smsFormResponse.data.smsMessageForm
    };
  } catch (error) {
    if (error instanceof AxiosError) {
      parsedFailedImages.value.push({
        file,
        ...parsedFileName,
        params,
        previewUrl,
        errorMessage: error.response?.data?.message || "알 수 없는 오류가 발생했습니다."
      } as IParsedGrade);
    } else {
      parsedFailedImages.value.push({
        file,
        ...parsedFileName,
        params,
        previewUrl,
        errorMessage: (error as Error).message
      } as IParsedGrade);
    }
    return null;
  }
};

/* 이벤트 핸들러 */
/**
 * 파일 선택 핸들러
 * @param files - 선택된 파일 목록
 * @see validateFileName
 * @see validateAndFilterGradeImage
 */
const handleFileSelect = async (files: File[]) => {
  if (!files.length) return;
  
  clearPreviews();
  
  selectedFiles.value = files;
  parsedSuccessImages.value = (await Promise.all(
    files
      .filter(validateFileName) 
      .map(file => validateAndFilterGradeImage(file))
    )).filter(image => image !== null) as IParsedGrade[];
};

/**
 * 업로드 실행
 * @see uploadGradeImage
 */
const handleUpload = async () => {
  if (!parsedSuccessImages.value.length) return;
  
  // SMS 폼 모달 표시
  showSmsFormModal.value = true;
  // 첫 번째 이미지의 SMS 폼을 기본값으로 설정
  smsMessageForm.value = parsedSuccessImages.value[0].smsForm || "";
  editableSmsForm.value = smsMessageForm.value;
};

/**
 * SMS 폼 수정 후 최종 업로드
 */
const handleConfirmUpload = async () => {
  try {
    showSmsFormModal.value = false;
    isLoading.value = true;
    
    // 모든 이미지의 SMS 폼 업데이트
    parsedSuccessImages.value.forEach(image => {
      image.params.smsForm = editableSmsForm.value;
    });
    
    const totalCount = parsedSuccessImages.value.length;
    
    for (let i = 0; i < totalCount; i++) {
      const imageInfo = parsedSuccessImages.value[i];
      try {
        const response = await uploadGradeImage(imageInfo.file, imageInfo.params);
        imageInfo.uploadStatus = "success";
        imageInfo.uploadMessage = response.message;
      } catch (error) {
        imageInfo.uploadStatus = "error";
        imageInfo.uploadMessage = error instanceof Error ? error.message : "업로드 실패";
      }

      uploadProgress.value = ((i + 1) / totalCount) * 100;
    }

    const successCount = parsedSuccessImages.value.filter(img => img.uploadStatus === "success").length;
    alert(`${successCount}/${totalCount}개 파일이 업로드되었습니다.`);
  } catch (error) {
    console.error("업로드 오류:", error);
    alert(`업로드 중 오류가 발생했습니다. ${(error as Error).message}`);
  } finally {
    isLoading.value = false;
    uploadProgress.value = 0;
  }
};

/**
 * 초기화 핸들러
 * @see clearPreviews
 */
const handleReset = () => {
  clearPreviews();
  selectedFiles.value = null;
  parsedSuccessImages.value = [];
  parsedFailedImages.value = [];
};

/* 정리 함수 */
/**
 * 미리보기 URL 정리
 * @memberof handleReset
 * @memberof handleFileSelect
 * @memberof onUnmounted
 */
const clearPreviews = () => {
  parsedSuccessImages.value.forEach(image => {
    URL.revokeObjectURL(image.previewUrl);
  });
};

/* 검색 파라미터 */
const searchParams = ref<IGradeSearchParams>({
  studentName: "",
  lectureCode: "",
  startDate: undefined,
  endDate: undefined,
  page: 1,
  limit: perPage.value
});

/* 검색 설정 */
const searchConfig: ISearchConfig = {
  fields: [
    {
      name: "studentName",
      label: "학생명",
      type: "text",
      placeholder: "학생명을 입력하세요"
    },
    {
      name: "lectureCode",
      label: "강의코드",
      type: "text",
      placeholder: "강의코드를 입력하세요"
    },
    {
      name: "period",
      label: "등록기간",
      type: "period"
    }
  ],
  periods: [
    { label: "오늘", value: "today" },
    { label: "1주일", value: "week" },
    { label: "1개월", value: "month" },
    { label: "3개월", value: "3months" },
    { label: "6개월", value: "6months" }
  ]
};

/* 테이블 정보 for DataTable.vue */
const gradeTableInfo = ref<ITableInfo>({
  tableName: "grade",
  tableComment: "성적",
  columns: [
    { name: ["lectureSession", "lecture", "title"], comment: "강의명"},
    { name: ["lectureSession", "lecture", "lectureCode"], comment: "강의코드" },
    { name: ["student", "studentName"], comment: "학생명" },
    { name: "gradeImageUrl", comment: "이미지" },
    { name: "createdAt", comment: "등록일자" },
    { name: "smsStatus", comment: "SMS 발송 여부" }
  ]
});

/* SMS 발송 실패 테이블 정보 */
const failedSmsTableInfo = ref<ITableInfo>({
  ...gradeTableInfo.value,
  tableComment: "SMS 발송 실패 목록"
});

/* 검색 핸들러 */
const handleSearch = async () => {
  try {
    loading.value = true;
    const response = await fetchGrades(searchParams.value);
    gradeData.value = response.data.items;
    console.log("gradeData", gradeData.value);
    totalCount.value = response.data.count;
    totalPages.value = Math.ceil(totalCount.value / perPage.value);
  } catch (error) {
    console.error("Failed to fetch grades:", error);
    alert("성적 목록 조회 중 오류가 발생했습니다.");
  } finally {
    loading.value = false;
  }
};

/* 페이지네이션 핸들러 */
const handlePageChange = (page: number) => {
  currentPage.value = page;
  searchParams.value.page = page;
  handleSearch();
};

const handlePerPageChange = (count: number) => {
  perPage.value = count;
  searchParams.value.page = 1;
  searchParams.value.limit = count;
  handleSearch();
};

const handleUpdate = async (id: number) => {
  console.log(id);
  /* TODO: 성적 수정 프로세스 */
};

/* 삭제 핸들러 */
const handleDelete = async (id: number) => {
  try {
    loading.value = true;
    await deleteGrade(id);
    alert("성적이 삭제되었습니다.");
    await handleSearch();
  } catch (error) {
    console.error("Failed to delete grade:", error);
    alert("성적 삭제 중 오류가 발생했습니다.");
  } finally {
    loading.value = false;
  }
};

/* 컴포넌트 마운트 시 검색 실행 */
onMounted(() => {
  handleSearch();
});

const handleError = (error: string) => {
  alert(error);
};

/**
 * 컴포넌트 언마운트 시 정리
 */
onUnmounted(() => {
  clearPreviews();
});

/* Toggle Handlers */
/**
 * SMS 발송 실패 섹션 토글
 */
const toggleFailedSms = () => {
  isFailedSmsExpanded.value = !isFailedSmsExpanded.value;
};

/**
 * 전체 목록 섹션 토글
 */
const toggleAllList = () => {
  isAllListExpanded.value = !isAllListExpanded.value;
};
</script>

<template>
  <div class="grade-management">
    <h2>성적 관리</h2>
    
    <!-- 검색 영역 -->
    <SearchForm
      :config="searchConfig"
      v-model:searchParams="searchParams"
      @search="handleSearch"
    />
    <div class="section-divider"></div>

    <!-- SMS 발송 실패 목록 -->
    <div v-if="failedSmsData.length > 0" class="sms-failed-section">
      <div 
        class="section-header error clickable" 
        @click="toggleFailedSms"
      >
        <h3>SMS 발송 실패 ({{ failedSmsData.length }}건)</h3>
        <span class="toggle-icon">
          {{ isFailedSmsExpanded ? "▼" : "▶" }}
        </span>
      </div>
      <div v-show="isFailedSmsExpanded">
        <DataTable
          :data="failedSmsData"
          :table-info="failedSmsTableInfo"
          :loading="loading"
        />
      </div>
    </div>
    
    <div v-if="failedSmsData.length > 0" class="section-divider"></div>

    <!-- 목록 영역 -->
    <div 
      class="section-header clickable"
      @click="toggleAllList"
    >
      <h3>전체 목록 ({{ totalCount }}건)</h3>
      <span class="toggle-icon">
        {{ isAllListExpanded ? "▼" : "▶" }}
      </span>
    </div>
    <div v-show="isAllListExpanded">
      <DataTable
        :data="gradeData"
        :table-info="gradeTableInfo"
        :loading="loading"
        :total-count="totalCount"
        :current-page="currentPage"
        :per-page="perPage"
        :total-pages="totalPages"
        :per-page-options="perPageOptions"
        @update="handleUpdate"
        @delete="handleDelete"
        @update:current-page="handlePageChange"
        @update:per-page="handlePerPageChange"
      />
    </div>

    <div class="section-divider"></div>

    <!-- 업로드 영역 -->
    <div class="upload-section">
      <h3>성적 이미지 업로드</h3>
      <FileDropZone
        accept=".jpg,.jpeg,.png"
        :multiple="true"
        :disabled="isLoading"
        @files-selected="handleFileSelect"
        @error="handleError"
      >
        <template #default>
          <p>성적 이미지 파일을 드래그하거나 클릭하여 업로드</p>
          <p class="sub-text">파일명 형식: 강의코드(15자이하)_YYMMDDHHMM_ST학번.확장자 (혹은 강의코드(15자이하)_YYMMDDHHMM_CUSTOM학번_ST학번.확장자)</p>
        </template>
      </FileDropZone>
      
      <button 
        @click="handleUpload"
        :disabled="isLoading || !selectedFiles?.length"
      >
        업로드
      </button>
    </div>

    <!-- 업로드 진행률 -->
    <div v-if="isLoading" class="progress-bar">
      <div 
        class="progress"
        :style="{ width: `${uploadProgress}%` }"
      ></div>
      <span>{{ Math.round(uploadProgress) }}%</span>
    </div>

    <!-- 파일 미리보기 -->
    <div v-if="parsedSuccessImages.length || parsedFailedImages.length" class="preview-section">
      <!-- 검증 실패 파일 -->
      <div v-if="parsedFailedImages.length" class="preview-group">
        <div class="preview-header">
          <h3>검증 실패한 파일 ({{ parsedFailedImages.length }}개)</h3>
          <span class="preview-notice error">⚠ 아래 파일들은 업로드되지 않습니다</span>
        </div>
        <div class="preview-grid">
          <div 
            v-for="image in parsedFailedImages"
            :key="image.fileName"
            class="preview-item preview-item--failed"
          >
            <div 
              class="preview-image"
              @click="openPreviewModal(image)"
            >
              <img :src="image.previewUrl" :alt="image.fileName">
              <div class="preview-overlay">
                <span>클릭하여 확대보기</span>
              </div>
            </div>
            <div class="preview-info">
              <div class="info-text">
                <p class="filename">{{ image.fileName }}</p>
                <p class="details">
                  {{ image.lectureCode }} | {{ image.examDateTime }}
                </p>
                <p class="error-text">
                  <span class="error-label">실패 원인:</span>
                  {{ image.errorMessage }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 검증 성공 파일 -->
      <div v-if="parsedSuccessImages.length" class="preview-group">
        <div class="preview-header">
          <h3>업로드 가능한 파일 ({{ parsedSuccessImages.length }}개)</h3>
          <span class="preview-notice">✓ 검증이 완료된 파일만 업로드됩니다</span>
        </div>
        <div class="preview-grid">
          <div 
            v-for="image in parsedSuccessImages"
            :key="image.fileName"
            class="preview-item"
            :data-status="image.uploadStatus"
          >
            <div 
              class="preview-image"
              @click="openPreviewModal(image)"
            >
              <img :src="image.previewUrl" :alt="image.fileName">
              <div class="preview-overlay">
                <span>클릭하여 확대보기</span>
              </div>
            </div>
            <div class="preview-info">
              <div class="info-text">
                <p class="filename">{{ image.fileName }}</p>
                <p class="details">
                  {{ image.lectureCode }} | {{ image.examDateTime }}
                </p>
                <p v-if="image.uploadStatus" 
                   :class="['status-text', image.uploadStatus]"
                >
                  {{ image.uploadMessage }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 초기화 버튼 -->
      <div class="preview-actions">
        <button 
          class="reset-button"
          @click="handleReset"
          :disabled="isLoading"
        >
          초기화
        </button>
      </div>
    </div>

    <!-- 이미지 미리보기 모달 -->
    <ImagePreviewModal
      :show="showPreviewModal"
      :image-url="selectedPreviewUrl"
      :image-alt="selectedFileName"
      @close="showPreviewModal = false"
    />
    
    <!-- SMS 폼 확인 모달 -->
    <div v-if="showSmsFormModal" class="modal-overlay">
      <div class="modal-content">
        <h3>SMS 발송 내용 확인</h3>
        <div class="sms-form-editor">
          <textarea 
            v-model="editableSmsForm"
            rows="5"
            placeholder="SMS 발송 내용을 입력하세요"
          ></textarea>
        </div>
        <div class="modal-actions">
          <button 
            class="cancel-button"
            @click="showSmsFormModal = false"
          >
            취소
          </button>
          <button 
            class="confirm-button"
            @click="handleConfirmUpload"
          >
            확인 후 업로드
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.grade-management {
  padding: 20px;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

.upload-section {
  margin: 20px 0;
  display: flex;
  gap: 10px;
  width: 100%;
}

.progress-bar {
  margin: 20px 0;
  background: #eee;
  height: 20px;
  border-radius: 10px;
  overflow: hidden;
  position: relative;
}

.progress {
  background: #4CAF50;
  height: 100%;
  transition: width 0.3s ease;
}

.preview-section {
  margin-top: 20px;
  width: 100%;
  overflow-x: auto;
}

.preview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.preview-item {
  border: 1px solid var(--border-color);
  border-radius: 8px;
  overflow: hidden;
  background-color: var(--bg-color);
}

.preview-item[data-status="success"] {
  border: 2px solid #4CAF50;
  background-color: rgba(76, 175, 80, 0.05);
}

.preview-item[data-status="error"] {
  border: 2px solid var(--error-color);
  background-color: rgba(255, 0, 0, 0.05);
}

.preview-item--failed {
  border: 2px solid var(--error-color);
  background-color: rgba(255, 0, 0, 0.05);
}

.preview-image {
  width: 100%;
  height: 200px;
  overflow: hidden;
  background-color: inherit;
  position: relative;
  cursor: pointer;
}

.preview-image img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.preview-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  opacity: 0;
  transition: opacity 0.3s;
}

.preview-image:hover .preview-overlay {
  opacity: 1;
}

.preview-overlay span {
  color: white;
  font-size: 0.9rem;
}

.preview-info {
  padding: 15px;
}

.info-text {
  text-align: left;
}

.filename {
  font-weight: bold;
  margin: 0 0 5px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.details {
  margin: 0;
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.error-text {
  color: var(--error-color);
  margin: 5px 0 0;
  font-size: 0.9rem;
  line-height: 1.4;
}

.error-label {
  font-weight: bold;
  margin-right: 4px;
}

button {
  padding: 8px 16px;
  background-color: #000;
  color: white;
  border: none;
  cursor: pointer;
}

button:disabled {
  background-color: #666;
  cursor: not-allowed;
}

.section-divider {
  height: 1px;
  background-color: var(--divider-color);
  margin: 2rem 0;
  width: 100%;
}

.preview-group {
  margin-bottom: 2rem;
}

.preview-group:last-child {
  margin-bottom: 0;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.preview-notice {
  font-size: 0.9rem;
  color: #4CAF50;
}

.preview-notice.error {
  color: var(--error-color);
}

.status-text {
  margin: 5px 0 0;
  font-size: 0.9rem;
  line-height: 1.4;
}

.status-text.success {
  color: #4CAF50;
}

.status-text.error {
  color: var(--error-color);
}

.preview-actions {
  display: flex;
  justify-content: center;
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border-color);
}

.reset-button {
  padding: 8px 24px;
  background-color: transparent;
  color: var(--text-color);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.reset-button:hover:not(:disabled) {
  background-color: var(--bg-hover);
  border-color: var(--text-color);
}

.reset-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.table-section {
  margin: 1rem 0;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.table-header:hover {
  background-color: var(--bg-hover);
}

.table-header h3 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: bold;
}

.toggle-icon {
  font-size: 1rem;
  color: var(--text-secondary);
}

.table-content {
  margin-top: 1rem;
}

.sms-failed-section {
  margin-bottom: 2rem;
  border: 1px solid var(--error-color);
  border-radius: 4px;
  overflow: hidden;
}

.section-header {
  padding: 1rem;
  background-color: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
}

.section-header.error {
  background-color: rgba(255, 0, 0, 0.05);
  border-bottom: 1px solid var(--error-color);
}

.section-header h3 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: bold;
  color: var(--text-color);
}

.section-header.error h3 {
  color: var(--error-color);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.section-header.clickable {
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.section-header.clickable:hover {
  background-color: var(--bg-hover);
}

.toggle-icon {
  font-size: 1rem;
  color: var(--text-secondary);
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: var(--bg-color);
  padding: 2rem;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  min-height: 60vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.sms-form-editor {
  margin: 1rem 0;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.sms-form-editor textarea {
  width: 100%;
  padding: 1rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  resize: vertical;
  flex: 1;
  font-size: 14px;
  line-height: 1.5;
  background-color: #fff;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: auto;
}

.modal-actions button {
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  min-width: 80px;
}

.cancel-button {
  background-color: transparent;
  border: 1px solid var(--border-color);
  color: var(--text-color);
  transition: all 0.2s ease;
}

.cancel-button:hover {
  background-color: var(--bg-hover);
  border-color: var(--text-color);
}

.confirm-button {
  background-color: var(--button-bg);
  color: var(--button-text);
  border: none;
  transition: all 0.2s ease;
}

.confirm-button:hover {
  opacity: 0.9;
}
</style> 