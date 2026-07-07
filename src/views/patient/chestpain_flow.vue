<template>
  <div class="app-container chestpain-flow-page">
    <el-card shadow="never">
      <!-- 顶部：标题 + 下拉选择 -->
      <div class="header-box">
        <span class="title">胸痛诊治流程</span>
        <el-select
          v-model="selectedFlow"
          placeholder="请选择诊治流程"
          style="width: 320px; margin-left: 20px;"
          clearable
        >
          <el-option
            v-for="item in flowOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </div>

      <!-- 主体内容：上图下文（使用 SVG 图片展示流程图） -->
      <div class="content-wrapper">
        <!-- 上：流程图 SVG -->
        <div class="image-box" v-if="currentSvgUrl">
          <img :src="currentSvgUrl" alt="流程图" class="flow-image" />
        </div>

        <!-- 下：对应文字流程说明 -->
        <div class="desc-box" v-if="currentSvgUrl">
          <div class="desc-title">
            {{ currentFlowLabel }} · 流程说明
          </div>
          <div class="desc-content" v-html="currentDesc"></div>
        </div>

        <div class="no-data" v-else>
          <el-empty description="未找到可显示的流程图" />
        </div>
      </div>
    </el-card>
  </div>
</template>

<script>
export default {
  name: "ChestPainFlow",
  data() {
    return {
      // 默认选中“胸痛疾病诊治流程”
      selectedFlow: "cp_main",
      flowOptions: [
        { label: "胸痛疾病诊治流程", value: "cp_main" },
        { label: "STEMI诊治流程", value: "stemi" },
        { label: "USTEMI，UA诊治流程", value: "ustemi_ua" },
        { label: "肺动脉栓塞诊治流程", value: "pe" },
        { label: "主动脉夹层诊治流程", value: "aortic" },
        { label: "三种ACS鉴别诊断", value: "acs_diff" }
              ,
        { label: "心源性休克通路", value: "cardiogenic_shock" },
        { label: "主动脉夹层通路", value: "aortic_dissection" },
        { label: "高危肺栓塞通路", value: "high_risk_pe" }],
      // 使用 SVG 图片路径（放在 public/chestpain 下）
      flowSvgMap: {
        cp_main: "/chestpain/cp_main.svg",
        stemi: "/chestpain/stemi.svg",
        ustemi_ua: "/chestpain/ustemi_ua.svg",
        pe: "/chestpain/pe.svg",
        aortic: "/chestpain/aortic.svg",
        acs_diff: "/chestpain/acs_diff.svg"
      ,
        cardiogenic_shock: "/chestpain/cardiogenic_shock.svg",
        aortic_dissection: "/chestpain/aortic_dissection.svg",
        high_risk_pe: "/chestpain/high_risk_pe.svg"
},
      // 每个流程的文字说明（全部按你提供的内容整理）
      flowDescMap: {
        // 1. 胸痛疾病诊治流程
        cp_main: `
          <ol>
            <li>
              <strong>胸痛诊断流程启动：初始问诊</strong><br>
              询问疼痛特征：胸痛的强度（0–10 分自评）、持续时间（突发 / 持续 / 阵发）、具体部位（胸骨后 / 心前区 / 放射至肩背等）。<br>
              询问诱发 / 缓解因素：疼痛是否随姿势改变（平卧加重 / 前倾减轻）、活动量变化（运动后加重）、硝酸甘油服用后的反应。<br>
              排除外伤：确认是否存在外伤史。
            </li>
            <li>
              <strong>全面体格检查（同步开展）</strong><br>
              循环系统：监测双侧上肢血压（对比双侧差异）、触诊动脉搏动（桡动脉 / 足背动脉，观察对称性）。<br>
              呼吸系统：检查呼吸频率 / 节律，听诊有无啰音 / 哮鸣音。<br>
              全身体征：观察皮肤状态（苍白 / 发绀 / 湿冷）、按压排查胸壁 / 肋骨压痛、听诊心脏体征（心率 / 心律 / 杂音 / 心包摩擦音）。
            </li>
            <li>
              <strong>生命体征持续监测</strong><br>
              实时监测项目：心电（心率、心律）、呼吸频率、血压、血氧饱和度。
            </li>
            <li>
              <strong>紧急心电图（ECG）检查</strong><br>
              时限要求：接诊后 10 分钟内完成 12 导联 ECG。
            </li>
            <li>
              <strong>基于 ECG 结果的不同情况处理</strong><br>
              <u>情况 1：ECG 提示缺血性改变 → 疑似急性冠状动脉综合征（ACS）</u><br>
              · 完善 ECG 检查：加做右心室导联（V3R、V4R 等）、后壁导联（V7–V9）。<br>
              · 分场景处理：<br>
              场景 1：ECG 加做导联后明确缺血<br>
              – 按时间窗（如 0 / 2 / 6 小时）复查心肌标志物（肌钙蛋白、CK-MB 等）。<br>
              场景 2：高度怀疑缺血性心脏病但 ECG 暂不典型<br>
              – 急诊留观，随时复查 ECG（动态观察 ST-T 变化）。<br>
              – 4–8 小时后复查心肌标志物：<br>
              · 标志物阳性 → 确诊缺血性心脏病，进入「急性冠脉综合征处理流程」。<br>
              · 标志物阴性 → 行负荷实验（如运动负荷试验），若实验阳性，同样进入「急性冠脉综合征处理流程」。<br><br>
              <u>情况 2：ECG 无缺血性改变 → 非 ACS 心源性 / 非心源性胸痛</u><br>
              · 初步辅助检查：完善胸部 X 线检查。<br>
              · 根据 X 线结果细分处理：<br>
              子情况 2-1：X 线提示心脏影像学改变<br>
              – 结合病史 + 体格检查 + 胸片结果 + 超声心动图；<br>
              – 诊断方向：心肌炎、心包炎、心肌病、心脏瓣膜病、心脏压塞等。<br>
              子情况 2-2：X 线提示纵隔影像学改变<br>
              – 进一步检查：完善增强 CT / MRI；<br>
              – 诊断方向：主动脉夹层、纵隔肿瘤、纵隔炎等。<br>
              子情况 2-3：X 线提示肺影像学改变<br>
              – 结合病史 + 体格检查 + 胸片结果 + 氧饱和度；<br>
              – 进一步检查：必要时行肺动脉 CTA；<br>
              – 诊断方向：肺栓塞、气胸、肺炎、胸腔积液、肺部肿瘤等。<br>
              子情况 2-4：X 线无改变 / 其他表现<br>
              – 结合病史 + 体格检查 + 胸片结果；<br>
              – 诊断方向：胸骨骨折、肋软骨炎、肌肉劳损、带状疱疹、惊恐障碍等急危症。
            </li>
          </ol>
        `,
        // 2. STEMI 诊治流程
        stemi: `
          <ol>
            <li>
              <strong>就诊触发（4 种启动途径）</strong><br>
              <u>途径 1：基层转诊</u><br>
              · 基层操作：做 12 导联心电图 → 微信传输心电图至胸痛中心 → 胸痛中心急救电话联系基层医生远程会诊。<br>
              · 确诊 STEMI 后，判断预计转运时间：<br>
              – 若转运时间 &lt; 90 min：完成术前用药 + 一键启动导管室 → 绕行急诊科 → 直达导管室（谈话签字）→ 急诊 PCI。<br>
              – 若转运时间 ≥ 90 min：当地医院评估溶栓 → 判断是否再通：<br>
              · 若再通：3–24 h 内 CAG（冠状动脉造影）→ 补救 PCI。<br>
              · 若未通：直接补救 PCI。<br><br>
              <u>途径 2：呼叫 120</u><br>
              · 急救人员现场操作：评估生命体征 + 必要时 CPR → 做 12 导联心电图 + 微信传输 → 电话联系值班医生远程会诊。<br>
              · 确诊 STEMI 后：<br>
              分支 1（同意手术）：指导用药 + 谈话 + 一键启动导管室 → 绕行急诊科 → 导管室 → 急诊 PCI。<br>
              分支 2（同意溶栓）：绕行急诊科 → ICU → 溶栓 → 判断是否再通：<br>
              · 若再通：3–24 h 内 CAG。<br>
              · 若未通：急诊 PCI。<br><br>
              <u>途径 3：院内突发</u><br>
              · 所在科室操作（10 min 内）：12 导联心电图传输至心电图室 → 急诊诊疗（吸氧、监护、维持生命体征）→ 电话通知心内科值班医师会诊。<br>
              · 确诊 STEMI 后：<br>
              分支 1（同意手术）：指导用药 + 谈话 + 一键启动导管室 → 导管室（谈话签字）→ 急诊 PCI。<br>
              分支 2（同意溶栓）：心内科指导下评估溶栓 → 判断是否再通：<br>
              · 若再通：3–24 h 内 CAG。<br>
              · 若未通：急诊 PCI。<br><br>
              <u>途径 4：自行来院</u><br>
              · 急诊科操作（10 min 内）：评估生命体征 + 既往病史 → 12 导联心电图微信传输 → 建立静脉通路 → cTnI 检测（20 min 内）→ 电话通知心内科值班医师会诊。<br>
              · 生命体征稳定后确诊 STEMI：指导用药 + 谈话 + 手术准备。<br>
              · 判断预计 D-to-B（进导管室到球囊扩张）时间：<br>
              – 若 &lt; 90 min：启动导管室 → 急诊 PCI。<br>
              – 若 ≥ 90 min：启动溶栓 → CCU（溶栓失败 / 溶栓成功后）→ 3–24 h 内补救 PCI / CAG。
            </li>
          </ol>
        `,
        // 3. USTEMI / UA 诊治流程
        ustemi_ua: `
          <ol>
            <li>
              <strong>院前启动阶段（多途径触发）</strong><br>
              <u>基层转诊：</u><br>
              初步评估（生命体征、胸痛特征）→ 吸氧、心电监护、建立静脉通路 → 转诊。<br><br>
              <u>呼叫 120：</u><br>
              急救人员现场评估 → 开放静脉通路、吸氧、心电监护，必要时 CPR → 转运途中持续监护、对症处理。<br><br>
              <u>院内突发：</u><br>
              10 分钟内完成 12 导联心电图、血氧 / 血压监测、建立静脉通路 → 启动胸痛中心流程。<br><br>
              <u>自行来院：</u><br>
              急诊（10 分钟内）完成评估（生命体征、胸痛）→ 吸氧、建立静脉通路 → 10 分钟内完成心电图 + 心肌标志物检测。
            </li>
            <li>
              <strong>院内初步评估</strong><br>
              判断生命体征稳定性：<br>
              · 若不稳定：就地抢救，保障气道、呼吸与循环。<br>
              · 若稳定：结合心电图和心肌标志物，确诊为 USTEMI / UA，转入 CCU（心脏重症监护室）。
            </li>
            <li>
              <strong>CCU 阶段处理</strong><br>
              · 完成危险分层（如 GRACE 评分）。<br>
              · 必要时于 2–12 小时复查心肌标志物，评估病情演变与缺血程度。
            </li>
            <li>
              <strong>分层对应诊疗</strong><br>
              根据危险分层来确定 PCI（经皮冠状动脉介入治疗）的时机：<br>
              · 极高危：2 小时内急诊 PCI。<br>
              · 高危：24 小时内急诊 PCI。<br>
              · 中危：72 小时内 PCI。<br>
              · 低危：72 小时内进行负荷试验（如运动负荷试验）。<br><br>
              对低危患者的负荷试验结果进行分流：<br>
              · 试验阳性：诊断为 CAD（冠心病），需要进一步规范治疗。<br>
              · 试验阴性：可出院，并进入二级预防管理。
            </li>
            <li>
              <strong>后续管理</strong><br>
              · 对确诊 CAD 的患者：按冠心病规范进行药物与介入综合治疗。<br>
              · 对出院患者：强调长期二级预防，包括药物治疗（抗血小板、调脂、降压、控糖等）和生活方式干预（戒烟、饮食调整、适量运动、心理管理等）。
            </li>
          </ol>
        `,
        // 4. 肺动脉栓塞诊治流程
        pe: `
          <ol>
            <li>
              <strong>疑似 PE 识别（启动流程）</strong><br>
              识别疑似 PE 相关表现：突发呼吸困难、胸痛、晕厥等，可伴有呼吸循环障碍表现时，启动肺动脉栓塞诊治流程。
            </li>
            <li>
              <strong>院前急救与转运</strong><br>
              院前操作：呼叫 120 急救，给予吸氧、监测生命体征（心率、血压、血氧）、保持卧床制动，避免患者活动，以减少血栓脱落和加重负担。<br>
              转运方向：优先转运至具备血管外科和介入治疗能力的三级甲等医院。
            </li>
            <li>
              <strong>院内急诊初步评估</strong><br>
              入院后急诊医生根据病史、症状和体征，行 Wells 评分或 Geneva 评分，对 PE 进行临床概率分层（低危 / 中危 / 高危）。
            </li>
            <li>
              <strong>快速辅助检查</strong><br>
              同步完成 D-二聚体检测、心电图检查及胸部 X 线片检查：<br>
              · D-二聚体用于初步排查血栓形成可能；<br>
              · 心电图和 X 线帮助排除其他导致胸痛和呼吸困难的心肺疾病。
            </li>
            <li>
              <strong>基于概率与 D-二聚体的分流</strong><br>
              · 分支 1：临床为低危且 D-二聚体阴性 → 基本排除 PE，转而寻找其他病因。<br>
              · 分支 2：临床为中 / 高危且 D-二聚体阳性 → 进入确诊检查环节。
            </li>
            <li>
              <strong>确诊检查选择</strong><br>
              首选检查：CT 肺动脉造影（CTPA），用于直接显示肺动脉内是否存在血栓及其分布范围。<br>
              替代检查：当存在 CTPA 禁忌（如严重肾功能不全、碘造影剂过敏等）时，可选择核素肺通气灌注扫描（V/Q 扫描）进行评估。<br>
              结果确认：根据影像学结果确定是否为 PE。
            </li>
            <li>
              <strong>PE 危险分层</strong><br>
              根据血流动力学状态、影像特点及右心功能情况，将确诊 PE 患者分为高危、中高危和中低危三类，以指导个体化治疗策略。
            </li>
            <li>
              <strong>分层对应治疗</strong><br>
              · 高危（大面积 PE + 休克 / 低血压）：以紧急溶栓治疗（如阿替普酶）为主，同时给予抗凝治疗，必要时考虑介入或外科取栓。<br>
              · 中高危（次大面积 PE + 右心功能不全）：以抗凝治疗为主并密切监测，如病情恶化，及时评估溶栓或介入治疗指征。<br>
              · 中低危（非大面积 PE）：多采用单纯抗凝治疗，可选择新型口服抗凝药或华法林等。
            </li>
            <li>
              <strong>住院期间管理</strong><br>
              重点监测出血风险及肝肾功能变化，评估抗凝 / 溶栓治疗的安全性与有效性，同时积极防治并发症（如右心衰竭、肺动脉高压等）。
            </li>
            <li>
              <strong>出院后长期管理</strong><br>
              按照病因和复发风险制定规范抗凝疗程（如 3–6 个月或终身抗凝），并做好抗凝监测和药物依从性管理。<br>
              同时控制相关危险因素，如避免长期制动、管理体重、谨慎使用激素或口服避孕药等。
            </li>
            <li>
              <strong>定期随访评估</strong><br>
              随访时可复查 D-二聚体、心脏超声和必要时的肺动脉压力评估，以判断抗凝治疗效果、是否存在慢性血栓栓塞性肺高压，并据此调整后续管理方案。
            </li>
          </ol>
        `,
        // 5. 主动脉夹层诊治流程
        aortic: `
          <ol>
            <li>
              <strong>疑似 AD 识别（启动流程）</strong><br>
              出现新发撕裂样胸痛 / 背痛等典型表现时，应高度怀疑主动脉夹层（AD），立即启动相关诊治流程。
            </li>
            <li>
              <strong>院前急救处理</strong><br>
              急救措施包括：呼叫 120 紧急救援、给予吸氧、使用 β 受体阻滞剂进行降压、给予适当止痛药物控制疼痛，减少应激反应和主动脉壁剪切力。
            </li>
            <li>
              <strong>转运至指定医院</strong><br>
              优先转运至具备血管外科和介入治疗能力的三级甲等医院，以便获得外科及介入多学科协作支持。
            </li>
            <li>
              <strong>院内急诊初步处理</strong><br>
              入院后立即进行心电监护，完善实验室检查（包括 D-二聚体等），评估整体血流动力学状态和靶器官灌注情况。
            </li>
            <li>
              <strong>明确诊断与分型</strong><br>
              通过主动脉增强 CTA 明确破口位置、夹层累及范围及是否累及重要分支血管。<br>
              根据影像结果按 Stanford 分型区分：A 型（累及升主动脉）和 B 型（仅累及降主动脉）。
            </li>
            <li>
              <strong>分型对应治疗</strong><br>
              · 情况 1：Stanford A 型（累及升主动脉）<br>
              – 治疗措施：通常需急诊手术，如升主动脉置换术、杂交手术等，以防止破裂、心包填塞及致命并发症。<br><br>
              · 情况 2：Stanford B 型（仅累及降主动脉）<br>
              – 先判断是否存在并发症（如夹层破裂、脏器缺血等）：<br>
              · 若“是”：多需急诊介入治疗（支架植入术）或外科干预。<br>
              · 若“否”：以药物保守治疗为主，包括降压、调脂、镇痛等综合管理。
            </li>
            <li>
              <strong>术后 / 住院管理</strong><br>
              术后或内科治疗期间，需严密监测并发症（如再次夹层、出血、器官缺血等），动态调整降压和其他药物方案，并在 1 周内复查 CTA 评估治疗效果。
            </li>
            <li>
              <strong>出院后长期管理</strong><br>
              患者需终身规范服药（尤其是降压药），并按医嘱在 3、6、12 个月等时间节点定期复查 CTA 或相关影像，以监测主动脉直径及夹层变化，预防复发和进展。
            </li>
          </ol>
        `,
        // 6. 三种 ACS 鉴别诊断
        acs_diff: `
          <ol>
            <li>
              <strong>启动流程：出现胸痛症状</strong><br>
              触发条件：患者表现出胸痛相关不适，进入急性冠脉综合征（ACS）鉴别诊断流程。
            </li>
            <li>
              <strong>紧急检查（10 分钟内完成）</strong><br>
              在患者就诊后 10 分钟内同步开展心电图（ECG）检查和肌钙蛋白检测，以尽早识别心肌缺血与坏死。
            </li>
            <li>
              <strong>第一步判断：ECG 是否存在 ST 段抬高</strong><br>
              <u>情况 1：ECG 提示 ST 段抬高</u><br>
              · 进一步症状确认：胸痛表现为“剧烈”，且服用硝酸甘油后无明显缓解。<br>
              · 最终诊断：ST 段抬高型心肌梗死（STEMI）。<br><br>
              <u>情况 2：ECG 无 ST 段抬高</u><br>
              · 进入下一步判断：依靠肌钙蛋白结果进行进一步分型。
            </li>
            <li>
              <strong>第二步判断：肌钙蛋白是否升高</strong><br>
              <u>子情况 2-1：肌钙蛋白升高</u><br>
              · 进一步症状确认：胸痛持续时间达数小时，提示持续心肌缺血甚至坏死。<br>
              · 最终诊断：非 ST 段抬高型心肌梗死（NSTEMI / USTEMI）。<br><br>
              <u>子情况 2-2：肌钙蛋白未升高</u><br>
              · 进一步症状确认：胸痛呈阵发性（持续时间 &lt; 20 分钟），且部分患者在服用硝酸甘油后症状可有效缓解。<br>
              · 最终诊断：不稳定型心绞痛（UA）。
            </li>
          </ol>
        `
      ,
        // ===== 新增：三大危重症专病通路（高级版核心） =====
        cardiogenic_shock: `
          <h3>心源性休克通路（高级）</h3>
          <ol>
            <li><b>触发：</b>低血压（SBP &lt; 90mmHg 或 MAP &lt; 65）、需升压药维持、乳酸明显升高、尿量减少、床旁超声提示低心排。</li>
            <li><b>评估：</b>10 分钟内完成意识/灌注/血氧评估 + 床旁超声（LV/RV/IVC），并进行休克分级（SCAI A–E）。</li>
            <li><b>处置：</b>容量与血管活性药物优化；低灌注持续则触发 MCS 预警（IABP/Impella/ECMO）。</li>
            <li><b>联动：</b>ICU 接管，ECMO 团队/导管室协同（按院内资源配置）。</li>
            <li><b>闭环：</b>必须完成“评估—处置—复测”（生命体征/乳酸趋势/超声复评），关键生命威胁状态下不允许结案/出院。</li>
          </ol>
        `,
        aortic_dissection: `
          <h3>主动脉夹层通路（高级）</h3>
          <ol>
            <li><b>触发：</b>症状红旗（突发撕裂样胸背痛/晕厥/神经缺血）、血压差/脉搏不对称、ECG/Tn 与症状不匹配。</li>
            <li><b>规则：</b>高度怀疑夹层时系统提示<b>禁止溶栓/不当抗凝</b>，避免误治。</li>
            <li><b>影像：</b>CTA 主动脉优先（不因常规胸痛路径延误）。</li>
            <li><b>联动：</b>心外/血管外科 + 麻醉/手术室联动，按 Stanford 分型分流处置。</li>
            <li><b>区域接管：</b>若本院能力不足，启动区域中心接管/转运；状态切换留痕、接管依据留痕、全流程可回放。</li>
          </ol>
        `,
        high_risk_pe: `
          <h3>高危肺栓塞通路（高级）</h3>
          <ol>
            <li><b>触发：</b>低氧（SpO₂ &lt; 90%）、低血压/休克、床旁超声提示右心负荷或右室功能受损。</li>
            <li><b>评估：</b>概率模型/风险分层（如 sPESI 等）+ 右心负荷评估（超声/ECG）。</li>
            <li><b>处置：</b>建立会诊链：溶栓 / 导管介入取栓（或导管溶栓）/ ECMO 支持（按指征）。</li>
            <li><b>联动：</b>ICU、介入、麻醉多学科协同；必要时进入区域中心接管或转运流程。</li>
            <li><b>闭环：</b>必须完成“评估—处置—复测”（氧合、血流动力学、右心功能），生命威胁状态下不允许结案/出院。</li>
          </ol>
        `
}
    };
  },
  created() {
    this.applyFlowFromRoute();
  },
  watch: {
    '$route.query.flow': function() {
      this.applyFlowFromRoute();
    }
  },
  methods: {
    applyFlowFromRoute() {
      const flow = this.$route && this.$route.query ? this.$route.query.flow : '';
      if (flow && this.flowSvgMap && this.flowSvgMap[flow]) {
        this.selectedFlow = flow;
      }
    }
  },
  computed: {
    currentSvgUrl() {
      if (!this.selectedFlow) return "";
      return this.flowSvgMap[this.selectedFlow] || "";
    },
    currentDesc() {
      if (!this.selectedFlow) return "";
      return this.flowDescMap[this.selectedFlow] || "";
    },
    currentFlowLabel() {
      const item = this.flowOptions.find(i => i.value === this.selectedFlow);
      return item ? item.label : "";
    }
  }
};
</script>

<style scoped>
.chestpain-flow-page {
  height: 100%;
}

.header-box {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.header-box .title {
  font-size: 18px;
  font-weight: 600;
}

/* 图片 + 描述整体容器 */
.content-wrapper {
  margin-top: 10px;
}

/* 上方流程图区域 */
.image-box {
  width: 100%;
  text-align: center;
}

/* 流程图 SVG 图片样式：宽度占满可用空间，高度等比缩放 */
.flow-image {
  display: inline-block;
  max-width: 100%;
  height: auto;
}

/* 下方文字说明区域 */
.desc-box {
  margin-top: 16px;
  padding: 12px 16px;
  border-top: 1px solid #ebeef5;
}

.desc-title {
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 8px;
}

.desc-content {
  font-size: 18px;
  line-height: 1.8;
  color: #303133;
}

.desc-content ol {
  padding-left: 18px;
}

.desc-content li {
  margin-bottom: 8px;
}

.no-data {
  margin-top: 60px;
}
</style>
