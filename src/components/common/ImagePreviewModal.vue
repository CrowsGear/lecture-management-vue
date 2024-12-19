<script setup lang="ts">
/**
 * @component ImagePreviewModal
 * @description 이미지 확대 보기를 위한 모달 컴포넌트
 */
const props = defineProps<{
  show: boolean;
  imageUrl: string;
  imageAlt?: string;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const handleClose = () => {
  emit('close');
};
</script>

<template>
  <div v-if="props.show" class="modal-overlay" @click="handleClose">
    <div class="modal-content" @click.stop>
      <button class="close-btn" @click="handleClose">&times;</button>
      <img :src="props.imageUrl" :alt="props.imageAlt || '이미지 미리보기'" class="preview-image">
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
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  position: relative;
  max-width: 90%;
  max-height: 90vh;
}

.close-btn {
  position: absolute;
  top: -40px;
  right: 0;
  background: none;
  border: none;
  color: white;
  font-size: 30px;
  cursor: pointer;
}

.preview-image {
  max-width: 100%;
  max-height: 90vh;
  object-fit: contain;
}
</style> 