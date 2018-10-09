import Vue from 'vue';
import Vuex from 'vuex';
import Router from 'vue-router';
import Highcharts from 'highcharts';
require('highcharts/modules/exporting')(Highcharts);

import App from './app';
import login from './login';
import './common/exception';
import Auth from './common/auth';
import './common/register-element';
import moduleRoot from './moduleRoot';

// fixed style-loader exception: can't load all style-loader modules.
import './common/css';

Vue.use(Vuex);
Vue.use(Router);
Vue.config.productionTip = false;

const router = new Router({
  // mode: 'history',
  routes: [
    {
      path: '/',
      // redirect: '/healthCare',
    },
    login,
    moduleRoot,
  ],
});

Auth.validate(router);

new Vue({
  router,
  el: '#container',
  render: h => h(App),
  store: new Vuex.Store({
    state: {
      bus: new Vue(),
    },
  }),
});
