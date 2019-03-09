/* eslint-disable */
import Home from '@/components/Home'

let routes = [
  {
    path: '/',
    name: 'productlist',
    component: Home,
    meta: { 
        requiresAuth: false
    }
  }

]


export default routes
