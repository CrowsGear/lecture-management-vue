<script setup lang="ts">
/**
 * @component FileDropZone
 * @description 파일 드래그앤드롭 및 선택 기능을 제공하는 컴포넌트
 * 
 * @example
 * <FileDropZone
 *   :accept="'.jpg,.png'"
 *   :multiple="true"
 *   :max-size="5242880"
 *   @files-selected="handleFiles"
 * />
 */
import { ref } from 'vue';

/**
 * Props 정의
 * @prop {string} [accept] - 허용할 파일 확장자 (예: '.jpg,.png')
 * @prop {boolean} [multiple] - 다중 파일 선택 허용 여부
 * @prop {number} [maxSize] - 최대 파일 크기 (bytes)
 * @prop {boolean} [disabled] - 비활성화 여부
 */
const props = defineProps<{
  accept?: string;
  multiple?: boolean;
  maxSize?: number;
  disabled?: boolean;
}>();

/**
 * Emits 정의
 * @emit {File[]} files-selected - 선택된 파일 목록
 * @emit {string} error - 에러 메시지
 */
const emit = defineEmits<{
  (e: 'files-selected', files: File[]): void;
  (e: 'error', message: string): void;
}>();

const fileInput = ref<HTMLInputElement | null>(null);
const isDragging = ref(false);

/**
 * 파일 유효성 검사
 * @param files - 검사할 파일 목록
 * @returns {boolean} 유효성 검사 결과
 */
const validateFiles = (files: File[]): boolean => {
  // 파일 확장자 검사
  if (props.accept) {
    const allowedTypes = props.accept.split(',');
    const invalid = files.some(file => {
      const ext = '.' + file.name.split('.').pop()?.toLowerCase();
      return !allowedTypes.includes(ext);
    });
    
    if (invalid) {
      emit('error', `허용된 파일 형식: ${props.accept}`);
      return false;
    }
  }

  // 파일 크기 검사
  if (props.maxSize) {
    const oversized = files.some(file => file.size > props.maxSize!);
    if (oversized) {
      emit('error', `최대 파일 크기: ${props.maxSize! / 1024 / 1024}MB`);
      return false;
    }
  }

  return true;
};

/**
 * 파일 처리
 * @param fileList - FileList 객체
 */
const handleFiles = (fileList: FileList) => {
  if (props.disabled) return;
  
  const files = Array.from(fileList);
  if (validateFiles(files)) {
    emit('files-selected', props.multiple ? files : [files[0]]);
  }
};

/**
 * 파일 입력 클릭 핸들러
 */
const handleClick = () => {
  if (props.disabled) return;
  fileInput.value?.click();
};

/**
 * 드래그 이벤트 핸들러
 */
const handleDragEnter = (e: DragEvent) => {
  e.preventDefault();
  if (props.disabled) return;
  isDragging.value = true;
};

const handleDragLeave = (e: DragEvent) => {
  e.preventDefault();
  if (props.disabled) return;
  isDragging.value = false;
};

const handleDragOver = (e: DragEvent) => {
  e.preventDefault();
  if (props.disabled) return;
};

const handleDrop = (e: DragEvent) => {
  e.preventDefault();
  if (props.disabled) return;
  
  isDragging.value = false;
  const dt = e.dataTransfer;
  if (dt?.files) {
    handleFiles(dt.files);
  }
};
</script>

<template>
  <div 
    class="file-drop-zone"
    :class="{ 
      'is-dragging': isDragging,
      'is-disabled': disabled 
    }"
    @click="handleClick"
    @dragenter="handleDragEnter"
    @dragleave="handleDragLeave"
    @dragover="handleDragOver"
    @drop="handleDrop"
  >
    <!-- 숨겨진 파일 입력 -->
    <input
      ref="fileInput"
      type="file"
      :accept="accept"
      :multiple="multiple"
      class="hidden-input"
      @change="e => handleFiles((e.target as HTMLInputElement).files!)"
    >
    
    <!-- 드롭존 콘텐츠 -->
    <div class="drop-content">
      <slot name="icon">
        <div class="default-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path fill="currentColor" d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
          </svg>
        </div>
      </slot>
      
      <div class="drop-text">
        <slot>
          <p>파일을 드래그하거나 클릭하여 업로드</p>
          <p class="sub-text">{{ accept || '모든 파일' }}</p>
        </slot>
      </div>
    </div>
  </div>
</template>

<style scoped>
.file-drop-zone {
  border: 2px dashed var(--border-color);
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background-color: var(--bg-color);
}

.file-drop-zone:hover {
  border-color: var(--button-bg);
}

.is-dragging {
  border-color: var(--button-bg);
  background-color: var(--table-stripe-bg);
}

.is-disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.hidden-input {
  display: none;
}

.drop-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.default-icon {
  color: var(--text-color);
  opacity: 0.5;
}

.drop-text {
  color: var(--text-color);
}

.sub-text {
  font-size: 0.9em;
  opacity: 0.7;
}
</style> 