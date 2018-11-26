import {
  getFieldOption,
  schema,
  simpleSearch,
  advanceSearch,
} from '@/services/EsSearch/ses';

import router from 'umi/router';

import {
  message,
} from 'antd';

import {
  merge, isEmpty,
} from 'lodash';

/**
 * 多表查询配置model
 */
export default {
  namespace: 'generalSearch',

  state: {
    schema: { rows: [] },
    cardArr: [],
    selectOptions: {},
    total:-1,
    searchData:[],
  },

  effects: {
    * fetchRuleCost({ payload }, { call, put }) {
      const res = yield call(schema, payload);
      if (res && res.code === 0) {
        console.log(res);
        console.log(JSON.parse(res.data.schema));

        yield put({
          type: 'saveSchema',
          payload: { schema: JSON.parse(res.data.schema) },
        });

      }
    },
    * search({ payload }, { call, put }) {
      const { formData, alias } = payload;
      const res = yield call(simpleSearch, formData);

      if (res && res.code === 0) {
        yield put({
          type: 'saveSearch',
          payload: { res, alias, index: formData.index },
        });
      }
    },
    * getOption({ payload }, { call, put, select }) {

      const schemas = yield select(({generalSearch}) => generalSearch.schema);
      const row = schemas.rows.filter(item => item.index === payload.index);

      const indexArr = row[0]?row[0].advance.map(item => item.key):[];

      for (let i = 0; i < indexArr.length; i++) {
        const annex = { index: payload.index, field: indexArr[i] };
        const responseOption = yield call(getFieldOption, annex);
        yield put({
          type: 'saveFieldOption',
          payload: { annex, responseOption },
        });
      }
    },
    * fetchAdvanceSearchData({ payload }, { call, put }) {
      const response = yield call(advanceSearch, payload);

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

  },

  reducers: {

    saveSchema(state, { payload }) {
      return {
        ...state,
        schema: payload.schema,
      };
    },
    saveSearch(state, { payload }) {
      console.log('saveSearch', payload);
      const { cardArr } = state;
      const { res: { data, total }, alias, index } = payload;
      const item = { alias, data, total, index };
      cardArr.push(item);

      return {
        ...state,
        cardArr,
      };
    },
    saveFieldOption(state, { payload }) {
      const { annex, responseOption } = payload;
      return ({
        ...state,
        selectOptions: { ...state.selectOptions, [annex.field]: responseOption.data },
      });
    },
    saveAdvanceSearchData(state, { payload }) {
      console.log('saveAdvanceSearchData',payload)
      return ({
        ...state,
        searchData: payload.data,
        total: payload.total,
      });
    },
    reset(state, { payload: { field } }) {

      if (field === 'all') {
        return {
          schema: { rows: [] },
          cardArr: [],
        };
      }
      return {
        ...state,
        [field]: [],
      };
    },

  },
};
