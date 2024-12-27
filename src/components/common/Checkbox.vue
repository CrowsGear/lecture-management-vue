<script setup lang="ts">
import { computed } from "vue";

const props = withDefaults(defineProps<{

  /* modelValue: 단일/다중 선택 모두 지원 */
  modelValue: boolean | string[];

  /* value: 체크박스의 value 속성 값 */
  value?: string;

  /* disabled: 체크박스 비활성화 여부 */
  disabled?: boolean;

}>(), {
  value: "",
  disabled: false
});

const emit = defineEmits<{
  /* update:modelValue 이벤트를 발생시키는 함수 */
  (e: "update:modelValue", value: boolean | string[]): void;
}>();

const handleChange = (event: Event) => {
  const target = event.target as HTMLInputElement;

  if (Array.isArray(props.modelValue)) {
    const newValue = [...props.modelValue];
    if (target.checked) {
      newValue.push(props.value);
    } else {
      const index = newValue.indexOf(props.value);
      if (index > -1) {
        newValue.splice(index, 1);
      }
    }
    emit("update:modelValue", newValue);
  } else {
    emit("update:modelValue", target.checked);
  }
};

const checked = computed(() => {
  if (Array.isArray(props.modelValue)) {
    return props.modelValue.includes(props.value);
  } else {
    return props.modelValue;
  }
});
</script>

<template>
  <label class="checkbox-wrapper" :class="{ 'is-disabled': disabled }">
    <input
        type="checkbox"
        :checked="checked"
        :value="value"
        :disabled="disabled"
        class="checkbox-input"
        @change="handleChange"
    >
    <span class="checkbox-custom"></span>
    <span class="checkbox-label">
      <slot></slot>
    </span>
  </label>
</template>

<style scoped>
.checkbox-wrapper {
  display: inline-flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
}

.checkbox-input {
  position: absolute;
  opacity: 0;
}

.checkbox-custom {
  width: 18px;
  height: 18px;
  border: 2px solid #ddd;
  border-radius: 3px;
  margin-right: 8px;
  position: relative;
  background: white;
  transition: all 0.2s;
}

.checkbox-input:checked + .checkbox-custom {
  background: #1a73e8;
  border-color: #1a73e8;
}

.checkbox-input:checked + .checkbox-custom::after {
  content: '';
  position: absolute;
  left: 5px;
  top: 2px;
  width: 5px;
  height: 9px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.is-disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
