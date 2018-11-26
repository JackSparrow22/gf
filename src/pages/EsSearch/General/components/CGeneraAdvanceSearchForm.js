import React, { Component } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import {
  Row,
  Col,
  Card,
  Form,
  Input,
  Select,
  Icon,
  Button,
  Dropdown,
  Menu,
  InputNumber,
  DatePicker,
  Modal,
  message,
  Badge,
  Divider,
  Steps,
  Radio,
  Table,
  Checkbox,
} from 'antd';
import 'moment/locale/zh-cn';
import styles from '../SchemaList.less';
import router from 'umi/router';

moment.locale('zh-cn');
const FormItem = Form.Item;
const SelectOption = Select.Option;
const { RangePicker } = DatePicker;
const offset = 0;
const limit = 0;


@Form.create()
@connect(({ singleAdvance }) => ({
  singleAdvance,
}))

class CGeneraAdvanceSearchForm extends Component {

  state = {
    expandForm: false,
  };

  componentDidMount() {

  }

  componentWillUnmount() {
    const { dispatch } = this.props;
    // dispatch({
    //   type: 'singleAdvance/resetState',
    //   payload: {},
    // });
  }


  handleResetForm = (e) => {
    e.preventDefault();
    const { form, dispatch } = this.props;
    form.resetFields();
    dispatch({
      type: 'singleAdvance/resetData',
      payload: {},
    });
  };

  handleSubmit = (e) => {
    e.preventDefault();

    const { form: { validateFields } } = this.props;
    const { handleSubmitSearch } = this.props;

    validateFields((err, values) => {
      if (!err) {
        handleSubmitSearch(values);
      }
    });

  };


  SelectItem = (field, key, mode = null) => {
    const { exclude, include } = field;
    const { selectOptions } = this.props;
    const placeholder = mode ? '请选择，支持多选' : '请选择';
    let optionalValue = selectOptions[key] ? selectOptions[key] : [];

    if(exclude)
      optionalValue = optionalValue.concat(exclude === undefined ? [] : exclude).filter((v, i, arr) => arr.indexOf(v) === arr.lastIndexOf(v));

    if(include)
      optionalValue = include;

    if (mode === null) {
      return (
        <Select
          showSearch
          name={key}
          allowClear
          mode={mode}
          placeholder={placeholder}
          filterOption={(input, option) => option.props.children.indexOf(input) >= 0}
          optionFilterProp="children"
        >
          {optionalValue.map(item => <SelectOption key={item} value={item}>{item}</SelectOption>)}
        </Select>
      );
    }

    return (
      <Select name={key} allowClear mode={mode} placeholder={placeholder}>
        {optionalValue.map(item => <SelectOption key={item} value={item}>{item}</SelectOption>)}
      </Select>
    );
  };


  disabledDate = (crr,props) =>{

    const newstr = props.startData.replace('-','/');
    const start = new Date(newstr).getTime();

    const newstr2 = props.endData.replace('-','/');
    const end = new Date(newstr2).getTime();

    return crr.valueOf()<start||crr.valueOf()>end;

  };

  RangePickerOption= (props) =>{
    return(
      <RangePicker disabledDate={(e)=>this.disabledDate(e,props)} format="YYYY-MM-DD 00:00:00" allowClear/>
    );
  };

  toggleForm = () => {
    const { expandForm } = this.state;
    this.setState({
      expandForm: !expandForm,
    });
  };


  goBack = () => {
    // router.back()
    history.go(-1);
  };

  renderSimpleForm(advance) {
    const newdata = [];
    if (advance.length >= 2)
      newdata.push(advance[0], advance[1]);
    else if (advance.length === 1)
      newdata.push(advance[0]);

    const { form: { getFieldDecorator } } = this.props;
    return (
      <Form onSubmit={this.handleSubmit} layout="inline">
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          {newdata.map(item => {
            if (item.componentType === 'input') {
              return (
                <Col md={8} sm={24} key={item.key}>
                  <FormItem label={item.alias === '' ? item.key : item.alias}>
                    {getFieldDecorator(JSON.stringify({
                      key: item.key,
                      componentType: item.componentType,
                    }))(<Input placeholder="请输入"/>)}
                  </FormItem>
                </Col>
              );
            }

            if (item.componentType === 'select') {
              return (
                <Col md={8} sm={24} key={item.key}>
                  <FormItem label={item.alias === '' ? item.key : item.alias}>
                    {getFieldDecorator(JSON.stringify({
                      key: item.key,
                      componentType: item.componentType,
                    }))(
                      this.SelectItem(item, item.key),
                    )}
                  </FormItem>
                </Col>
              );
            }

            if (item.componentType === 'datePicker') {
              return (
                <Col md={8} sm={24} key={item.key}>
                  <FormItem label={item.alias === '' ? item.key : item.alias}>
                    {getFieldDecorator(JSON.stringify({
                      key: item.key,
                      componentType: item.componentType,
                    }))(
                      this.RangePickerOption(item),
                    )}
                  </FormItem>
                </Col>
              );
            }

            if (item.componentType === 'multipleSelect') {
              return (
                <Col md={8} sm={24} key={item.key}>
                  <FormItem label={item.alias === '' ? item.key : item.alias}>
                    {getFieldDecorator(JSON.stringify({
                      key: item.key,
                      componentType: item.componentType,
                    }))(
                      this.SelectItem(item, item.key, 'multiple'),
                    )}
                  </FormItem>
                </Col>
              );
            }
            return '';
          })}

          <Col md={8} sm={24}>
            <Button type="primary" htmlType="submit">
              查询
            </Button>
            <Button style={{ marginLeft: 8 }} onClick={this.handleResetForm}>
              重置
            </Button>
            <a style={{ marginLeft: 18 }} onClick={this.toggleForm}>
              展开 <Icon type="down"/>
            </a>

            <a style={{ marginLeft: 18 }} onClick={this.goBack}>
              返回
            </a>

          </Col>

        </Row>

      </Form>
    );

  }

  renderAdvancedForm(advance) {
    const { form: { getFieldDecorator } } = this.props;
    return (
      <Form onSubmit={this.handleSubmit} layout="inline">
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          {advance.map(item => {
            if (item.componentType === 'input') {
              return (
                <Col md={8} sm={24} key={item.key}>
                  <FormItem label={item.alias === '' ? item.key : item.alias}>
                    {getFieldDecorator(JSON.stringify({
                      key: item.key,
                      componentType: item.componentType,
                    }))(<Input placeholder="请输入"/>)}
                  </FormItem>
                </Col>
              );
            }

            if (item.componentType === 'select') {
              return (
                <Col md={8} sm={24} key={item.key}>
                  <FormItem label={item.alias === '' ? item.key : item.alias}>
                    {getFieldDecorator(JSON.stringify({
                      key: item.key,
                      componentType: item.componentType,
                    }))(
                      this.SelectItem(item, item.key),
                    )}
                  </FormItem>
                </Col>
              );
            }

            if (item.componentType === 'datePicker') {
              return (
                <Col md={8} sm={24} key={item.key}>
                  <FormItem label={item.alias === '' ? item.key : item.alias}>
                    {getFieldDecorator(JSON.stringify({
                      key: item.key,
                      componentType: item.componentType,
                    }))(
                      this.RangePickerOption(item),
                    )}
                  </FormItem>
                </Col>
              );
            }

            if (item.componentType === 'multipleSelect') {
              return (
                <Col md={8} sm={24} key={item.key}>
                  <FormItem label={item.alias === '' ? item.key : item.alias}>
                    {getFieldDecorator(JSON.stringify({
                      key: item.key,
                      componentType: item.componentType,
                    }))(
                      this.SelectItem(item, item.key, 'multiple'),
                    )}
                  </FormItem>
                </Col>
              );
            }
            return null;
          })}

        </Row>

        <div style={{ overflow: 'hidden' }}>
          <div style={{ float: 'right', marginBottom: 24 }}>
            <Button type="primary" htmlType="submit">
              查询
            </Button>
            <Button style={{ marginLeft: 8 }} onClick={this.handleResetForm}>
              重置
            </Button>
            <a style={{ marginLeft: 18 }} onClick={this.toggleForm}>
              收起 <Icon type="up"/>
            </a>

            <a style={{ marginLeft: 18 }} onClick={this.goBack}>
              返回
            </a>
          </div>
        </div>
      </Form>
    );
  }

  renderForm = (advance) => {
    const { expandForm } = this.state;
    return expandForm ? this.renderAdvancedForm(advance) : this.renderSimpleForm(advance);
  };


  render() {
    const { form: { getFieldDecorator }, advance } = this.props;
    if (advance.length <= 0) {
      return <Card>缺少查询条件</Card>;
    }
    return (
      <Card bordered={false} style={{ margin: 0, padding: 0 }}>
        <div className={styles.tableListForm}>{this.renderForm(advance)}</div>
      </Card>
    );
  }
}

export default CGeneraAdvanceSearchForm;
