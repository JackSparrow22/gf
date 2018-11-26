import {
  indices,
  indice,
  schemas,
  schema,
  getAlias,
  addSchema,
  updateSchema
} from '@/services/EsSearch/ses';

import router from 'umi/router';

import {
  message,
} from 'antd';

import {
  merge, isEmpty
} from 'lodash'

/**
 * 多表查询配置model
 */
export default {
  namespace: 'general',

  state: {
    //单表设置相关
    indices: [],//数据集
    singleSchemaList: [],//单表查询列表
    alias: '',//当前数据集别名
    mapping: [],//当前配置表单mapping
    visible: false,//是否打开抽屉
    schema: { //当前编辑的schema
      index: '',
      alias: '',
      normal: [],
      advance: [],
      result: []
    },
    copy: null,//当前用于复制的schema

    //多表设置规则名称
    general: {
      rule: '',//多表设置规则名称
      rows: [],//多表设置内容
    },
  },

  effects: {
    //请求多表配置详情
    * fetchSchema({ id }, { call, put }) {
      const res = yield call(schema, { id })
      if (res) {
        const { code, data } = res;
        if (code === 0) {
          const { schema } = data;
          yield put(
            {
              type: 'update',
              payload: {
                general: { ...JSON.parse(schema) }
              }
            }
          );

        }
      }
    },

    //请求数据集列表
    * fetchIndices(_, { call, put }) {
      const res = yield call(indices);
      if (res && res.code === 0) {
        yield put({
          type: 'update',
          payload: { indices: res.data }
        })
      }
    },

    //请求单表配置列表，用于copy
    * fetchSingleSchemaList({ index }, { call, put }) {
      const res = yield call(schemas, { type: 1, index })

      if (res) {
        const { code, data } = res;
        if (code === 0) {
          yield put({
            type: 'update',
            payload: { singleSchemaList: data, }
          })
        }
      }
    },

    //请求mapping
    * fetchMapping({ index }, { call, put }) {
      const indiceQuery = yield call(indice, { index })
      const aliasQuery = yield call(getAlias, { name: index })
      let aliasMapping;
      let indexAlias;
      if (aliasQuery) {
        const { code, data } = aliasQuery;

        if (code === 0) {
          if (!isEmpty(data)) {
            const { alias, schema } = data[0];
            aliasMapping = JSON.parse(schema);
            indexAlias = alias;
          }
        }
      }
      if (indiceQuery) {
        const { code, data: { mappings } } = indiceQuery;
        const index = Object.keys(mappings)[0];
        if (code === 0) {
          const mapping = [];
          for (let key in mappings[index]['properties']) {
            const type = mappings[index]['properties'][key]['type'];
            const alias = aliasMapping && aliasMapping[key] && aliasMapping[key]['alias'] ? aliasMapping[key]['alias'] : '';
            mapping.push({
              key,
              type,
              alias,
            });
          }
          yield put({
            type: 'update',
            payload: {
              mapping,
              alias: indexAlias
            }
          })
        }
      }
    },

    //请求可用于复制配置
    *copySchema({ id }, { call, put }) {
      if (id === -1) {
        yield put({
          type: 'update',
          payload: { copy: null }
        })
        return;
      }

      const res = yield call(schema, { id })
      if (res && res.code === 0) {
        const { data: { schema } } = res;
        if (schema)
          yield put({
            type: 'update',
            payload: { copy: JSON.parse(schema) }
          })
      }
    },

    //更新state.general
    * updateGeneralSchema({ payload }, { call, put, select }) {
      const general = yield select(state => state.general.general);
      yield put(
        {
          type: 'update',
          payload: {
            general: { ...general, ...payload }
          }
        }
      )
    },

    //提交新配置
    *addSchema({ payload }, { call, put }) {
      const res = yield call(addSchema, payload);
      if (!res) return;

      const { code } = res;
      if (code === 0) {
        //弹出对话框
        message.success('创建成功');
        //刷新界面
        yield put({
          type: 'resetAll'
        })
        router.goBack()
      }
      else
        message.error(`创建失败${res.error.msg}`);
    },

    //提交修改配置
    * updateSchema({ payload }, { call, put }) {
      const res = yield call(updateSchema, payload);
      if (!res || res.code !== 0) {
        message.error('更新失败');
        return;
      }
      const { code } = res;
      if (code === 0) {
        //弹出对话框
        message.success('更新成功');
        //刷新界面
        yield put({
          type: 'resetAll'
        })
        router.goBack()
      }
    },

    //创建或编辑一个单表查询
    * showDrawer({ payload }, { call, put }) {
      const { visible, editRow } = payload;
      yield put({
        type: 'update',
        payload: {
          visible,
          schema: editRow ? editRow : {
            index: '',
            alias: '',
            normal: [],
            advance: [],
            result: []
          }
        }
      })
      if (visible && editRow) {
        const { index } = editRow
        //请求可用于复制的单表配置列表
        yield put({
          type: 'fetchSingleSchemaList',
          index,
        })
        //请求该单表的mapping
        yield put({
          type: 'fetchMapping',
          index
        })
      }
    },

    //保存一个单表配置
    * saveEditRow({ payload }, { call, put, select }) {
      const general = yield select(state => state.general.general);
      const { rule, rows } = general;
      const { schema } = payload;
      Object.assign(schema, { key: schema.index })
      const theSame = rows.filter((item) => { return item.index === schema.index })
      if (theSame.length) {
        rows.forEach((item, i) => {
          if (item.index === schema.index) {
            rows[i] = schema
          }
        })
      } else {
        rows.push(schema);
      }
      //更新单表配置
      yield put({
        type: 'showDrawer',
        payload: { visible: false, general }
      })
      //重置单表reducer
      yield put({
        type: 'resetSingleSetting'
      })
    }
  },

  reducers: {
    //更新状态
    update(state, { payload }) {
      return {
        ...state,
        ...payload
      };
    },

    //重置与单表配置有关的状态
    resetSingleSetting(state, _) {
      return {
        ...state,
        //单表设置相关
        alias: '',//当前数据集别名
        mapping: [],//当前配置表单mapping
        visible: false,//是否打开抽屉
        schema: { //当前编辑的schema
          index: '',
          alias: '',
          normal: [],
          advance: [],
          result: []
        },
        copy: null,//当前用于复制的schema
      }
    },

    //重置所有状态
    resetAll(state, _) {
      return {
        ...state,
        //单表设置相关
        indices: [],//数据集
        singleSchemaList: [],//单表查询列表
        alias: '',//当前数据集别名
        mapping: [],//当前配置表单mapping
        visible: false,//是否打开抽屉
        schema: { //当前编辑的schema
          index: '',
          alias: '',
          normal: [],
          advance: [],
          result: []
        },
        copy: null,//当前用于复制的schema

        //多表设置规则名称
        general: {
          rule: '',//多表设置规则名称
          rows: [],//多表设置内容
        }
      }
    }
  }
};
