import { mapLazyObject } from '$lib/utils/lazy-object';
import { defaultMutations } from '$lib/utils/default-mutations';

export default {
  namespaced: true,
  state: {
    ids: [],
    total: 1,
    status: 0,
    msisdn: '',
    msisdnVal: '',
    statusVal: '',
    currentPageNo: 1,
    daterange: [],
    refundVal: [],
    daterangeVal: [],
    refundLoding: false,
    isButtonLoading: false,
    exportBtnLoading: false,
    dataSource: {
      loading: true,
    },
    orderStatus: [
      {
        value: 1,
        label: '已入账',
      },
      {
        value: 2,
        label: '已退款',
      },
    ],
  },
  getters: mapLazyObject('dataSource'),
  mutations: defaultMutations,
  actions: {
    fetchData: async ({ commit, state }, api) => {
      const token = setTimeout(() =>
        commit('set', {
          dataSource: {
            ...state.dataSource,
            loading: true,
          },
        }), 100);

      const { result, total } = await api.fetch();

      clearTimeout(token);
      commit('set', {
        total: parseInt(total),
        dataSource: {
          data: result,
        },
        isButtonLoading: false,
      });
    },
  },
};
