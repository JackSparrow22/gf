import request from '@/utils/request';
import {
  host
} from '@/defaultSettings'

/**
 * 请求数据集列表
 */
export async function indices() {
  return request(`${host}/indices`);
}

/**
 * 请求数据集详情
 * @param {*} index 
 */
export async function indice({ index }) {
  return request(`${host}/indices/${index}`);
}

/**
 * 查看字段的唯一值,最大200条
 * @param {*} index 
 * @param {*} field 
 * @param {*} size 
 */
export async function uniqueValInField({ index, field, size }) {
  return request(`${host}/indices/field?query=${JSON.stringify({ index, field, size: size ? size : 200 })}`);
}

/**
 * 查询配置列表
 * @param {*} param0 
 */

export async function schemas(payload) {
  return request(`${host}/rules?query=${JSON.stringify({...payload })}`)
}

/**
 * 查询配置规则详情
 * @param {*} param0 
 */
export async function schema({ id }) {
  return request(`${host}/rules/${id}`)
}
/**
 * 新增查询配置
 * @param {*} param0 
 */
export async function addSchema({ name, index, type, schema, author }) {
  return request(`${host}/rules`, {
    method: 'POST',
    body: { name, index, type, schema, author }
  })
}

/**
 * 更新查询配置
 * @param {*} param0 
 */
export async function updateSchema({ id, name, schema, author }) {
  return request(`${host}/rules/${id}`, {
    method: 'PUT',
    body: { name, schema, author }
  })
}

/**
 * 删除配置
 */
export async function deleteSchema({ id }) {
  return request(`${host}/rules/${id}`, {
    method: 'DELETE'
  })
}


/**
 * 单表普通查询
 */
export async function simpleSearch(param) {
  return request(`${host}/es/search/normal?query=${JSON.stringify({ ...param })}`)
}


/**
 * 查看字段的唯一值
 */
export async function getFieldOption(param) {
  return request(`${host}/indices/field?query=${JSON.stringify({ ...param })}`)
}

/**
 * 单表高级查询
 */
export async function advanceSearch(param) {
  return request(`${host}/es/search/advance?query=${JSON.stringify({ ...param })}`)
}

/**
 * 添加别名配置
 * @param param
 * @returns {Promise<void>}
 */
export async function addAlias(param) {
  return request(`${host}/mapping`, {
    method: 'POST',
    body: { ...param }
  })
}

/**
 * 获取别名数据集
 * @param param
 * @returns {Promise<void>}
 */
export async function getAlias(param) {
  return request(`${host}/mapping?query=${JSON.stringify({ ...param })}`)
}

/**
 * 删除别名数据集
 * @param id
 * @returns {Promise<void>}
 */
export async function deleteAlias(id) {
  return request(`${host}/mapping/${id}`, {
    method: 'DELETE'
  })
}

/***
 * 获取别名数据集详情
 * @param id
 * @returns {Promise<void>}
 */
export async function getAliasDetails(id) {
  return request(`${host}/mapping/${id}`,{
    method: 'GET'
  })
}

export async function updateAlias({ id, ...other}) {
  return request(`${host}/mapping/${id}`, {
    method: 'PUT',
    body: { ...other }
  })
}


