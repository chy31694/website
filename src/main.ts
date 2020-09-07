import Vue from 'vue';
import * as dfns from 'date-fns';

// import Element from 'element-ui';
// import './element-variables.scss';
// import 'element-ui/lib/theme-chalk/index.css';
// import 'font-awesome/css/font-awesome.css';
// @ts-ignore
// import locale from 'element-ui/lib/locale/lang/en';

import '@mdi/font/css/materialdesignicons.css';

import { StarcAPI } from './starc-api/starc';
import * as helpers from './helpers';

import './plugins/highcharts';
import './plugins/loading';
import './plugins/toasts';
import vuetify from './plugins/vuetify';
import router from './router';
import store from './plugins/appStore';

import App from './App.vue'
import './custom.scss';

Vue.config.productionTip = false;


// Vue.use(Element, { locale });
// Vue.component('loading', Loading);


const starc = new StarcAPI();

Vue.use({
    install: (Vue) => {
        Object.defineProperty(Vue.prototype, '$starc', {
            // api.interceptors.request.use();
            get() {
                return starc;
            }
        });

        Object.defineProperty(Vue.prototype, '$helpers', {
            get() {
                return helpers;
            }
        });

        Object.defineProperty(Vue.prototype, '$dfns', {
            get() {
                return dfns;
            }
        });

        Object.defineProperty(Vue.prototype, '$store', {
            get() {
                return store;
            }
        });
    },
});

declare module 'vue/types/vue' {
    interface Vue {
        $starc: StarcAPI;
        $helpers: typeof helpers;
        $dfns: typeof dfns;
        $store: typeof store;
    }
}

const app = new Vue({
    router,
    vuetify,
    render: h => h(App),
}).$mount('#app');
