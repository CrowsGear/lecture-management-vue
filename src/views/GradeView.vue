<script setup lang="ts">
import { ref } from 'vue';
import type { IGradeResponse } from '../types/grade';

defineProps<{
  grade: IGradeResponse;
}>();

const imageLoaded = ref(false);
const imageError = ref(false);

const handleImageLoad = () => {
  imageLoaded.value = true;
};

const handleImageError = () => {
  imageError.value = true;
};
</script>

<template>
  <div class="grade-view">
    <!-- 성적 이미지 -->
    <div class="grade-image">
      <div v-if="!imageLoaded && !imageError" class="loading">
        이미지 로딩 중...
      </div>
      <div v-else-if="imageError" class="error">
        이미지를 불러올 수 없습니다.
      </div>
      <img
        v-show="imageLoaded"
        :src="grade.gradeImageUrl"
        :alt="grade.lectureSession!.lecture!.lectureCode"
        @load="handleImageLoad"
        @error="handleImageError"
      />
    </div>
  </div>
</template>

<style scoped>
.grade-view {
  width: 100%;
  height: 100%;
  background-color: var(--bg-color);
  padding: 10px;
  box-sizing: border-box;
  overflow-y: auto;
}

.grade-image {
  position: relative;
  width: 100%;
  background-color: #f5f5f5;
  border-radius: 8px;
  overflow: hidden;
  margin-top: 10px;
}

.grade-image img {
  width: 100%;
  display: block;
  max-width: 1000px;
  margin: 0 auto;
  vertical-align: top;
}

/* 모바일 환경 최적화 */
@media (max-width: 768px) {
  .grade-view {
    padding: 0;
  }

  .grade-image {
    border-radius: 0;
    margin-top: 0;
  }
}

.loading,
.error {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--bg-color);
  color: var(--text-color);
}
</style>
