import {
  schemas, addSchema, updateSchema, deleteSchema, schema, indices,
} from '@/services/EsSearch/ses';

import {
  message,
} from 'antd';

const defaultSize = 10;

/**
 * 模板配置列表
 */
export default {
  namespace: 'scene',

  state: {
    options: {},
    total: 0,
    list: [],
    visible: false,
    editRow: {},//包括了id,name,schema,author
    editType: 'create',
    copy: {},
    indexs: [],//所有数据集
  },

  effects: {
    * getIndices({ payload }, { call, put }) {
      const response = yield call(indices);
      if (!response) return;
      yield put({
        type: 'saveIndices',
        payload: response.data,
      });
    },
    * fetch({ payload }, { call, put }) {
      const res = yield call(schemas, { ...payload });
      if (!res) return;
      const { data, total } = res;
      yield put({
        type: 'save',
        payload: { data, total, options: { ...payload } },
      });
    },

    * create({ payload }, { call, put, select }) {
      const res = yield call(addSchema, payload);
      if (!res) return;

      const { code } = res;
      if (code === 0) {
        //弹出对话框
        message.success('创建成功');
        //刷新界面
        const options = yield select(({scene}) => scene.options);
        yield put({
          type: 'show',
          payload: { visible: false },
        });
        yield put({
          type: 'fetch',
          payload: options,
        });
      } else message.error(`创建失败${res.error.msg}`);
    },

    * update({ payload }, { call, put, select }) {
      const res = yield call(updateSchema, payload);
      if (!res) {
        message.error('更新失败');
        return;
      }
      const { code } = res;
      if (code === 0) {
        //弹出对话框
        message.success('更新成功');
        //刷新界面
        const options = yield select(({scene}) => scene.options);
        yield put({
          type: 'show',
          payload: { visible: false },
        });
        yield put({
          type: 'fetch',
          payload: options,
        });
      }
    },

    * remove({ payload }, { call, put, select }) {
      const { id } = payload;
      const res = yield call(deleteSchema, { id });
      if (res && res.code === 0) {
        //弹出对话框
        message.success('删除成功');
        //刷新界面
        const options = yield select(({scene}) => scene.options);
        yield put({
          type: 'fetch',
          payload: options,
        });
      }
    },

    * edit({ payload }, { call, put }) {
      const { id } = payload;
      if (!id) return;
      const res = yield call(schema, { id });
      if (res && res.code === 0) {
        yield put({
          type: 'show',
          payload: {
            visible: true,
            editRow: res.data,
            editType: 'edit',
          },
        });
      }
    },

  },

  reducers: {
    save(state, { payload }) {
      const { data, total, options } = payload;
      return {
        ...state,
        list: data,
        total,
        options,
      };
    },

    show(state, { payload }) {
      const { visible, editRow, editType } = payload;
      return {
        ...state,
        visible,
        editType,
        editRow: editRow ? editRow : {},
        copy: {},
      };
    },

    saveIndices(state, { payload }) {
      return {
        ...state,
        indexs: payload,
      };
    },

  },
};
