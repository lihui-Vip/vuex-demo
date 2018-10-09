import { MessageBox } from 'element-ui';

import { setup } from '$lib/utils/api-factory';

import auth from './auth';

setup((axios, ejection) => {
  axios.interceptors.response.use(res => {
    if (navigator.userAgent.indexOf('MSIE') > 0 ||
      /\btrident\/[0-9].*rv[:]11\.0/.test(navigator.userAgent.toLowerCase())) {
      if (typeof res.data === 'string' && JSON) {
        res.data = JSON.parse(res.data);
      }
    }
    if (res.status === 405 || res.data.code === 401) {
      auth.setAuth();

      return ejection;
    }

    if (res.data.code && res.request.responseURL.indexOf('/login?') > 0) {
      return Promise.reject(new Error(res.data.errorMsg || '--'));
    }

    if (!res.data.code) {
      return res;
    }

    MessageBox.alert(res.data.errorMsg || '--', '请求异常');

    if (res.data.$opts && res.data.$opts.continue) {
      return Promise.reject(res.data);
    } else {
      return ejection;
    }
  }, error => {
    error.toString();

    MessageBox.alert('我们遇到了网络问题，请检查您的网络。如果确认没有问题，请联系我们的工作人员。', '网络异常');

    return ejection;
  });
});
