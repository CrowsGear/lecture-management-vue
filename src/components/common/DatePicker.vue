<script setup lang="ts">
import {ref, computed} from "vue";
import {format, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths} from "date-fns";


const props = defineProps<{
  modelValue: string;
  placeholder?: string;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: string): void;
}>();

const showCalendar = ref(false);
const currentDate = ref(new Date());
const weekDays = ["일", "월", "화", "수", "목", "금", "토"];

const formattedDate = computed(() => {
  return props.modelValue ? format(new Date(props.modelValue), "yyyy-MM-dd") : "";
});

const currentYear = computed(() => currentDate.value.getFullYear());
const currentMonth = computed(() => currentDate.value.getMonth());

const calendarDays = computed(() => {
  const start = startOfMonth(currentDate.value);
  const end = endOfMonth(currentDate.value);

  return eachDayOfInterval({start, end}).map(date => ({
    value: format(date, "yyyy-MM-dd"),
    day: date.getDate(),
    otherMonth: false
  }));
});

const closeCalendar = () => {
  showCalendar.value = false;
};

const selectDate = (date: string) => {
  emit("update:modelValue", date);
  closeCalendar();
};

const isSelected = (date: string) => date === props.modelValue;
const isToday = (date: string) => date === format(new Date(), "yyyy-MM-dd");

const previousMonth = () => {
  currentDate.value = subMonths(currentDate.value, 1);
};

const nextMonth = () => {
  currentDate.value = addMonths(currentDate.value, 1);
};
</script>

<template>
  <div class="datepicker-wrapper">
    <input
        type="text"
        :value="formattedDate"
        readonly
        @click="showCalendar = true"
        class="datepicker-input"
        :placeholder="placeholder"
    >
    <div v-if="showCalendar" class="calendar-popup" v-click-outside="closeCalendar">
      <div class="calendar-header">
        <button @click="previousMonth">&lt;</button>
        <span>{{ currentYear }}년 {{ currentMonth + 1 }}월</span>
        <button @click="nextMonth">&gt;</button>
      </div>
      <div class="calendar-body">
        <div class="weekdays">
          <span v-for="day in weekDays" :key="day">{{ day }}</span>
        </div>
        <div class="days">
          <button
              v-for="date in calendarDays"
              :key="date.value"
              :class="{
              'calendar-day': true,
              'other-month': date.otherMonth,
              'selected': isSelected(date.value),
              'today': isToday(date.value)
            }"
              @click="selectDate(date.value)"
          >
            {{ date.day }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.datepicker-wrapper {
  position: relative;
  display: inline-block;
}

.datepicker-input {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  width: 120px;
  cursor: pointer;
}

.calendar-popup {
  position: absolute;
  top: 100%;
  left: 0;
  z-index: 1000;
  background: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  padding: 10px;
  margin-top: 5px;
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  text-align: center;
  font-weight: bold;
  margin-bottom: 5px;
}

.days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
}

.calendar-day {
  padding: 5px;
  border: none;
  background: none;
  cursor: pointer;
}

.calendar-day:hover {
  background: #f5f5f5;
}

.selected {
  background: #1a73e8;
  color: white;
}

.today {
  font-weight: bold;
  border: 1px solid #1a73e8;
}

.other-month {
  opacity: 0.5;
}
</style>
