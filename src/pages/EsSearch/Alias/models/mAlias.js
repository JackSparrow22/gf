import {
  indices, //请求数据集列表
  indice, //请求数据集详情
  addAlias,
  getAlias,
  deleteAlias,
  getAliasDetails,
  updateAlias,
} from '@/services/EsSearch/ses';
import { message } from 'antd';

export default {
  namespace: 'alias',
  state: {
    tableList: [],
    dataSet: {
      id: null,
      name: undefined,
      alias: '',
      schema: [],
    },
    index: [],
    loading: true,
  },
  effects: {
    * getAlias({ payload }, { call, put }) {
      const res = yield call(getAlias, payload);
      if (!res) return;
      const { data } = res;
      yield put({
        type: 'saveAlias',
        payload: data,
      });
      const response = yield call(indices);
      if (!response) return;
      const dataIndex = response.data;
      const newDataIndex = dataIndex.filter(item => !data.some(value => value.name === item));
      yield put({
        type: 'saveIndex',
        payload: newDataIndex,
      });
    },
    * fetchMapping({ payload }, { call, put }) {
      const res = yield call(indice, payload);
      if (!res) return;
      const index = Object.keys(res.data.mappings)[0];
      const { properties } = res.data.mappings[index];
      const keys = Object.keys(properties).map(key => ({ field: key, type: properties[key].type }));
      yield put({
        type: 'saveMapping',
        payload: keys,
      });
    },
    * create({ payload }, { call, put }) {
      const res = yield call(addAlias, payload);
      if (!res) return;
      if (res.code === 0) {
        message.success('添加配置成功');
        yield put({ type: 'getAlias', payload: {} });
      } else message.warning(`添加配置失败,${res.error.msg}`);
    },
    * delete({ payload }, { call, put }) {
      const res = yield call(deleteAlias, payload);
      if (!res) return;
      if (res.code === 0) {
        message.success('删除配置成功');
        yield put({ type: 'getAlias', payload: {} });
      }
      else message.warning(`删除配置失败,${res.error.msg}`);
    },
    * getDetails({ payload }, { call, put }) {
      const res = yield call(getAliasDetails, payload);
      if (!res) return;
      const { data } = res;
      const schema = JSON.parse(data.schema);
      const newSchema = Object.keys(schema).map(key => ({
        field: key,
        alias: schema[key].alias ? schema[key].alias : '',
        type: schema[key].type,
      }));
      yield put({
        type: 'saveDetails',
        payload: { ...data, schema: newSchema },
      });
    },
    * update({ payload }, { call, put }) {
      const res = yield call(updateAlias, payload);
      if (!res) return;
      if (res.code === 0) {
        message.success('更新配置成功');
        yield put({ type: 'getAlias', payload: {} });
      } else message.warning(`添加配置失败,${res.error.msg}`);
    },

  },
  reducers: {
    saveMapping(state, { payload }) {
      return {
        ...state,
        dataSet: { ...state.dataSet, schema: payload },
      };
    },
    saveIndex(state, { payload }) {
      return {
        ...state,
        index: payload,
      };
    },
    saveAlias(state, { payload }) {
      console.log('saveAlias', payload);
      return {
        ...state,
        tableList: payload,
        loading: false,
      };
    },
    saveDetails(state, { payload }) {
      console.log(payload);
      return {
        ...state,
        dataSet: { ...state.dataSet, ...payload },
      };
    },
    reset(state, { payload }) {
      return {
        ...state,
        dataSet: {
          id: null,
          name: undefined,
          alias: '',
          schema: [],
        },
      };
    },
  },

};
