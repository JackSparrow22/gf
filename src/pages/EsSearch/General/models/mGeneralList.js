import {
  schemas
} from '@/services/EsSearch/ses';

/**
 * 多表查询配置列表model
 */
export default {
  namespace: 'generalList',

  state: {
    //多表配置列表内容
    total: 0,
    list: [],
  },

  effects: {
    //获取多表查询列表
    * fetchList({ payload }, { call, put }) {
      const { offset, limit } = payload;
      const response = yield call(schemas, { offset: offset ? offset : 0, limit: limit ? limit : 10, type: 2 });
      const { data, total } = response
      yield put({
        type: 'update',
        payload: { list: data }
      })
    },
  },

  reducers: {
    update(state, { payload }) {
      return {
        ...state,
        ...payload
      };
    }
  }
};
