<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useAuthStore } from '../stores/auth';
import { fetchGrades } from '../api/grade';
import GradeView from '../views/GradeView.vue';
import type { IGradeResponse } from '../types/grade';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();
const loading = ref(false);
const grades = ref<IGradeResponse[]>([]);
const selectedGrade = ref<IGradeResponse | null>(null);

/* 최신 성적순으로 정렬된 목록 */
const sortedGrades = computed(() => {
  return [...grades.value].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
});

const fetch = async () => {
  try {
    loading.value = true;
    const response = await fetchGrades();
    grades.value = response.data;
    /* 최신 성적을 기본 선택 */
    selectedGrade.value = sortedGrades.value[0];
  } catch (error) {
    alert(`성적 정보를 불러오는 중 오류가 발생했습니다. ${(error as Error).message}`);
  } finally {
    loading.value = false;
  }
};

const handleSelectGrade = (grade: IGradeResponse) => {
  selectedGrade.value = grade;
};

onMounted(() => {
  if (authStore.isAuthenticated) {
    fetch();
  } else {
    alert('로그인 후 이용해주세요.');
    router.push('/');
    return;
  }
});
</script>

<template>
  <div class="grade-view-layout">
    <div v-if="loading" class="loading">
      성적 정보를 불러오는 중...
    </div>
    <div v-else-if="!grades.length" class="no-data">
      등록된 성적이 없습니다.
    </div>
    <template v-else>
      <!-- 성적 정보 헤더 -->
      <div class="grade-header">
        <div v-if="selectedGrade" class="grade-info">
          <h3>{{ selectedGrade.lectureSession!.lecture!.lectureCode }}</h3>
          <span class="date">{{ new Date(selectedGrade.lectureSession.sessionDate).toLocaleDateString() }}</span>
        </div>

        <!-- 성적 목록 -->
        <div class="grade-list">
          <div 
            v-for="grade in sortedGrades" 
            :key="grade.id"
            class="grade-item"
            :class="{ active: selectedGrade?.id === grade.id }"
            @click="handleSelectGrade(grade)"
          >
            <span class="lecture-code">{{ grade.lectureSession!.lecture!.lectureCode }}</span>
            <span class="date">{{ new Date(grade.lectureSession.sessionDate).toLocaleDateString() }}</span>
          </div>
        </div>
      </div>

      <!-- 선택된 성적 상세 보기 -->
      <div class="grade-detail">
        <GradeView 
          v-if="selectedGrade"
          :grade="selectedGrade"
        />
      </div>
    </template>
  </div>
</template>

<style scoped>
.grade-view-layout {
  padding: 0;
  display: flex;
  flex-direction: column;
  height: 100vh;
  max-width: 1000px;
  margin: 0 auto;
  background-color: var(--bg-color);
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  position: relative;
  width: 100%;
}

.loading,
.no-data {
  text-align: center;
  padding: 40px;
  color: var(--text-color);
}

.grade-header {
  background-color: var(--bg-color);
  border-bottom: 1px solid var(--border-color);
  padding: 15px;
  width: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 10px;
  overflow: hidden;
}

.grade-info {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  width: 100%;
}

.grade-info h3 {
  margin: 0;
  font-size: 1.2rem;
  color: var(--text-color);
}

.grade-list {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  padding-bottom: 5px;
  width: 100%;
  box-sizing: border-box;
  padding-right: 15px;
}

.grade-item {
  padding: 10px 20px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.3s ease;
  flex: 1;
  min-width: 200px;
  text-align: center;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.grade-item:hover {
  background-color: var(--bg-hover);
}

.grade-item.active {
  background-color: var(--button-bg);
  color: var(--button-text);
  border-color: var(--button-bg);
}

.lecture-code {
  font-weight: bold;
}

.date {
  color: var(--text-secondary);
}

.grade-detail {
  flex: 1;
  overflow: hidden;
  background-color: var(--bg-secondary);
  width: 100%;
  box-sizing: border-box;
}

/* 모바일 환경 최적화 */
@media (max-width: 768px) {
  .grade-view-layout {
    box-shadow: none;
    height: 100%;
    min-height: 100vh;
  }

  .grade-header {
    padding: 10px;
  }

  .grade-list {
    flex-direction: column;
    width: 100%;
    padding-right: 10px;
  }

  .grade-item {
    width: 100%;
    padding: 8px 15px;
    font-size: 0.9rem;
    min-width: unset;
    justify-content: space-between;
  }

  .grade-info {
    gap: 5px;
    width: 100%;
  }

  .grade-info h3 {
    font-size: 1rem;
    width: 100%;
  }

  .date {
    font-size: 0.9rem;
  }
}
</style>