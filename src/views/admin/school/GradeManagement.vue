<script setup lang="ts">
import { ref } from 'vue';
import type { IGradeImage, IPreSignedUrl } from '../../../types/grade';
import axios from '../../../utils/axios';

const isLoading = ref(false);
const uploadProgress = ref(0);
const selectedFiles = ref<FileList | null>(null);
const parsedImages = ref<IGradeImage[]>([]);

// 파일명 파싱 함수 (예: "20240315_MAT_S12345_95.jpg")
const parseFileName = (fileName: string): Partial<IGradeImage> => {
  const [date, subject, studentCode, score] = fileName.split('_');
  return {
    fileName,
    examDate: `${date.slice(0,4)}-${date.slice(4,6)}-${date.slice(6,8)}`,
    subjectCode: subject,
    studentCode,
    score: parseInt(score)
  };
};

// 파일 유효성 검사
const validateFile = (file: File): boolean => {
  const validExtensions = ['jpg', 'jpeg', 'png'];
  const extension = file.name.split('.').pop()?.toLowerCase() || '';
  
  if (!validExtensions.includes(extension)) {
    alert('이미지 파일만 업로드 가능합니다.');
    return false;
  }
  
  // 파일명 형식 검사 (YYYYMMDD_SUBJECT_STUDENTCODE_SCORE.ext)
  const fileNamePattern = /^\d{8}_[A-Z]{3}_[A-Z]\d{5}_\d{1,3}\.(jpg|jpeg|png)$/i;
  if (!fileNamePattern.test(file.name)) {
    alert('파일명 형식이 올바르지 않습니다.\n형식: YYYYMMDD_과목코드_학생코드_점수.확장자');
    return false;
  }

  return true;
};

// 파일 선택 핸들러
const handleFileSelect = (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (!input.files?.length) return;
  
  selectedFiles.value = input.files;
  parsedImages.value = Array.from(input.files)
    .filter(validateFile)
    .map(file => parseFileName(file.name) as IGradeImage);
};

// S3 Pre-signed URL 요청
const getPreSignedUrl = async (fileName: string): Promise<IPreSignedUrl> => {
  try {
    const response = await axios.post('/api/grades/presigned-url', { fileName });
    
    return response.data;
  } catch (error) {
    console.error('Pre-signed URL 요청 오류:', error);
    throw error;
  }
};

// S3 업로드
const uploadToS3 = async (file: File, preSignedData: IPreSignedUrl): Promise<string> => {
  const formData = new FormData();
  Object.entries(preSignedData.fields).forEach(([key, value]) => {
    formData.append(key, value);
  });
  formData.append('file', file);

  const response = await fetch(preSignedData.url, {
    method: 'POST',
    body: formData
  });

  if (!response.ok) throw new Error('S3 업로드 실패');
  return `${preSignedData.url}/${preSignedData.fields.key}`;
};

// 업로드 실행
const handleUpload = async () => {
  if (!selectedFiles.value?.length) return;
  
  try {
    isLoading.value = true;
    const totalFiles = selectedFiles.value.length;
    
    for (let i = 0; i < totalFiles; i++) {
      const file = selectedFiles.value[i];
      const imageInfo = parsedImages.value[i];
      
      // Pre-signed URL 발급
      const preSignedData = await getPreSignedUrl(file.name);
      
      // S3 업로드
      const imageUrl = await uploadToS3(file, preSignedData);
      
      // DB 저장
      await axios.post('/api/grades', {
        ...imageInfo,
        url: imageUrl
      });

      uploadProgress.value = ((i + 1) / totalFiles) * 100;
    }

    alert('모든 파일이 성공적으로 업로드되었습니다.');
  } catch (error) {
    console.error('업로드 오류:', error);
    alert('업로드 중 오류가 발생했습니다.');
  } finally {
    isLoading.value = false;
    uploadProgress.value = 0;
    selectedFiles.value = null;
    parsedImages.value = [];
  }
};
</script>

<template>
  <div class="grade-management">
    <h2>성적 관리</h2>
    
    <div class="upload-section">
      <input
        type="file"
        multiple
        accept=".jpg,.jpeg,.png"
        @change="handleFileSelect"
        :disabled="isLoading"
      />
      
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
      <table>
        <thead>
          <tr>
            <th>파일명</th>
            <th>시험일자</th>
            <th>과목</th>
            <th>학생코드</th>
            <th>점수</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="image in parsedImages" :key="image.fileName">
            <td>{{ image.fileName }}</td>
            <td>{{ image.examDate }}</td>
            <td>{{ image.subjectCode }}</td>
            <td>{{ image.studentCode }}</td>
            <td>{{ image.score }}</td>
          </tr>
        </tbody>
      </table>
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

.preview-table {
  min-width: 600px;
  width: 100%;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
}

th, td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}

th {
  background-color: #f5f5f5;
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
</style> 