import { createLocalVue, shallowMount } from '@vue/test-utils'
import ElementUI from 'element-ui'

// Mock API modules to avoid require.context in store
jest.mock('@/api/training', () => ({
  getTrainingTasks: jest.fn(() => Promise.resolve({
    data: {
      items: [
        { title: '任务一', hospital: '苏州科技城医院', desc: '测试', type: '标准化流程培训', deadline: '2026-07-12', completed: false, score: '--' },
        { title: '任务二', hospital: '苏州市立医院', desc: '测试', type: '病例复盘', deadline: '2026-07-08', completed: true, score: 92 }
      ]
    }
  })),
  createTraining: jest.fn(() => Promise.resolve({ code: 20000 }))
}))

const ChestpainTraining = require('@/views/chestpain/training/index.vue').default

const localVue = createLocalVue()
localVue.use(ElementUI)

describe('ChestpainTraining.vue', () => {
  let wrapper

  beforeEach(async () => {
    wrapper = shallowMount(ChestpainTraining, { localVue })
    await wrapper.vm.$nextTick()
    await new Promise(resolve => setTimeout(resolve, 50))
  })

  it('renders correctly', () => {
    expect(wrapper.exists()).toBe(true)
  })

  it('renders metric cards', () => {
    const articles = wrapper.findAll('.metrics article')
    expect(articles.length).toBe(3)
  })

  it('filters tasks by hospital', () => {
    wrapper.setData({ filterHospital: '苏州科技城医院' })
    expect(wrapper.vm.filteredTasks.length).toBe(1)
    expect(wrapper.vm.filteredTasks[0].hospital).toBe('苏州科技城医院')
  })

  it('filters tasks by completion status', () => {
    wrapper.setData({ filterStatus: 'completed' })
    expect(wrapper.vm.filteredTasks.every(t => t.completed)).toBe(true)
  })

  it('filters tasks by type', () => {
    wrapper.setData({ filterType: '病例复盘' })
    expect(wrapper.vm.filteredTasks.length).toBe(1)
    expect(wrapper.vm.filteredTasks[0].type).toBe('病例复盘')
  })

  it('returns all tasks when all filters are "all"', () => {
    expect(wrapper.vm.filteredTasks.length).toBe(2)
  })
})
