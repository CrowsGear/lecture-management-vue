<script setup lang="ts">
/**
 * @component FormModal
 * @description 데이터 입력/수정을 위한 재사용 가능한 모달 폼 컴포넌트
 * 
 * @example
 * <FormModal
 *   v-model:show="showModal"
 *   :config="formConfig"
 *   :initial-data="formData"
 *   :is-edit="isEditing"
 *   @submit="handleSubmit"
 * />
 */
import { reactive, watch } from "vue";
import type { IFormConfig } from "../../types/common/form";

/**
 * Props 정의
 * @prop {boolean} show - 모달 표시 여부
 * @prop {IFormConfig} config - 폼 필드 설정 정보
 * @prop {Record<string, any>} [initialData] - 수정 시 초기 데이터
 * @prop {boolean} [isEdit] - 수정 모드 여부
 */
const props = defineProps<{
  show: boolean;
  config: IFormConfig;
  initialData?: Record<string, any>;
  isEdit?: boolean;
}>();

/**
 * Emits 정의
 * @emit {boolean} update:show - 모달 표시 상태 변경
 * @emit {Record<string, any>} submit - 폼 제출 데이터
 */
const emit = defineEmits<{
  (e: "update:show", value: boolean): void;
  (e: "submit", data: Record<string, any>): void;
}>();

/**
 * 폼 데이터 상태 관리
 * @type {Record<string, any>}
 */
const formData = reactive<Record<string, any>>({});

/**
 * 폼 데이터 초기화
 * config의 fields를 기반으로 formData 초기화
 * initialData가 있는 경우 해당 값으로 설정
 */
const initForm = () => {
  props.config.fields.forEach(field => {
    if (props.initialData && props.initialData[field.name] !== undefined) {
      formData[field.name] = props.initialData[field.name];
    } else {
      formData[field.name] = "";
    }
  });
};

/**
 * initialData 변경 감지
 * 모달이 열려있을 때만 폼 데이터 초기화
 */
watch(() => props.initialData, () => {
  if (props.show) {
    initForm();
  }
}, { deep: true });

/**
 * show prop 변경 감지
 * 모달이 열릴 때 폼 데이터 초기화
 */
watch(() => props.show, (newVal) => {
  if (newVal) {
    initForm();
  }
});

/**
 * 폼 제출 처리
 * formData를 복사하여 부모 컴포넌트로 전달
 */
const handleSubmit = () => {
  emit("submit", { ...formData });
};

/**
 * 모달 닫기
 * show 상태를 false로 변경
 */
const closeModal = () => {
  emit("update:show", false);
};
</script>

<template>
  <!-- 모달 오버레이 -->
  <div v-if="show" class="modal-overlay">
    <div class="modal-content">
      <!-- 모달 헤더 -->
      <div class="modal-header">
        <h3>{{ config.title }}</h3>
        <button class="close-btn" @click="closeModal">&times;</button>
      </div>

      <!-- 폼 영역 -->
      <form @submit.prevent="handleSubmit">
        <div class="form-body">
          <!-- 동적 폼 필드 생성 -->
          <div 
            v-for="field in config.fields" 
            :key="field.name"
            class="form-group"
          >
            <label>{{ field.label }}</label>
            
            <!-- Select 입력 필드 -->
            <select
              v-if="field.type === 'select'"
              v-model="formData[field.name]"
              :required="field.required"
              :disabled="field.disabled"
            >
              <option value="">선택하세요</option>
              <option
                v-for="option in field.options"
                :key="option.value"
                :value="option.value"
              >
                {{ option.label }}
              </option>
            </select>

            <!-- 일반 입력 필드 -->
            <input
              v-else
              v-model="formData[field.name]"
              :type="field.type"
              :required="field.required"
              :disabled="field.disabled"
              :placeholder="field.placeholder"
            />
          </div>
        </div>

        <!-- 폼 액션 버튼 -->
        <div class="form-actions">
          <button type="submit">
            {{ config.submitText || (isEdit ? '수정' : '추가') }}
          </button>
          <button type="button" @click="closeModal">
            {{ config.cancelText || '취소' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
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
  border-radius: 8px;
  padding: 20px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--border-color);
}

.modal-header h3 {
  margin: 0;
  color: var(--text-color);
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: var(--text-color);
}

.form-body {
  margin-bottom: 20px;
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
  color: var(--text-color);
}

.form-group input,
.form-group select {
  flex: 1;
  padding: 8px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background-color: var(--bg-color);
  color: var(--text-color);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.form-actions button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.form-actions button[type="submit"] {
  background-color: var(--button-bg);
  color: var(--button-text);
}

.form-actions button[type="button"] {
  background-color: var(--button-disabled);
  color: var(--button-text);
}
</style> 