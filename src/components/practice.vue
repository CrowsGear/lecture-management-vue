<template>
  <!-- 동적 이벤트 이름 -->
  <button @[eventName]="handleEvent">
    동적 이벤트
  </button>

  <!-- 조건부 이벤트 핸들러 -->
  <div
      @click="isEnabled ? handleClick : null"
      @mousemove="throttledMouseMove"
  >
    {{ coordinates }}
  </div>
</template>

<script setup>
import { ref } from 'vue'

const eventName = ref('click')
const isEnabled = ref(true)
const coordinates = ref({ x: 0, y: 0 })

const handleEvent = () => {
  console.log(`${eventName.value} 이벤트 발생`)
}

const throttledMouseMove = (event) => {
  coordinates.value = {
    x: event.clientX,
    y: event.clientY
  }
}
</script>
