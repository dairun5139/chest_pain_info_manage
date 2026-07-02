// src/store/modules/patients.js
// 存储患者列表（含生命体征），供预警判断使用

const state = {
  patientList: [] // 从 pat/frontPatInfo 获取的完整患者数据
}

const mutations = {
  SET_PATIENT_LIST(state, list) {
    state.patientList = list || []
  }
}

const actions = {
  setPatientList({ commit }, list) {
    commit('SET_PATIENT_LIST', list)
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
