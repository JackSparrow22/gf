import React, { PureComponent, Fragment } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';

import {
  Form,
  Select,
  Input,
  Button,
  message,
} from 'antd';
import CSingleSimpleEditForm from './CSingleSimpleEditForm';
import CSingleAdvanceEditForm from './CSingleAdvanceEditForm';
import {isEmpty} from 'lodash';

import {
  schemas, schema, indices, indice, getAlias,
} from '@/services/EsSearch/ses';

/**
 * 单表查询配置弹出框
 * 表单内数据由外部传入
 * @param {*} param0
 */
@Form.create()
class CSingleEditForm extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      indiceList: [],//数据集列表
      singleSchemaList: [],//单表配置列表
      mapping: [],//当前数据集mapping
    };
  }

  componentDidMount() {
    const { data: { index } } = this.props;
    const it = this;
    //延迟请求
    setTimeout(async () => {
      //查询所有单表配置
      const schemasQuery = await schemas({ type: 1, index });
      if (schemasQuery) {
        const { code, data } = schemasQuery;
        if (code === 0) {
          it.setState({
            singleSchemaList: data,
          });
        }
      }

      //查询mapping
      const indiceQuery = await indice({ index });
      const aliasQuery = await getAlias({ name: index });

      let aliasMapping;
      if (aliasQuery) {
        const { code, data } = aliasQuery;
        if (code === 0) {
          if (!isEmpty(data)) {
            const { alias, schema } = data[0];
            aliasMapping = JSON.parse(schema);
            it.setState({
              alias,
            });
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
            const alias = aliasMapping ? aliasMapping[key]['alias'] : '';
            mapping.push({
              key,
              type,
              alias,
            });
          }
          it.setState({
            mapping,
          });
        }
      }
    }, 200);
  }

  onSubmit = (e) => {
    e.preventDefault();
    const { form: { validateFields }, onChange } = this.props;
    validateFields((err, values) => {
      if (!err) {
        const { index, alias, normal, advance, result } = values;
        if (!index || !normal || !advance || !result) {
          message.error('表单填写不完成，无法提交');
          return;
        }
        onChange(values);
      }
    });
  };

  /**
   * 响应是否copy模板配置内容
   */
  copy = async (value) => {
    const result = await schema({ id: parseInt(value) });
    if (!result) return;
    const { code, data } = result;
    if (code === 0) {
      this.props.onCopy(data);
    }
  };

  render() {
    const { data, copy, form: { getFieldDecorator } } = this.props;
    const { indiceList, singleSchemaList, mapping } = this.state;
    const finalData = copy && !isEmpty(copy) ? copy : data;
    const { rule, index, alias, normal, advance, result } = finalData;
    console.log(data)
    console.log(copy)

    const editFormOpts = {
      index, mapping,
    };

    return (
      <Form layout="horizontal" onSubmit={this.onSubmit} style={{ paddingBottom: '24px' }}>
        <Form.Item label="配置名称">
          {getFieldDecorator(`rule`, {
            initialValue: data.rule,
          })(<Input/>)}
        </Form.Item>
        <Form.Item label="数据集">
          {getFieldDecorator(`index`, {
            initialValue: data.index,
          })(<Input disabled/>)}
        </Form.Item>
        <Form.Item label="是否调用配置模板">
          <Select defaultValue="-1" onSelect={this.copy} disabled={!singleSchemaList.length}>
            <Select.Option value="-1">
              {!singleSchemaList.length ? '无可用模板' : '不使用模板'}
            </Select.Option>
            {
              singleSchemaList
                .filter(d => {
                  return d.name !== data.rule;
                })
                .map(item => (
                  <Select.Option key={item.id} value={item.id}>
                    {item.name}
                  </Select.Option>
                ))
            }
          </Select>
        </Form.Item>
        <Form.Item label="别名">
          {getFieldDecorator(`alias`, {
            initialValue: alias,
          })(
            <Input/>,
          )}
        </Form.Item>

        <Form.Item label="普通查询字段配置">
          {getFieldDecorator(`normal`, {
            initialValue: normal,
          })(
            <CSingleSimpleEditForm {...editFormOpts} />,
          )}
        </Form.Item>

        <Form.Item label="高级查询字段配置">
          {getFieldDecorator(`advance`, {
            initialValue: advance,
          })(
            <CSingleAdvanceEditForm {...editFormOpts} />,
          )}
        </Form.Item>

        <Form.Item label="结果字段配置">
          {getFieldDecorator(`result`, {
            initialValue: result,
          })(
            <CSingleSimpleEditForm {...editFormOpts} />,
          )}
        </Form.Item>

        <Form.Item
          style={{
            position: 'absolute',
            bottom: '-24px',
            width: '100%',
            borderTop: '1px solid #e8e8e8',
            padding: '10px 16px',
            textAlign: 'right',
            left: 0,
            background: '#fff',
            borderRadius: '0 0 4px 4px',
          }}
        >
          <Button
            style={{
              marginRight: 8,
            }}
            type="primary"
            htmlType="submit"
          >
            提交
          </Button>
        </Form.Item>
      </Form>
    );
  }
}

export default CSingleEditForm;
