<template>
  <!-- 肩关节角度圆环组件（ECharts版） -->
  <div ref="chartRef" class="shoulder-chart" :style="{ width: width + 'px', height: height + 'px' }"></div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import * as echarts from 'echarts';

// 接收外部参数
const props = defineProps({
  // 左/右肩关节
  side: {
    type: String,
    required: true,
    validator: (val) => ['左', '右'].includes(val)
  },
  // 圆环尺寸
  width: {
    type: Number,
    default: 400
  },
  height: {
    type: Number,
    default: 400
  },
  // 角度刻度间隔（默认10度）
  angleStep: {
    type: Number,
    default: 10
  }
});

const chartRef = ref(null);
let chartInstance = null;

// 生成角度数据（0-360度）
const getAngleData = () => {
  const data = [];
  for (let angle = 0; angle <= 360; angle += props.angleStep) {
    // 换算为ECharts极坐标角度（逆时针：360 - angle）
    const polarAngle = 360 - angle;
    // 刻度线起点/终点（内圈/外圈）
    const innerR = 0.85; // 刻度线内半径比例
    const outerR = 0.95; // 刻度线外半径比例
    data.push({
      angle,
      polarAngle,
      innerR,
      outerR
    });
  }
  return data;
};

// 初始化ECharts
const initChart = () => {
  if (!chartRef.value) return;
  // 销毁旧实例
  if (chartInstance) {
    chartInstance.dispose();
  }
  // 创建新实例
  chartInstance = echarts.init(chartRef.value);

  const angleData = getAngleData();

  // 配置项
  const option = {
    // 关闭提示框
    tooltip: { show: false },
    // 极坐标（核心：圆环基于极坐标）
    polar: {
      center: ['50%', '50%'], // 中心位置
      radius: ['0%', '100%'], // 极坐标半径范围
      angleAxis: {
        type: 'value',
        min: 0,
        max: 360,
        // 隐藏默认轴线/刻度
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { show: false },
        splitLine: { show: false }
      },
      radiusAxis: {
        min: 0,
        max: 1,
        // 隐藏径向轴线/刻度
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { show: false },
        splitLine: { show: false }
      }
    },
    // 系列配置
    series: [
      // 1. 底层圆环轮廓
      {
        type: 'pie',
        coordinateSystem: 'polar',
        radius: ['95%', '98%'], // 外圆环粗细
        startAngle: 0,
        itemStyle: {
          color: '#000',
          borderWidth: 0
        },
        // 空数据（仅渲染圆环轮廓）
        data: [{ value: 1 }],
        label: { show: false },
        emphasis: { disabled: true }
      },
      // 2. 角度刻度线（自定义系列）
      {
        type: 'custom',
        coordinateSystem: 'polar',
        renderItem: (params, api) => {
          const { polarAngle, innerR, outerR } = api.value();
          // 获取极坐标下的坐标
          const startPoint = api.coord([polarAngle, innerR]);
          const endPoint = api.coord([polarAngle, outerR]);
          // 绘制刻度线
          return {
            type: 'line',
            shape: {
              x1: startPoint[0],
              y1: startPoint[1],
              x2: endPoint[0],
              y2: endPoint[1]
            },
            style: {
              stroke: '#000',
              lineWidth: 1
            }
          };
        },
        data: angleData
      },
      // 3. 角度数字标注（自定义系列）
      {
        type: 'custom',
        coordinateSystem: 'polar',
        renderItem: (params, api) => {
          const { angle, polarAngle } = api.value();
          // 数字位置（比刻度线更内圈）
          const textR = 0.75;
          const textPoint = api.coord([polarAngle, textR]);
          // 绘制角度数字
          return {
            type: 'text',
            position: textPoint,
            style: {
              text: angle + '°',
              fontSize: 12,
              fill: '#000',
              textAlign: 'center',
              textBaseline: 'middle'
            }
          };
        },
        data: angleData
      }
    ],
    // 中心文字（左/右肩关节）
    graphic: [
      {
        type: 'text',
        left: '50%',
        top: '50%',
        style: {
          text: props.side + '肩关节',
          fontSize: 20,
          fill: '#333',
          textAlign: 'center',
          textBaseline: 'middle'
        },
        // 居中偏移
        transform: [{ translate: [0, 0] }]
      },
      // 方向标注（可选：上/下/内/外）
      { type: 'text', left: '50%', top: '5%', style: { text: '上', fontSize: 14, textAlign: 'center' } },
      { type: 'text', left: '50%', top: '95%', style: { text: '下', fontSize: 14, textAlign: 'center' } },
      { type: 'text', left: '95%', top: '50%', style: { text: '内', fontSize: 14, textBaseline: 'middle' } },
      { type: 'text', left: '5%', top: '50%', style: { text: '外', fontSize: 14, textBaseline: 'middle' } }
    ]
  };

  // 设置配置项
  chartInstance.setOption(option);

  // 自适应窗口大小
  window.addEventListener('resize', () => {
    chartInstance.resize();
  });
};

// 监听参数变化，重新渲染
watch([() => props.side, () => props.angleStep], () => {
  initChart();
});

// 挂载时初始化
onMounted(() => {
  initChart();
});

// 卸载时销毁实例
onUnmounted(() => {
  if (chartInstance) {
    chartInstance.dispose();
    chartInstance = null;
  }
});
</script>

<style scoped>
.shoulder-chart {
  display: inline-block;
  margin: 10px;
}
</style>
