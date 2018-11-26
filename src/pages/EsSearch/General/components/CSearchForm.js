import React, { Component } from 'react';
import { connect } from 'dva';
import {
  Row,
  Col,
  Card,
  Form,
  Input,
  Icon,
  Button,
  Checkbox,
} from 'antd';
import router from 'umi/router';
import styles from './style.less';

const FormItem = Form.Item;
const CheckboxGroup = Checkbox.Group;

const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 7 },
    md: { span: 6 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 17 },
    md: { span: 18 },
  },
};

const hit = <p style={{ color: '#aaaaaa', display: 'inline-block' }}>表限制</p>;

@Form.create()
@connect(({ generalSearch }) => ({
  generalSearch,
}))
class CSearchFrom extends Component {
  constructor(props) {
    super(props);
    this.state = {
      expandForm: false,
    };
  }

  handleSubmit = e => {
    const { form, handleSearch, generalSearch: { schema } } = this.props;
    e.preventDefault();
    form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        const options = schema.rows.map(item=> ({ alias: item.alias, value: item.index }));
        let formDate = {};
        Object.keys(values).forEach(key => {
          if (values[key] && values[key] !== '' && values[key] !== undefined)
            formDate = { ...formDate, [key]: values[key] };
        });
        handleSearch(formDate,options);
      }
    });
  };

  handleResetInput = e => {
    e.preventDefault();
    const { form, dispatch } = this.props;
    form.resetFields();
    this.setState({ expandForm: false });
    dispatch({
      type: 'singleNormal/resetData',
      payload: {},
    });

  };

  onChangeCheckboxGroup = (value) => {
    console.log(value);
  };

  toggleForm = () => {
    const { expandForm } = this.state;
    this.setState({
      expandForm: !expandForm,
    });
  };

  renderSimpleCheckboxGroup = (schema) => {

    const { form: { getFieldDecorator } } = this.props;
    const defaultOptions = schema.rows.map(item => item.index);
    const options = schema.rows.map((item, key) => ({ alias: item.alias, key, value: item.index }));
    const shortOptions = options.slice(0, 5);
    const tip = <a onClick={this.toggleForm} style={{ padding: '0 10px' }}>展开 <Icon type="down"/></a>;

    return (
      <FormItem style={{ margin: 0 }} {...formItemLayout} label={hit}>
        {getFieldDecorator('sourceIndex', {
          rules: [
            {
              required: true,
              message: '请选择一项',
            },
          ], initialValue: defaultOptions,
        })(
          <CheckboxGroup className={styles.checkboxGroup} onChange={this.onChangeCheckboxGroup}>
            {shortOptions.map(item =>
              (<Checkbox key={item.key}
                         style={{ display: 'inline-block', margin: '12px 8px 0 0' }}
                         value={item.value}>{item.alias}</Checkbox>),
            )}
          </CheckboxGroup>,
        )}
        {options.length > 4 ? tip : ''}

      </FormItem>
    );

  };

  renderAdvancedCheckboxGroup = (schema) => {
    const { form: { getFieldDecorator } } = this.props;
    const defaultOptions = schema.rows.map(item => item.index);
    const option = schema.rows.map((item, key) => ({ alias: item.alias, key, value: item.index }));

    return (
      <FormItem style={{ margin: 0 }} {...formItemLayout} label={hit}>
        {getFieldDecorator('sourceField', {
          rules: [
            {
              required: true,
              message: '请选择一项',
            },
          ], initialValue: defaultOptions,
        })(
          <CheckboxGroup className={styles.checkboxGroup} onChange={this.onChangeCheckboxGroup}>
            {option.map(item =>
              (<Checkbox key={item.key}
                         style={{ display: 'inline-block', margin: '12px 0 0 0' }}
                         value={item.value}>{item.alias}</Checkbox>),
            )}
          </CheckboxGroup>,
        )}
        <a onClick={this.toggleForm} style={{ padding: '0 10px' }}>收起 <Icon type="up"/></a>
      </FormItem>
    );
  };

  renderCheckboxGroup = (schema) => {
    const { expandForm } = this.state;
    return expandForm ? this.renderAdvancedCheckboxGroup(schema) : this.renderSimpleCheckboxGroup(schema);
  };

  goBack = () => {
    router.push('/essearch/general');
  };


  render() {
    const { form: { getFieldDecorator } } = this.props;
    const { generalSearch: { schema } } = this.props;

    return (

      <Card bordered={false}>
        <Form hideRequiredMark onSubmit={this.handleSubmit}>
          <FormItem
            {...formItemLayout}
            label="包括"
            style={{ margin: 0 }}
          >
            <Row>
              <Col span={10}>
                {getFieldDecorator('keyword', {
                  rules: [
                    {
                      required: true,
                      message: '此项为必填，请填写此项',
                    },
                  ], initialValue: '',
                })(
                  <Input
                    className={styles.inputStyle}
                    placeholder="多个关键词以空格分开"
                  />,
                )}
              </Col>
              <Col span={13}>
                <div style={{ display: 'inline-block' }}>
                  <p className={styles.normalFont}><span className={styles.dos}>*</span>必填</p>
                  <Button htmlType="submit" className={styles.buttonStyle} type="primary">
                    查询
                  </Button>
                  <Button onClick={this.handleResetInput} className={styles.buttonStyle}>重置</Button>
                </div>
              </Col>
              <Col span={1}>
                <a onClick={this.goBack}>返回</a>
              </Col>

            </Row>

          </FormItem>

          <FormItem {...formItemLayout} label='不包括' style={{ margin: '16px 0' }}>
            <Row>
              <Col span={10}>
                {getFieldDecorator('exclude', {
                  rules: [
                    {
                      required: false,
                      message: '',
                    },
                  ], initialValue: '',
                })(
                  <Input
                    className={styles.inputStyle}
                    placeholder="多个关键词以空格分开"
                  />,
                )}
              </Col>
              <Col span={14}>
                <p className={styles.normalFont}><span>*</span>选填</p>
              </Col>
            </Row>
          </FormItem>
          {schema.rows.length > 0 ? this.renderCheckboxGroup(schema) : ''}
        </Form>
      </Card>
    );
  }
}

export default CSearchFrom;
