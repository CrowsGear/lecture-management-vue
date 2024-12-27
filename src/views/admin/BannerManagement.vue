<script setup lang="ts">
import { ref, onMounted } from "vue";
import axios from "../../utils/axios";
import type { IBanner, IPreSignedUrl } from "../../types/banner";

const isLoading = ref(false);
const banners = ref<IBanner[]>([]);
const selectedFile = ref<File | null>(null);
const selectedPosition = ref<"top" | "bottom">("top");

// 배너 목록 조회
const fetchBanners = async () => {
  try {
    const response = await axios.get("/banners");
    banners.value = response.data;
  } catch (error) {
    console.error("배너 목록 조회 실패:", error);
    alert("배너 목록을 불러오는데 실패했습니다.");
  }
};

// 파일 선택 핸들러
const handleFileSelect = (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (!input.files?.length) return;
  
  const file = input.files[0];
  if (!validateFile(file)) return;
  
  selectedFile.value = file;
};

// 파일 유효성 검사
const validateFile = (file: File): boolean => {
  const validExtensions = ["jpg", "jpeg", "png"];
  const extension = file.name.split(".").pop()?.toLowerCase() || "";
  
  if (!validExtensions.includes(extension)) {
    alert("이미지 파일만 업로드 가능합니다.");
    return false;
  }
  
  // 파일 크기 제한 (예: 5MB)
  if (file.size > 5 * 1024 * 1024) {
    alert("파일 크기는 5MB 이하여야 합니다.");
    return false;
  }

  return true;
};

// Pre-signed URL 요청
const getPreSignedUrl = async (fileName: string): Promise<IPreSignedUrl> => {
  try {
    const response = await axios.post("/banners/presigned-url", { fileName });
    return response.data;
  } catch (error) {
    console.error("Pre-signed URL 요청 오류:", error);
    throw error;
  }
};

// S3 업로드
const uploadToS3 = async (file: File, preSignedData: IPreSignedUrl): Promise<string> => {
  const formData = new FormData();
  Object.entries(preSignedData.fields).forEach(([key, value]) => {
    formData.append(key, value);
  });
  formData.append("file", file);

  const response = await fetch(preSignedData.url, {
    method: "POST",
    body: formData
  });

  if (!response.ok) throw new Error("S3 업로드 실패");
  return `${preSignedData.url}/${preSignedData.fields.key}`;
};

// 배너 업로드
const handleUpload = async () => {
  if (!selectedFile.value) return;
  
  try {
    isLoading.value = true;
    
    // Pre-signed URL 발급
    const preSignedData = await getPreSignedUrl(selectedFile.value.name);
    
    // S3 업로드
    const imageUrl = await uploadToS3(selectedFile.value, preSignedData);
    
    // DB 저장
    await axios.post("/banners", {
      position: selectedPosition.value,
      imageUrl,
      isActive: true
    });

    alert("배너가 성공적으로 업로드되었습니다.");
    await fetchBanners();
  } catch (error) {
    console.error("배너 업로드 오류:", error);
    alert("배너 업로드 중 오류가 발생했습니다.");
  } finally {
    isLoading.value = false;
    selectedFile.value = null;
  }
};

// 배너 활성화/비활성화
const toggleBannerStatus = async (banner: IBanner) => {
  try {
    await axios.patch(`/banners/${banner.id}`, {
      isActive: !banner.isActive
    });
    await fetchBanners();
  } catch (error) {
    console.error("배너 상태 변경 실패:", error);
    alert("배너 상태 변경에 실패했습니다.");
  }
};

// 배너 삭제
const deleteBanner = async (bannerId: number) => {
  if (!confirm("정말 삭제하시겠습니까?")) return;
  
  try {
    await axios.delete(`/banners/${bannerId}`);
    await fetchBanners();
    alert("배너가 삭제되었습니다.");
  } catch (error) {
    console.error("배너 삭제 실패:", error);
    alert("배너 삭제에 실패했습니다.");
  }
};

onMounted(fetchBanners);
</script>

<template>
  <div class="banner-management">
    <h2>배너 관리</h2>
    
    <!-- 업로드 섹션 -->
    <div class="upload-section">
      <div class="input-group">
        <select v-model="selectedPosition">
          <option value="top">상단 배너</option>
          <option value="bottom">하단 배너</option>
        </select>
        
        <input
          type="file"
          accept=".jpg,.jpeg,.png"
          @change="handleFileSelect"
          :disabled="isLoading"
        />
      </div>
      
      <button 
        @click="handleUpload"
        :disabled="isLoading || !selectedFile"
        class="upload-btn"
      >
        {{ isLoading ? '업로드 중...' : '업로드' }}
      </button>
    </div>

    <!-- 배너 목록 -->
    <div class="banner-list">
      <h3>배너 목록</h3>
      <div class="banner-grid">
        <div 
          v-for="banner in banners" 
          :key="banner.id" 
          class="banner-item"
        >
          <img :src="banner.imageUrl" :alt="`배너 ${banner.id}`">
          <div class="banner-controls">
            <span>{{ banner.position === 'top' ? '상단' : '하단' }} 배너</span>
            <button 
              @click="toggleBannerStatus(banner)"
              :class="{ active: banner.isActive }"
            >
              {{ banner.isActive ? '활성' : '비활성' }}
            </button>
            <button 
              @click="deleteBanner(banner.id!)"
              class="delete-btn"
            >
              삭제
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.banner-management {
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

.input-group {
  display: flex;
  gap: 10px;
  flex: 1;
}

select {
  padding: 8px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background-color: var(--bg-color);
  color: var(--text-color);
}

.upload-btn {
  padding: 8px 16px;
  background-color: var(--button-bg);
  color: var(--button-text);
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.upload-btn:disabled {
  background-color: var(--button-disabled);
  cursor: not-allowed;
}

.banner-list {
  margin-top: 30px;
  width: 100%;
}

.banner-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 20px;
  width: 100%;
}

.banner-item {
  width: 100%;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  overflow: hidden;
  background-color: var(--bg-color);
}

.banner-item img {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.banner-controls {
  padding: 10px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.banner-controls button {
  padding: 4px 8px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.banner-controls button.active {
  background-color: #4CAF50;
  color: white;
}

.banner-controls button:not(.active) {
  background-color: #f0f0f0;
}

.delete-btn {
  background-color: #ff4444 !important;
  color: white !important;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
  color: var(--text-color);
}

th, td {
  border: 1px solid var(--table-border);
  padding: 8px;
  text-align: left;
}

th {
  background-color: var(--table-header-bg);
}
</style> 