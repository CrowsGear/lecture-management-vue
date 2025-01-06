<script setup lang="ts">
/* Third Party */
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";

/* Types */
import type { ILecture } from "../../types/lecture";
import type { ISmsFormPlaceholder } from "../../types/constant";

/* API */
import { fetchLectureById, updateLecture } from "../../api/lecture";
import { fetchSmsFormPlaceholders } from "../../api/constant";

/* REFS */
const route = useRoute();
const lecture = ref<ILecture | null>(null);
const loading = ref(true);
const isEditingSmsForm = ref(false);
const smsFormPlaceholders = ref<ISmsFormPlaceholder[]>([]);
const editedSmsForm = ref("");

/* Event Handlers */
const handleEditSmsForm = () => {
  editedSmsForm.value = lecture.value?.smsForm || "";
  isEditingSmsForm.value = true;
};

const handleSaveSmsForm = async () => {
  try {
    if (!lecture.value?.id) return;
    
    const response = await updateLecture(lecture.value.id, {
      smsForm: editedSmsForm.value
    });

    if (response.code === "LC-03") {
      lecture.value.smsForm = editedSmsForm.value;
      isEditingSmsForm.value = false;
      alert("SMS 양식 수정 완료");
    } else {
      alert(`SMS 양식 수정 실패: ${response.message}`);
    }
    
    isEditingSmsForm.value = false;
  } catch (error) {
    console.error("SMS 양식 수정 실패:", error);
    alert(`SMS 양식 수정 실패: ${(error as Error).message}`);
  }
};

const handleCancelEdit = () => {
  isEditingSmsForm.value = false;
  editedSmsForm.value = "";
};

/* Lifecycle Hooks */
onMounted(async () => {
  try {
    /* 강의 정보 조회 */
    const id = parseInt(route.params.id as string);
    const lectureResponse = await fetchLectureById(id);

    if (lectureResponse.code === "LC-01") {
      lecture.value = lectureResponse.data;
    } else {
      throw new Error(`${lectureResponse.code}: ${lectureResponse.message}`);
    }

    /* SMS 양식 조회 */
    const smsFormPlaceholdersResponse = await fetchSmsFormPlaceholders();
    if (smsFormPlaceholdersResponse.code === "CT-01") {
      smsFormPlaceholders.value = smsFormPlaceholdersResponse.data.items;
      console.log(smsFormPlaceholders.value);
    } else {
      throw new Error(`${smsFormPlaceholdersResponse.code}: ${smsFormPlaceholdersResponse.message}`);
    }
  } catch (error) {
    console.error("강의 정보 및 SMS 양식 정보를 불러오는데 실패했습니다:", error);
    alert(`강의 정보 및 SMS 양식 정보를 불러오는데 실패했습니다.\n${(error as Error).message}`);
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="lecture-detail">
    <h2>강의 상세 정보</h2>
    
    <div v-if="loading" class="loading">
      로딩 중...
    </div>
    
    <div v-else-if="lecture" class="table-wrapper">
      <table class="info-table">
        <tbody>
          <tr>
            <th>강의 코드</th>
            <td>{{ lecture.lectureCode }}</td>
          </tr>
          <tr>
            <th>강의명</th>
            <td>{{ lecture.title }}</td>
          </tr>
          <tr>
            <th>강사</th>
            <td>{{ lecture.teacher?.teacherName || '-' }}</td>
          </tr>
          <tr>
            <th>시작일</th>
            <td>{{ lecture.lectureStartDate }}</td>
          </tr>
          <tr>
            <th>설명</th>
            <td>{{ lecture.description || '-' }}</td>
          </tr>
          <tr>
            <th>SMS 양식</th>
            <td class="sms-form-cell">
              <template v-if="isEditingSmsForm">
                <div class="sms-form-preview">
                  <div class="sms-form-container">
                    <div class="placeholders-list">
                      <h4>치환 가능한 값</h4>
                      <ul>
                        <li v-for="placeholder in smsFormPlaceholders" :key="placeholder.key">
                          <span class="placeholder-key">{{ placeholder.description }}</span>
                          <span class="placeholder-value">{{ placeholder.value }}</span>
                        </li>
                      </ul>
                    </div>
                    <div class="sms-preview-box">
                      <div class="sms-preview-header">
                        <span>SMS 미리보기</span>
                      </div>
                      <textarea
                        v-model="editedSmsForm"
                        class="sms-form-editor"
                        rows="5"
                        placeholder="SMS 양식을 입력하세요"
                      ></textarea>
                      <span class="character-count">{{ editedSmsForm.length }}/1000자</span>
                    </div>
                  </div>
                </div>
                <div class="edit-actions">
                  <button class="save-btn" @click="handleSaveSmsForm">저장</button>
                  <button class="cancel-btn" @click="handleCancelEdit">취소</button>
                </div>
              </template>
              <template v-else>
                <div class="sms-form-content">
                  <div class="sms-preview-box">
                    <div class="sms-preview-header">
                      <span>SMS 미리보기</span>
                    </div>
                    <pre>{{ lecture.smsForm || '-' }}</pre>
                    <span class="character-count">{{ (lecture.smsForm || '').length }}/1000자</span>
                  </div>
                  <button class="edit-btn" @click="handleEditSmsForm">수정</button>
                </div>
              </template>
            </td>
          </tr>
          <tr>
            <th>등록일</th>
            <td>{{ lecture.createdAt }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <div v-else class="no-data">
      강의 정보를 찾을 수 없습니다.
    </div>
  </div>
</template>

<style scoped>
.lecture-detail {
  padding: 20px;
}

.loading, .no-data {
  text-align: center;
  padding: 20px;
  color: var(--text-color);
}

.table-wrapper {
  width: 100%;
  margin: 0 auto;
}

.info-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
}

.info-table th {
  width: 120px;
  font-weight: bold;
  text-align: left;
  padding: 12px;
  background-color: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
}

.info-table td {
  padding: 12px;
  border-bottom: 1px solid var(--border-color);
  text-align: left;
  line-height: 1.4;
}

.sms-form-cell {
  position: relative;
  min-height: calc(1.2em * 1.4 * 8);  /* 기본 8줄 높이의 1.2배 */
}

.sms-preview-box {
  background-color: #f8f9fa;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 1rem;
  flex: 1;
  max-width: 400px;  /* 일반적인 핸드폰 가로 크기 */
  aspect-ratio: 9/16;  /* 모바일 화면 비율 */
  margin: 0 auto;  /* 중앙 정렬 */
  display: flex;
  flex-direction: column;
}

.sms-preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--border-color);
  color: var(--text-secondary);
  font-size: 13px;
}

.character-count {
  color: var(--text-secondary);
  font-size: 13px;
  text-align: right;
  padding-top: 8px;
}

.sms-form-preview {
  position: relative;
  background-color: #f8f9fa;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 1rem;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
}

.sms-form-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  min-height: inherit;
  position: relative;
}

.sms-form-content pre {
  white-space: pre-wrap;
  word-break: break-all;
  margin: 0;
  font-family: inherit;
  flex: 1;
  line-height: 1.4;
  min-height: inherit;
  font-size: 15px;
  color: #333;
  padding: 0.5rem;
}

.sms-form-content .edit-btn {
  align-self: flex-end;
  margin-top: auto;
  position: relative;
  z-index: 1;
}

.editor-container {
  position: relative;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.editor-wrapper {
  position: relative;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.sms-form-editor {
  width: 100%;
  padding: 8px;
  border: none;
  border-radius: 4px;
  resize: none;
  min-height: calc(1.2em * 1.4 * 8);
  font-family: inherit;
  line-height: 1.4;
  height: auto;
  font-size: 15px;
  background-color: #ffffff;
  flex: 1;
}

.character-count {
  color: var(--text-secondary);
  font-size: 13px;
  text-align: right;
  padding-top: 8px;
}

.edit-actions {
  display: flex;
  gap: 8px;
  margin-top: 8px;
  justify-content: flex-end;
}

button {
  padding: 4px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.edit-btn {
  background-color: transparent;
  border: 1px solid var(--border-color);
  color: var(--text-color);
}

.save-btn {
  background-color: var(--button-bg);
  color: var(--button-text);
  border: none;
}

.cancel-btn {
  background-color: transparent;
  border: 1px solid var(--border-color);
  color: var(--text-color);
}

.sms-form-container {
  display: flex;
  gap: 1rem;
}

.placeholders-list {
  width: 200px;
  padding: 1rem;
  background-color: #fff;
  border: 1px solid var(--border-color);
  border-radius: 4px;
}

.placeholders-list h4 {
  margin: 0 0 0.5rem 0;
  font-size: 14px;
  color: var(--text-secondary);
}

.placeholders-list ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.placeholders-list li {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--border-color);
  font-size: 13px;
}

.placeholders-list li:last-child {
  border-bottom: none;
}

.placeholder-key {
  color: var(--button-bg);
  font-weight: bold;
}

.placeholder-value {
  color: var(--text-secondary);
}
</style> 