<template>
  <div class="shoulder-group">
    <!-- 左侧肩关节圆环 -->
    <ShoulderCircleEchart side="左" width="400" height="400" angleStep="15" />
    <!-- 右侧肩关节圆环 -->
    <ShoulderCircleEchart side="右" width="400" height="400" angleStep="15" />
  </div>
</template>

<script setup>
import ShoulderCircleEchart from './ShoulderCircleEchart.vue';
</script>

<style scoped>
.shoulder-group {
  display: flex;
  gap: 20px;
  padding: 20px;
}
</style>
