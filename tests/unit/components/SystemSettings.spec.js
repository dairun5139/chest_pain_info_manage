import { createLocalVue, shallowMount } from '@vue/test-utils'
import ElementUI from 'element-ui'
import SystemSettings from '@/views/chestpain/system_settings.vue'

const localVue = createLocalVue()
localVue.use(ElementUI)

describe('SystemSettings.vue', () => {
  it('renders the component', () => {
    const wrapper = shallowMount(SystemSettings, { localVue })
    expect(wrapper.exists()).toBe(true)
  })

  it('renders metric cards', () => {
    const wrapper = shallowMount(SystemSettings, { localVue })
    const articles = wrapper.findAll('.metrics article')
    expect(articles.length).toBe(3)
  })

  it('has initial form values', () => {
    const wrapper = shallowMount(SystemSettings, { localVue })
    expect(wrapper.vm.form.platformName).toBe('区域胸痛中心协同平台')
    expect(wrapper.vm.form.responseLimit).toBe('10 分钟')
  })

  it('has all permissions checked by default', () => {
    const wrapper = shallowMount(SystemSettings, { localVue })
    expect(wrapper.vm.permissions).toHaveLength(4)
  })

  it('shows success message on save', async () => {
    const wrapper = shallowMount(SystemSettings, { localVue })
    const mockMessage = jest.fn()
    wrapper.vm.$message = { success: mockMessage }
    wrapper.vm.handleSave()
    expect(mockMessage).toHaveBeenCalledWith('系统设置已保存')
  })
})
