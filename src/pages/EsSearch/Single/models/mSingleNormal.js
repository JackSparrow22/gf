import {
  simpleSearch, schema,
} from '@/services/EsSearch/ses';

import { message } from 'antd'


export default {
  namespace: 'singleNormal',
  state: {
    data: [],
    schema: {
      rule: '',//配置名称
      index: '',//索引名称
      alias: '',//索引别名
      mapping: {},//索引内容
      normal: {},//普通查询条件
      advance: {},//高级查询条件
      result: {},//查询结果展示字段
    },
    total: -1,
  },
  effects: {
    * fetchNormalSearchData({ payload }, { call, put }) {
      const response = yield call(simpleSearch, payload);
      console.log('fetchNormalSearchData response', payload, response);

      if (response === undefined) return;
      const { code } = response;

      if (code === 0) {
        yield put({
          type: 'saveNormalSearchData',
          payload: response,
        });
      } else {
        message.warning(response.error.msg);
      }

    },

    * fetchSchema({ payload }, { call, put }) {
      const { id } = payload;
      const response = yield call(schema, { id });
      console.log(`fetchSchema response`, response);
      if (!response) return;
      const { code, data } = response;
      if (code === 0) {
        yield put({
          type: 'saveSchema',
          payload: {
            data,
          },
        });
      } else {
        message.warning(response.error.msg);
      }
    },

  },
  reducers: {
    saveNormalSearchData(state, { payload }) {
      return ({
        ...state,
        data: payload.data,
        total: payload.total,
      });
    },
    saveSchema(state, { payload }) {
      const schemaData = JSON.parse(payload.data.schema);
      return ({
        ...state,
        schema: { ...schemaData },
      });
    },
    resetData(state, { payload }){
      return({
          ...state,
          data:[],
          total: -1,
        }
      )
    },
    resetState(state, { payload }) {
      return ({
        ...state,
        data: [],
        schema: {
          rule: '',
          index: '',
          alias: '',
          mapping: {},
          normal: {},
          advance: {},
          result: {},
        },
        total: -1,
      })
    }
  },
};
