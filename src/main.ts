import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { store } from './store'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import { Setting, User, Aim } from '@element-plus/icons-vue'

const app = createApp(App)

app.use(router)
app.use(store)
app.use(ElementPlus)

app.component('Setting', Setting)
app.component('User', User)
app.component('Aim', Aim)

app.mount('#app')