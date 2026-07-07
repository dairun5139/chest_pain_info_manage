// spo2Warning.js
// 【已废弃】预警逻辑已不再使用 SpO2，统一迁移到 vitalsWarning.js
// （收缩压<90mmHg + 持续性胸闷/胸痛 + 心率>110次/分，三项同时满足才预警）。
//
// 保留此文件 + 以下两个旧函数名，只是为了兼容代码库中可能还存在的、
// 没有出现在本次改动范围内的旧 import（例如 import { enrichSpo2Warning } from '@/utils/spo2Warning'）。
// 新代码请直接从 '@/utils/vitalsWarning' 引入 buildVitalsWarning / enrichVitalsWarning。
//
// 建议：全局搜索一下项目里还有没有其它地方 import 了这个文件，确认无误后可以把这个兼容文件删掉。

export { buildVitalsWarning as buildSpo2Warning, enrichVitalsWarning as enrichSpo2Warning } from './vitalsWarning'
