import { create } from 'zustand'

const useAuthStore = create((set, get) => ({
  // 状态
  user: null,       // { username, displayName, role }
  token: null,
  isGuest: false,

  // 初始化检查
  checkAuth: () => {
    const token = localStorage.getItem('jqh_token')
    const guest = localStorage.getItem('jqh_guest')
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        set({
          user: { username: payload.sub, role: 'admin' },
          token,
          isGuest: false
        })
      } catch {
        localStorage.removeItem('jqh_token')
      }
    } else if (guest === 'true') {
      set({ user: { username: '访客', role: 'guest' }, isGuest: true })
    }
  },

  // 管理员登录
  login: (token) => {
    localStorage.setItem('jqh_token', token)
    localStorage.removeItem('jqh_guest')
    const payload = JSON.parse(atob(token.split('.')[1]))
    set({ user: { username: payload.sub, role: 'admin' }, token, isGuest: false })
  },

  // 访客登录
  guestLogin: () => {
    localStorage.setItem('jqh_guest', 'true')
    set({ user: { username: '访客', role: 'guest' }, token: null, isGuest: true })
  },

  // 退出
  logout: () => {
    localStorage.removeItem('jqh_token')
    localStorage.removeItem('jqh_guest')
    set({ user: null, token: null, isGuest: false })
  },

  // 判断是否为管理员
  isAdmin: () => get().user?.role === 'admin',
}))

export default useAuthStore
