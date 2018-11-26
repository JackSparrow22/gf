import {
  simpleSearch, schema, getFieldOption, advanceSearch,
} from '@/services/EsSearch/ses';
import { message } from 'antd';


export default {
  namespace: 'sceneAdvance',
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
    selectOptions: {},
  },
  effects: {
    * fetchAdvanceSearchData({ payload }, { call, put }) {
      const response = yield call(advanceSearch, payload);
      console.log('fetchAdvanceSearchData', response);

      if (response === undefined) return;
      const { code } = response;

      if (code === 0) {
        yield put({
          type: 'saveAdvanceSearchData',
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

        const schemaData = JSON.parse(data.schema);
        const { advance } = schemaData;
        const arr = [];

        console.log('schemaData',schemaData);

        Object.keys(advance).forEach(key => {
          arr.push(advance[key].key);
        });

        for (let i = 0; i < arr.length; i++) {
          const annex = { index: data.index, field: arr[i] };
          const responseOption = yield call(getFieldOption, annex);
          yield put({
            type: 'saveFieldOption',
            payload: { annex, responseOption },
          });
        }

      } else {
        message.warning(response.error.msg);
      }
    },

  },
  reducers: {
    saveAdvanceSearchData(state, { payload }) {
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

    saveFieldOption(state, { payload }) {
      const { annex, responseOption } = payload;
      return ({
        ...state,
        selectOptions: { ...state.selectOptions, [annex.field]: responseOption.data },
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
        selectOptions: {},
      });
    },
  },
};
