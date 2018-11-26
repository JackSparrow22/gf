import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import {
  Drawer,
  Form,
  Select,
  Input,
  Button,
  message,
} from 'antd';
import CSingleSimpleEditForm from './CSingleSimpleEditForm'
import CSingleAdvanceEditForm from './CSingleAdvanceEditForm'

/**
 * 外部通过redux与本组件交互
 */
@connect(({ general }) => ({
  ...general
}))
@Form.create()
class CSingleEditDrawer extends PureComponent {
  /**
   * 提交表单
   */
  submit = (e) => {
    e.preventDefault();
    const { form: { validateFields }, dispatch } = this.props;
    validateFields((err, values) => {
      if (!err) {
        const { index, alias, normal, advance, result } = values;
        if (!index || !normal || !advance || !result) {
          message.error('表单填写不完成，无法提交');
          return;
        }

        dispatch({
          type: 'general/saveEditRow',
          payload: { schema: values }
        })
      }
    });
  };

  /**
   * 复制表单
   */
  copy = (value) => {
    this.props.dispatch({
      type: 'general/copySchema',
      id: parseInt(value)
    })
  };

  /**
   * 收起抽屉
   */
  close = () => {
    this.props.dispatch({
      type: 'general/showDrawer',
      payload: { visible: false }
    })
  }

  render() {
    const { visible, schema, copy, form: { getFieldDecorator }, alias, indices, singleSchemaList, mapping } = this.props;
    const finalData = copy ? copy : schema;
    const { index, normal, advance, result } = finalData;

    const editFormOpts = {
      index, mapping,
    };

    return (
      <Drawer
        destroyOnClose
        title={`${index}表查询配置`}
        width={document.body.clientWidth < 1024 ? document.body.clientWidth : '61.8%'}
        bodyStyle={{ padding: '32px 40px 48px' }}
        visible={visible}
        maskClosable={false}
        onClose={this.close}
      >
        <Form layout="horizontal" onSubmit={this.submit} style={{ paddingBottom: '24px' }}>
          <Form.Item label="数据集">
            {getFieldDecorator(`index`, {
              initialValue: index,
            })(<Input disabled />)}
          </Form.Item>
          <Form.Item label="是否调用配置模板">
            <Select defaultValue="-1" onSelect={this.copy} disabled={!singleSchemaList.length}>
              <Select.Option value="-1">
                {!singleSchemaList.length ? '无可用模板' : '不使用模板'}
              </Select.Option>
              {
                singleSchemaList.map(item => (
                  <Select.Option key={item.id} value={item.id}>
                    {item.name}
                  </Select.Option>
                ))
              }
            </Select>
          </Form.Item>

          <Form.Item label="别名">
            {getFieldDecorator(`alias`, {
              initialValue: finalData.alias ? finalData.alias : alias,
            })(
              <Input />,
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
      </Drawer>
    )
  }
}
export default CSingleEditDrawer
