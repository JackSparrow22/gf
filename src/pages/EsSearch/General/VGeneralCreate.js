import React, { PureComponent, Fragment } from 'react';
import router from 'umi/router';
import {
  Card,
  Button,
  Form,
  Icon,
  Col,
  Row,
  DatePicker,
  TimePicker,
  Input,
  Select,
  Popover
} from 'antd';
import { connect } from 'dva';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import CGeneralEditTableForm from './components/CGeneralEditTableForm';
import styles from './style.less';

@connect(({ general }) => ({
  ...general
}))
@Form.create({
  mapPropsToFields(props) {
    const { general: { rule, rows } } = props;
    return {
      rule: Form.createFormField({ value: rule }),
      rows: Form.createFormField({ value: rows })
    };
  },
  onFieldsChange(props, changedFields) {
    const keys = Object.keys(changedFields);
    const { name, value } = changedFields[keys[0]]
    let o = {}
    o[name] = value;
    props.dispatch({
      type: 'general/updateGeneralSchema',
      payload: { ...o }
    })
  },
})
export default class VGeneralCreate extends PureComponent {

  componentDidMount() {
    this.props.dispatch({ type: 'general/resetAll' })
  }

  componentWillUnmount() {
    this.props.dispatch({ type: 'general/resetAll' })
  }

  submit = (e) => {
    e.preventDefault();

    const { form: { validateFields }, dispatch } = this.props

    validateFields((err, values) => {
      if (err) {
        return;
      }
      dispatch({
        type: 'general/addSchema',
        payload: { name: values.rule, type: 2, schema: values, author: 'admin' }
      })
    })
  }

  handleGoBack = e => {
    e.preventDefault();
    router.goBack();
  };


  render() {
    const { form: { getFieldDecorator } } = this.props;
    return (
      <PageHeaderWrapper>
        <Card title="通用查询配置" className={styles.card} bordered={false} extra={<a href="#" onClick={this.handleGoBack}>返回</a>}>
          <Form style={{ marginTop: 8 }} layout="vertical">
            <Form.Item label="规则名称">
              {getFieldDecorator('rule', {
                rules: [
                  {
                    required: true,
                    message: `规则名称不能为空`,
                  },
                ],
              })(<Input placeholder="请输入规则名称" />)}
            </Form.Item>
            <Form.Item>
              {getFieldDecorator('rows')(<CGeneralEditTableForm />)}
            </Form.Item>
            <Form.Item style={{ marginTop: 32 }}>
              <Button type="primary" onClick={this.submit}>
                提交
              </Button>
              <Button style={{ marginLeft: 8 }}>
                重置
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </PageHeaderWrapper >
    );
  }
}
