<template>
  <div class="stat-item">
    <div class="text">
      <p>入院人数: </p>
      <p>{{ admissionCount }}</p>
      <p>上周: {{ lastWeekAdmissionCount }}人</p>
    </div>
    <div ref="chart" class="chart-container" style="width: 120px; height: 120px;" />
  </div>
</template>

<script>
// 确保已安装 echarts: npm install echarts --save
import * as echarts from 'echarts/lib/echarts' // 按需引入核心模块
import 'echarts/lib/chart/pie' // 引入饼图模块

export default {
  props: {
    admissionCount: {
      type: Number,
      default: 12
    },
    lastWeekAdmissionCount: {
      type: Number,
      default: 12
    }
  },
  data() {
    return {
      chart: null
    }
  },
  watch: {
    admissionCount: {
      immediate: true, // 立即执行一次
      handler() {
        this.updateChart()
      }
    },
    lastWeekAdmissionCount: {
      immediate: true, // 立即执行一次
      handler() {
        this.updateChart()
      }
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.initChart()
    })
  },
  beforeDestroy() {
    if (this.chart) {
      this.chart.dispose() // 组件销毁时释放图表实例
      this.chart = null
    }
  },
  methods: {
    initChart() {
      try {
        // 确保DOM元素存在
        if (!this.$refs.chart) {
          console.error('图表容器不存在')
          return
        }

        this.chart = echarts.init(this.$refs.chart)
        window.addEventListener('resize', this.handleResize) // 添加窗口resize监听
      } catch (error) {
        console.error('图表初始化失败:', error)
      }
    },
    updateChart() {
      if (!this.chart) return

      const total = this.admissionCount + this.lastWeekAdmissionCount
      const percentage = total === 0 ? 0
        : ((this.admissionCount / total) * 100).toFixed(2)

      const option = {
        series: [{
          type: 'pie',
          radius: ['70%', '90%'], // 内半径70%，外半径90%
          silent: true, // 禁用交互
          animation: false, // 关闭动画（根据需求可选）
          data: [
            {
              value: this.admissionCount,
              itemStyle: { color: '#007bff' }
            },
            {
              value: Math.max(total, 1) - this.admissionCount, // 保证总和不小于1
              itemStyle: { color: '#f0f0f0' }
            }
          ],
          label: {
            show: true,
            position: 'center',
            formatter: `${percentage}%`,
            fontSize: 18,
            fontWeight: 'bold',
            color: '#007bff'
          }
        }]
      }

      try {
        this.chart.setOption(option)
        this.chart.resize() // 强制重绘
      } catch (error) {
        console.error('图表更新失败:', error)
      }
    },
    handleResize() {
      if (this.chart) {
        this.chart.resize()
      }
    }
  }
}
</script>

<style scoped>
.stat-item {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 10px;
  border: 1px solid #eee; /* 添加边框方便查看容器 */
}

.text {
  min-width: 120px;
  font-size: 14px;
  line-height: 1.5;
}

/* 确保容器有明确尺寸 */
.chart-container {
  flex-shrink: 0;
}
</style>
