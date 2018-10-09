<template>
  <div class="toll">
    <div class="toll-search">
      <label>登录名：</label>
      <el-input class="loginName"
                :value="msisdnVal"
                @input="set({ msisdnVal: arguments[0] })"
                placeholder="请输入登录名" />
      <label>订单状态：</label>
      <el-select :value="statusVal"
                 class="orderStatus"
                 placeholder="请选择"
                 @input="set({ statusVal: arguments[0] })">
        <el-option :key="n.value"
                   :label="n.label"
                   :value="n.value"
                   v-for="n in orderStatus" />
      </el-select>
      <label>选择日期范围：</label>
      <el-date-picker type="daterange"
                      :editable="false"
                      :value="daterangeVal"
                      format="yyyy/MM/dd"
                      range-separator=" ~ "
                      placeholder="选择日期范围"
                      :picker-options="pickerOptions"
                      @input="set({ daterangeVal: arguments[0] })" />
      <el-button type="primary btn-search"
                 @click="searchTollList"
                 :loading="isLoadingDataSource && isButtonLoading">
        查询
      </el-button>
    </div>
    <loading v-if="isLoadingDataSource && currentPageNo === 1" />
    <div v-else
         class="toll-table">
      <div class="toll-list-title">
        <span class="title-text">我的收费列表</span>
        <span class="list-btns">
          <el-button type="primary"
                     :loading="refundLoding"
                     @click="goRefund">退款</el-button>
          <el-button type="primary"
                     @click="exportTable()"
                     :loading="exportBtnLoading">导出</el-button>
        </span>
      </div>
      <el-table border
                stripe
                :data="dataSource"
                style="width: 100%"
                @selection-change="getChoosedItem"
                v-loading="isLoadingDataSource && currentPageNo !== 1">
        <el-table-column type="selection"
                         width="55">
        </el-table-column>
        <el-table-column prop="msisdn"
                         align="center"
                         label="登录名"
                         width="225" />
        <el-table-column prop="billProject"
                         align="center"
                         label="收费项目"
                         width="185" />
        <el-table-column prop="billFee"
                         align="center"
                         label="收费金额"
                         width="180" />
        <el-table-column prop="statusStr"
                         align="center"
                         label="订单状态"
                         width="175" />
        <el-table-column prop="orderDateStr"
                         align="center"
                         label="开通日期"
                         width="185" />
        <el-table-column label="操作"
                         align="center">
          <template slot-scope="scope">
            <el-button type="text"
                       size="small"
                       v-show="scope.row.status===1"
                       @click.native.prevent="refund(scope.row)">
              退款
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="pager-container">
        <span class="page_list">当前第
          <span>{{currentPageNo}}</span> 页，每页
          <span>15</span> 条记录，共计
          <span>{{total%15 === 0? (total/15 ? total/15 : 1): parseInt(total/15+1)}}</span> 页，共计
          <span>{{total}}</span> 条记录
        </span>
        <el-pagination :total="total"
                       :page-size="15"
                       :current-page="currentPageNo"
                       v-show="!isLoadingDataSource"
                       layout="prev, pager, next, jumper"
                       @current-change="handleCurrentChange" />
      </div>
    </div>
  </div>
</template>

<script>
import _ from 'underscore';
import moment from 'moment';
import { mapState, mapGetters, mapActions } from 'vuex';

import useStyle from '$lib/mixins/use-style';
import Loading from '$lib/components/loading';
import { HIGHCHARTS_FORMAT } from '~/common';
import linkStore from '$lib/mixins/link-store';
import { getLazyObjectNames } from '$lib/utils/lazy-object';
import { mapDefaultMutations } from '$lib/utils/default-mutations';

import store from './store';
import ajax from './config';

import style from './css';

const moduleName = 'toll';

export default {
  props: {
    value: {
      type: String,
      required: true,
    },
    hospitals: {
      type: Array,
      required: true,
    },
  },
  components: { Loading },
  mixins: [linkStore(moduleName, store), useStyle(style)],
  data() {
    const commonParameter = {
      msisdn: () => this.msisdn,
      status: () => this.status,
      sDay: () => this.daterange[0] ? moment(this.daterange[0]).format(HIGHCHARTS_FORMAT) : '',
      eDay: () => this.daterange[1] ? moment(this.daterange[1]).format(HIGHCHARTS_FORMAT) : '',
    };
    return {
      dataApi: ajax({
        url: '/list',
        ...commonParameter,
        page: () => this.currentPageNo,
        limit: 15,
      }),
      exportApi: ajax({
        url: '/export',
        ...commonParameter,
      }),
      refundApi: ajax({
        url: '/refund',
      }),
      pickerOptions: {
        disabledDate(time) {
          return time.getTime() > Date.now();
        },
      },
    };
  },
  computed: {
    ...mapState(moduleName, [
      'orderStatus',
      'daterange',
      'daterangeVal',
      'total',
      'currentPageNo',
      'msisdn',
      'msisdnVal',
      'status',
      'statusVal',
      'refundVal',
      'ids',
      'isButtonLoading',
      'exportBtnLoading',
      'refundLoding',
    ]),
    ...mapGetters(moduleName, getLazyObjectNames('dataSource')),
  },
  methods: {
    ...mapDefaultMutations(moduleName),
    ...mapActions(moduleName, ['fetchData']),
    getChoosedItem(val) {
      this.set({ ids: _.pluck(val, 'id') });
    },
    handleCurrentChange(val) {
      this.set({ currentPageNo: val });

      this.fetchData(this.dataApi);
    },
    searchTollList() {
      this.set({
        status: this.statusVal,
        msisdn: this.msisdnVal,
        daterange: this.daterangeVal,
        currentPageNo: 1,
        isButtonLoading: true,
      });

      this.fetchData(this.dataApi);
    },
    async exportTable() {
      try {
        const token = setTimeout(() => this.set({ exportBtnLoading: true }), 100);

        const { result } = await this.exportApi.fetch();

        clearTimeout(token);
        location.href = result;
      } finally {
        this.set({ exportBtnLoading: false });
      }
    },
    async drawback(ids) {
      await this.refundApi.post(v => {
        v.params.ids = ids.join(',');

        return v;
      });

      this.$message({
        message: '退款成功',
        type: 'success',
      });
      this.fetchData(this.dataApi);
    },
    refund(row) {
      this.drawback([row.id]);
    },
    async goRefund() {
      if (this.ids.length > 0) {
        try {
          const token = setTimeout(() => this.set({ refundLoding: true }), 100);

          await this.drawback(this.ids);

          clearTimeout(token);
        } finally {
          this.set({ refundLoding: false, ids: [] });
        }
      } else {
        this.$message('请先勾选所需退款项目');
      }
    },
  },
  mounted() {
    this.fetchData(this.dataApi);
  },
};
</script>
