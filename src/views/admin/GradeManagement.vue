<script setup lang="ts">
/* Third Party */ 
import { ref, onUnmounted, onMounted } from 'vue';

/* Components */
import SearchForm from '../../components/admin/SearchForm.vue';
import DataTable from '../../components/admin/DataTable.vue';
import FileDropZone from '../../components/common/FileDropZone.vue';
import ImagePreviewModal from '../../components/common/ImagePreviewModal.vue';

/* Types */
import type { IGradeImage, IGradePreview, IGradeUploadParams } from '../../types/grade';
import type { ISearchConfig } from '../../types/common/common';
import type { ITableInfo } from '../../types/common/common';

/* APIs */
import { uploadGradeImage, fetchGrades, deleteGrade } from '../../api/grade';

const isLoading = ref(false);
const uploadProgress = ref(0);
const selectedFiles = ref<File[] | null>(null);
const parsedImages = ref<IGradePreview[]>([]);

/* 이미지 미리보기 모달 관련 */
const showPreviewModal = ref(false);
const selectedPreviewUrl = ref('');
const selectedFileName = ref('');

const openPreviewModal = (image: IGradePreview) => {
  selectedPreviewUrl.value = image.previewUrl;
  selectedFileName.value = image.fileName;
  showPreviewModal.value = true;
};

/**
 * 파일명 파싱 함수 (예: "WVA_2412171100_ST3198473462.png")
 * @param fileName - 파일명 (강의코드(15자이하)_YYMMDDHHMM_ST학번.확장자)
 * @returns {Partial<IGradeImage>} 파싱된 성적 이미지 정보
 */
const parseFileName = (fileName: string): Partial<IGradeImage> => {
  const [lectureCode, rawDateTime, studentCode] = fileName.split('.')[0].split('_');
  
  // 강의코드 길이 검증
  if (lectureCode.length > 15) {
    throw new Error(`${fileName}: 강의코드는 15자 이하여야 합니다.`);
  }
  
  // 강의일시 파싱 (YYMMDDHHMM)
  const year = '20' + rawDateTime.slice(0, 2);
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
 * 파일 유효성 검사
 * @param file - 검사할 파일
 * @returns {boolean} 유효성 검사 결과
 */
const validateFile = (file: File): boolean => {
  const validExtensions = ['jpg', 'jpeg', 'png'];
  const extension = file.name.split('.').pop()?.toLowerCase() || '';
  
  if (!validExtensions.includes(extension)) {
    alert('이미지 파일만 업로드 가능합니다.');
    return false;
  }
  
  // 파일명 형식 검사 (강의코드(15자이하)_YYMMDDHHMM_ST학번.ext)
  const fileNamePattern = /^[A-Za-z0-9-_]{1,15}_\d{10}_ST\d{10}\.(jpg|jpeg|png)$/i;
  if (!fileNamePattern.test(file.name)) {
    alert('파일명 형식이 올바르지 않습니다.\n형식: 강의코드(15자이하)_YYMMDDHHMM_ST학번.확장자');
    return false;
  }

  return true;
};

/**
 * 파일 미리보기 URL 생성
 * @param file - 이미지 파일
 * @returns {string} 미리보기 URL
 * 
 * @memberof handleFileSelect
 */
const createPreviewUrl = (file: File): string => {
  return URL.createObjectURL(file);
};

/**
 * 미리보기 URL 정리
 * 
 * @memberof handleFileSelect
 * @memberof handleUpload
 */
const clearPreviews = () => {
  parsedImages.value.forEach(image => {
    URL.revokeObjectURL(image.previewUrl);
  });
};

/**
 * 파일 선택 핸들러 for FileDropZone
 * 
 * @param files - 선택된 파일 목록
 * @see clearPreviews - 기존 미리보기 정리
 * @see validateFile - 파일 유효성 검사
 * @see parseFileName - 파일명 파싱
 * @see createPreviewUrl - 미리보기 URL 생성
 */
const handleFileSelect = (files: File[]) => {
  if (!files.length) return;
  
  clearPreviews();
  
  selectedFiles.value = files;
  parsedImages.value = files
    .filter(validateFile)
    .map(file => ({
      ...parseFileName(file.name),
      previewUrl: createPreviewUrl(file)
    } as IGradePreview));
};

/**
 * 업로드 실행
 * @see uploadGradeImage - 업로드 프로세스
 * @see clearPreviews - 미리보기 정리
 */
const handleUpload = async () => {
  if (!selectedFiles.value?.length) return;
  
  try {
    isLoading.value = true;
    const totalFiles = selectedFiles.value.length;
    
    for (let i = 0; i < totalFiles; i++) {
      const file = selectedFiles.value[i];
      const imageInfo = parsedImages.value[i];

      const filePath = `${imageInfo.lectureCode}/${imageInfo.rawDateTime}/${file.name}`;
      
      const params: IGradeUploadParams = {
        lecture: {
          lectureCode: imageInfo.lectureCode,
          student: {
            studentCode: imageInfo.studentCode,
            grade: {
              gradeImageUrl: filePath
            }
          },
          lectureSession: {
            sessionDate: imageInfo.examDateTime.split(' ')[0]
          }
        }
      };

      await uploadGradeImage(file, params);

      uploadProgress.value = ((i + 1) / totalFiles) * 100;
    }

    alert('모든 파일이 성공적으로 업로드되었습니다.');
  } catch (error) {
    console.error('업로드 오류:', error);
    alert(`업로드 중 오류가 발생했습니다. ${(error as Error).message}`);
  } finally {
    isLoading.value = false;
    uploadProgress.value = 0;
    selectedFiles.value = null;
    clearPreviews();
    parsedImages.value = [];
  }
};

/**
 * 에러 핸들러 for FileDropZone
 * 
 * @param error - 에러 메시지
 */
const handleError = (error: string) => {
  alert(error);
};

/**
 * 컴포넌트 언마운트 시 정리
 */
onUnmounted(() => {
  clearPreviews();
});

/* 검색 파라미터 */
const searchParams = ref({
  studentName: '',
  lectureCode: '',
  period: {
    start: '',
    end: ''
  }
});

/* 검색 설정 */
const searchConfig: ISearchConfig = {
  fields: [
    {
      name: 'studentName',
      label: '학생명',
      type: 'text',
      placeholder: '학생명을 입력하세요'
    },
    {
      name: 'lectureCode',
      label: '강의코드',
      type: 'text',
      placeholder: '강의코드를 입력하세요'
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
};

/* 테이블 정보 for DataTable.vue */
const gradeTableInfo = ref<ITableInfo>({
  tableName: 'grade',
  tableComment: '성적',
  columns: [
    { name: 'lectureCode', comment: '강의코드' },
    { name: 'studentName', comment: '학생명' },
    { name: 'examDateTime', comment: '시험일시' },
    { name: 'gradeImageUrl', comment: '이미지' },
    { name: 'createdAt', comment: '등록일자' }
  ]
});

/* 목록 데이터 for DataTable.vue */
const gradeData = ref<IGradeImage[]>([]);
const loading = ref(false);
const totalCount = ref(0);
const currentPage = ref(1);
const perPage = ref(50);
const totalPages = ref(1);

/* 검색 핸들러 */
const handleSearch = async () => {
  try {
    loading.value = true;
    const response = await fetchGrades(searchParams.value);
    gradeData.value = response.data.items;
    totalCount.value = response.data.count;
    totalPages.value = Math.ceil(totalCount.value / perPage.value);
  } catch (error) {
    console.error('Failed to fetch grades:', error);
    alert('성적 목록 조회 중 오류가 발생했습니다.');
  } finally {
    loading.value = false;
  }
};

/* 페이지네이션 핸들러 */
const handlePageChange = (page: number) => {
  currentPage.value = page;
  handleSearch();
};

const handlePerPageChange = (count: number) => {
  perPage.value = count;
  currentPage.value = 1;
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
    alert('성적이 삭제되었습니다.');
    await handleSearch();
  } catch (error) {
    console.error('Failed to delete grade:', error);
    alert('성적 삭제 중 오류가 발생했습니다.');
  } finally {
    loading.value = false;
  }
};

/* 컴포넌트 마운트 시 검색 실행 */
onMounted(() => {
  handleSearch();
});
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

    <!-- 목록 영역 -->
    <DataTable
      :data="gradeData"
      :table-info="gradeTableInfo"
      :loading="loading"
      :total-count="totalCount"
      :current-page="currentPage"
      :per-page="perPage"
      :total-pages="totalPages"
      :per-page-options="[50, 100]"
      @update="handleUpdate"
      @delete="handleDelete"
      @update:current-page="handlePageChange"
      @update:per-page="handlePerPageChange"
    />
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
          <p class="sub-text">파일명 형식: 강의코드(15자이하)_YYMMDDHHMM_ST학번.확장자</p>
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
    <div v-if="parsedImages.length" class="preview-section">
      <h3>업로드 예정 파일</h3>
      <div class="preview-grid">
        <div 
          v-for="image in parsedImages" 
          :key="image.fileName"
          class="preview-item"
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
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 이미지 미리보기 모달 -->
    <ImagePreviewModal
      :show="showPreviewModal"
      :image-url="selectedPreviewUrl"
      :image-alt="selectedFileName"
      @close="showPreviewModal = false"
    />
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

.preview-image {
  width: 100%;
  height: 200px;
  overflow: hidden;
  background-color: #f5f5f5;
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
</style> 