<template>
  <div class="iframe-container">
    <iframe
      class="embedded-ocr"
      src="https://ocr.cjking.cn"
      frameborder="0"
      referrerpolicy="no-referrer"
    />
  </div>
</template>

<script>
export default {
  name: 'OcrPage'
}
</script>

<style scoped>
.iframe-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.embedded-ocr {
  width: 100%;
  height: 100%;
  border: 0;
}
</style>
