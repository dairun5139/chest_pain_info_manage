<template>
  <div v-if="visible" class="modal-mask" @click.self="$emit('close')">
    <div class="modal-container">
      <h2>胸痛急救时间轴</h2>

      <div class="patient-info">
        <p>患者：顾晓生</p>
        <p>出院编号：33901365</p>
        <p>医院：郑州科技城医院</p>
        <p>住院ID：门诊ID：01865067</p>
        <p>呼救时间：诊断：肺动脉栓塞</p>
        <p>登记时间：2025-04-28 16:16</p>
        <button class="medical-record">点击查看患者病历</button>
      </div>

      <div class="timeline">
        <div class="timeline-line" />
        <div class="timeline-points">
          <div v-for="event in events" :key="event.name" class="timeline-item">

            <div class="timeline-content">
              <time style="display:inline-block;height: 40px">{{ event.formattedTime }}</time>
              <div class="timeline-dot" />
              <p style="display:inline-block;height: 37px">{{ event.name }}</p>
              <div class="timeline-line" style="width: 95%;top: 71%;background-color: red" />
              <p>{{ event.timespy }}</p>
            </div>
          </div>
        </div>
      </div>

      <div class="notes">
        <p><strong>时间节点：</strong>患者临床救治过程中关键时间标记...</p>
      </div>

      <button class="close-btn" @click="$emit('close')">×</button>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    visible: {
      type: Boolean,
      required: true
    },
    events: {
      type: Array, // 接收事件数组
      default: () => []
    }
  }
  /*
  data() {
    return {
      events: [
        { name: '发病时间', time: '2024/7/1 00:00:00' ,timespy:0},
        { name: '首次治疗确诊时间', time: '2024/7/16 07:00:00' ,timespy:1 },
        { name: '初步诊断时间', time: '2024/7/16 07:30:00' ,timespy:0 },
        { name: '消化CT室病人姓名', time: '2024/7/16 07:31:00' ,timespy:0 },
        { name: 'CT室病人姓名', time: '2024/7/16 07:33:00' ,timespy:0 },
        { name: 'CT室诊疗人数', time: '2024/7/16 07:37:00' ,timespy:0 },
        { name: '治疗时间（周）', time: '2024/7/16 07:45:00' ,timespy:0 },
        { name: '体检时间（周）', time: '2024/7/16 07:55:00' ,timespy:0 },
        { name: '报告心电图诊断时间', time: '2024/7/16 07:56:00' ,timespy:0 },
        { name: '检查时间（周）', time: '2024/7/16 08:00:00' ,timespy:0 }
      ]
    };
  },
  mounted()  {
    this.processEvents();
    console.log("this.processedEvents" );
    console.log(this.processedEvents );
  },
  methods: {
    processEvents() {
      console.log('123qwe');
      this.processedEvents = [];
      for (let i = 0; i < this.events.length; i++) {
        const currentEvent = this.events[i];
        const currentTime = new Date(currentEvent.time);
        let timeDifference = 0;

        if (i === 0) {
          // 第一个事件
          this.processedEvents.push({
            ...currentEvent,
            formattedTime: this.formatTime(currentTime),
            timespy: 0
          });
        } else {
          const previousEvent = this.events[i - 1];
          const previousTime = new Date(previousEvent.time);

          // 计算时间差（分钟）
          timeDifference = Math.floor((currentTime - previousTime) / 60000);

          // 添加事件
          this.processedEvents.push({
            ...currentEvent,
            formattedTime: this.formatTime(currentTime, previousEvent.time),
            timespy: timeDifference
          });
        }
      }
    },
    formatTime(currentTime, previousTime) {
      const day = currentTime.getDate();
      const month = currentTime.getMonth() + 1; // 月份从0开始
      const year = currentTime.getFullYear();
      const hours = String(currentTime.getHours()).padStart(2, '0');
      const minutes = String(currentTime.getMinutes()).padStart(2, '0');

      // 检查日期是否需要更改
      if (previousTime) {
        const prevDate = new Date(previousTime);
        if (prevDate.getDate() !== day || prevDate.getMonth() + 1 !== month || prevDate.getFullYear() !== year) {
          return `${year}/${month}/${day} ${hours}:${minutes}`;
        }
      }

      return `${hours}:${minutes}`;
    }
  } */
}
</script>

<style scoped>
.modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-container {
  background: white;
  padding: 25px;
  border-radius: 8px;
  width: 90%;
  max-width: 1000px;
  position: relative;
}

.patient-info {
  margin: 15px 0;
  border-bottom: 1px solid #eee;
  padding-bottom: 15px;
}

.timeline {
  position: relative;
  padding: 20px 0;
}

.timeline-line {
  position: absolute;
  left: 0;
  top: 32.5%;
  width: 100%;
  height: 2px;
  background-color: #808080;
  z-index: 1;
}

.timeline-points {
  display: flex;
  justify-content: space-between;
  position: relative;
  z-index: 2;
}

.timeline-item {
  position: relative;
  text-align: center;
}

.timeline-dot {
  width: 12px;
  height: 12px;
  background-color: #67C23A; /* 圆点颜色 */
  border-radius: 50%; /* 圆形 */
  margin: 0 auto;
}

.timeline-content {
  padding-top: 5px;
}

.timeline-content time {
  font-weight: bold;
  color: #007bff;
}

.notes {
  margin-top: 20px;
}

.close-btn {
  position: absolute;
  top: 15px;
  right: 20px;
  font-size: 24px;
  background: none;
  border: none;
  cursor: pointer;
}
</style>
