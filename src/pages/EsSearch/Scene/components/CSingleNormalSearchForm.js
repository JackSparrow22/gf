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
import styles from './CSingleNormalSearchForm.less';

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

const hit = <p style={{ color: '#aaaaaa', display: 'inline-block' }}>字段限制</p>;

@Form.create()
@connect(({ singleNormal }) => ({
  singleNormal,
}))
class CSingleNormalSearchForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      expandForm: false,
    };
  }

  handleSubmit = e => {
    const { form, handleSubmitSearch } = this.props;
    e.preventDefault();
    form.validateFieldsAndScroll((err, values) => {
      if (!err) {

        let formDate = values;

        if (values.exclude === '') {
          const { exclude, ...other } = values;
          formDate = other;
        }

        handleSubmitSearch(formDate);
      }
    });
  };


  handleResetInput = e => {
    e.preventDefault();
    const { form, dispatch} = this.props;
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

  getEffectiveNormalValue = (normal) => {
    const options = [];
    Object.keys(normal).forEach((key) => {
      options.push({ label: normal[key].alias !== "" ? normal[key].alias : normal[key].key, value: normal[key].key });
    });
    return options;
  };


  renderSimpleCheckboxGroup = (normal) => {

    const { form: { getFieldDecorator } } = this.props;

    const options = this.getEffectiveNormalValue(normal);
    const defaultChecked = options.map(item => item.value);
    const shortOptions = options.slice(0, 5);
    const tip = <a onClick={this.toggleForm} style={{ padding: '0 10px' }}>展开 <Icon type="down"/></a>;

    return (
      <FormItem style={{ margin: 0 }} {...formItemLayout} label={hit}>
        {getFieldDecorator('sourceField', {
          rules: [
            {
              required: true,
              message: '请选择一项',
            },
          ], initialValue: defaultChecked,
        })(
          <CheckboxGroup className={styles.checkboxGroup} onChange={this.onChangeCheckboxGroup}>
            {shortOptions.map(item =>
              (<Checkbox key={item.value}
                         style={{ display: 'inline-block', margin: '12px 8px 0 0', }}
                         value={item.value}>{item.label}</Checkbox>),
            )}
          </CheckboxGroup>,
        )}
        {options.length > 4 ? tip : ''}

      </FormItem>
    );

  };

  renderAdvancedCheckboxGroup = (normal) => {

    const options = this.getEffectiveNormalValue(normal);
    const defaultChecked = options.map(item => item.value);
    const { form: { getFieldDecorator } } = this.props;

    return (
      <FormItem style={{ margin: 0 }} {...formItemLayout} label={hit}>
        {getFieldDecorator('sourceField', {
          rules: [
            {
              required: true,
              message: '请选择一项',
            },
          ], initialValue: defaultChecked,
        })(
          <CheckboxGroup className={styles.checkboxGroup} onChange={this.onChangeCheckboxGroup}>
            {options.map(item =>
              (<Checkbox key={item.value}
                         style={{ display: 'inline-block', margin: '12px 0 0 0',  }}
                         value={item.value}>{item.label}</Checkbox>),
            )}
          </CheckboxGroup>,
        )}
        <a onClick={this.toggleForm} style={{ padding: '0 10px' }}>收起 <Icon type="up"/></a>
      </FormItem>
    );
  };

  renderCheckboxGroup = (level) => {
    const { expandForm } = this.state;
    return expandForm ? this.renderAdvancedCheckboxGroup(level) : this.renderSimpleCheckboxGroup(level);
  };

  goBack = () =>{
    router.push("/essearch/single");
  };

  goAdvance = () =>{
    const {id} = this.props;
    router.push(`/essearch/single/search/advance/${id}`);
  };

  render() {

    const { form: { getFieldDecorator }, level } = this.props;
    return (

      <Card bordered={false}>
        <Form hideRequiredMark onSubmit={this.handleSubmit}>
          <FormItem
            {...formItemLayout}
            label="包括"
            style={{ margin: 0 }}
          >
            <Row>
              <Col span={9}>
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
              <Col span={12}>
                <div style={{ display: 'inline-block' }}>
                  <p className={styles.normalFont}><span className={styles.dos}>*</span>必填</p>
                  <Button htmlType="submit" className={styles.buttonStyle} type="primary">
                    查询
                  </Button>
                  <Button onClick={this.handleResetInput} className={styles.buttonStyle}>重置</Button>
                </div>
              </Col>
              <Col span={2}>
                <a onClick={this.goAdvance}>高级查询</a>
              </Col>
              <Col span={1}>
                <a onClick={this.goBack}>返回</a>
              </Col>

            </Row>

          </FormItem>

          <FormItem {...formItemLayout} label='不包括' style={{ margin: "16px 0" }}>
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
          {Object.keys(level).length > 0 ? this.renderCheckboxGroup(level) : ''}
        </Form>
      </Card>
    );
  }
}

export default CSingleNormalSearchForm;
