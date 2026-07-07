<template>
  <div class="app-container">
    <!-- 顶部指标卡片 -->
    <section class="metrics">
      <article v-for="(card, i) in metricCards" :key="i">
        <span>{{ card.label }}</span>
        <strong v-html="card.displayValue" />
        <small>{{ card.desc }}</small>
      </article>
    </section>

    <!-- 工作区 -->
    <section class="workspace">
      <div class="panel active" style="display:block; padding:18px;">
        <div class="panel-head">
          <div>
            <h2>系统设置</h2>
            <p>配置平台通知、会诊规则、质控阈值、培训提醒和账号权限。</p>
          </div>
        </div>
        <div class="settings-grid">
          <el-form
            ref="settingsForm"
            :model="form"
            label-width="auto"
            label-position="top"
            class="settings-form"
            @submit.native.prevent="handleSave"
          >
            <el-form-item label="平台名称">
              <el-input v-model="form.platformName" />
            </el-form-item>
            <el-form-item label="默认响应时限">
              <el-select v-model="form.responseLimit" style="width:100%">
                <el-option label="10 分钟" value="10 分钟" />
                <el-option label="15 分钟" value="15 分钟" />
                <el-option label="20 分钟" value="20 分钟" />
              </el-select>
            </el-form-item>
            <el-form-item label="质控预警阈值">
              <el-select v-model="form.warningThreshold" style="width:100%">
                <el-option label="自动分级" value="自动分级" />
                <el-option label="仅急危提醒" value="仅急危提醒" />
                <el-option label="全部提醒" value="全部提醒" />
              </el-select>
            </el-form-item>
            <el-form-item label="培训截止提醒">
              <el-select v-model="form.trainingReminder" style="width:100%">
                <el-option label="提前 3 天" value="提前 3 天" />
                <el-option label="提前 1 天" value="提前 1 天" />
                <el-option label="当天提醒" value="当天提醒" />
              </el-select>
            </el-form-item>
            <el-form-item label="公告内容">
              <el-input v-model="form.announcement" type="textarea" :rows="4" />
            </el-form-item>
            <el-button type="primary" native-type="submit" style="width:100%">保存设置</el-button>
          </el-form>

          <div class="permission-panel">
            <h3>角色权限</h3>
            <el-checkbox-group v-model="permissions">
              <el-checkbox label="admin">管理员可维护医院资料</el-checkbox>
              <el-checkbox label="quality">质控员可处理预警事件</el-checkbox>
              <el-checkbox label="expert">专家医生可处理跨院会诊</el-checkbox>
              <el-checkbox label="trainer">培训负责人可发布考核任务</el-checkbox>
            </el-checkbox-group>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
export default {
  name: 'ChestpainSettings',
  data() {
    return {
      metricCards: [
        { label: '账号角色', value: '4', displayValue: '4', desc: '管理员 / 质控员 / 专家 / 培训' },
        { label: '通知规则', value: '6', displayValue: '6', desc: '会诊、质控、培训提醒' },
        { label: '系统状态', value: '正常', displayValue: '正常', desc: '接口联通率 99.6%' }
      ],
      form: {
        platformName: '区域胸痛中心协同平台',
        responseLimit: '10 分钟',
        warningThreshold: '自动分级',
        trainingReminder: '提前 3 天',
        announcement: '请各接入医院按要求完善胸痛患者救治数据，并及时响应远程会诊和质控预警。'
      },
      permissions: ['admin', 'quality', 'expert', 'trainer']
    }
  },
  methods: {
    handleSave() {
      this.$message.success('系统设置已保存')
    }
  }
}
</script>

<style lang="scss" scoped>
.metrics {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 16px;
  margin-bottom: 18px;

  article {
    min-height: 108px;
    padding: 18px;
    border: 1px solid $chestLine;
    border-radius: $chestRadiusMd;
    background: $chestSurface;
    box-shadow: $chestShadow;

    span, small {
      display: block;
      color: $chestMuted;
    }
    strong {
      display: block;
      margin: 8px 0 4px;
      color: $chestPrimaryDark;
      font-size: 32px;
    }
  }
}

.workspace {
  border: 1px solid $chestLine;
  border-radius: $chestRadiusMd;
  background: $chestSurface;
  box-shadow: $chestShadow;
  overflow: hidden;
}

.panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 14px;

  h2 { margin: 0 0 5px; font-size: 20px; }
  p { margin: 0; color: $chestMuted; font-size: 13px; }
}

.settings-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) 360px;
  gap: 18px;
}

.settings-form {
  padding: 18px;
  border: 1px solid $chestLine;
  border-radius: $chestRadiusMd;
  background: #fbfdff;
}

.permission-panel {
  display: grid;
  align-content: start;
  gap: 14px;
  padding: 18px;
  border: 1px solid $chestLine;
  border-radius: $chestRadiusMd;
  background: #fbfdff;

  h3 { margin: 0 0 4px; }

  ::v-deep .el-checkbox {
    display: flex;
    align-items: center;
    margin-bottom: 8px;
    color: #4b6175;
  }
}

@media (max-width: 900px) {
  .settings-grid { grid-template-columns: 1fr; }
}
</style>
