import Layout from '@/layout'

/**
 * 胸痛中心管理端 — 路由模块
 * 对应测试页的 6 个页面功能
 */
const chestpainAdminRouter = {
  path: '/chestpain-admin',
  component: Layout,
  redirect: '/chestpain-admin/hospital',
  name: 'ChestpainAdmin',
  alwaysShow: true,
  meta: {
    title: '胸痛中心管理',
    icon: 'skill',
    roles: [1, 3, 7]
  },
  children: [
    {
      path: 'hospital',
      component: () => import('@/views/chestpain/hospital/index'),
      name: 'ChestpainHospital',
      meta: { title: '医院管理', noCache: true, roles: [1, 3, 7] }
    },
    {
      path: 'quality',
      component: () => import('@/views/chestpain/quality/index'),
      name: 'ChestpainQuality',
      meta: { title: '质控管理', noCache: true, roles: [1, 3, 7] }
    },
    {
      path: 'consult-queue',
      component: () => import('@/views/chestpain/consult_queue/index'),
      name: 'ChestpainConsult',
      meta: { title: '会诊管理', noCache: true, roles: [1, 3, 7] }
    },
    {
      path: 'training',
      component: () => import('@/views/chestpain/training/index'),
      name: 'ChestpainTraining',
      meta: { title: '培训考核', noCache: true, roles: [1, 3, 7] }
    },
    {
      path: 'quality-screen',
      component: () => import('@/views/chestpain/quality_screen'),
      name: 'ChestpainScreen',
      meta: { title: '质控大屏', noCache: true, roles: [1, 3, 7] }
    },
    {
      path: 'settings',
      component: () => import('@/views/chestpain/system_settings'),
      name: 'ChestpainSettings',
      meta: { title: '系统设置', noCache: true, roles: [1, 7] }
    }
  ]
}

export default chestpainAdminRouter
