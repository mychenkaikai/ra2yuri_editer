import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router'
import General from '../components/sections/General.vue'
import Units from '../components/sections/Units.vue'
import Weapons from '../components/sections/Weapons.vue'
import Warheads from '../components/sections/Warheads.vue'
import Projectiles from '@/components/sections/Projectiles.vue'
const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/general'
  },
  {
    path: '/general',
    name: 'General',
    component: General,
    meta: {
      title: '基础设置'
    }
  },
  {
    path: '/units',
    name: 'Units',
    component: Units,
    meta: {
      title: '单位设置'
    }
  },
  {
    path: '/weapons',
    name: 'Weapons',
    component: Weapons,
    meta: {
      title: '武器设置'
    }
  },
  {
    path: '/warheads',
    name: 'Warheads',
    component: Warheads,
    meta: {
      title: '弹头设置'
    }
  },
  {
    path: '/projectiles',
    name: 'Projectiles',
    component: Projectiles,
    meta: {
      title: '弹道设置'
    }
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router