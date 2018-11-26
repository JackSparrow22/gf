import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import router from 'umi/router';
import {
  Card,
  Form,
  Button,
  Table,
  Divider,
  Popconfirm,
  Drawer,
  Row,
  Col,
  Input,
  Select,
  DatePicker,
  Icon,
} from 'antd';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import styles from './SchemaList.less';
import CSingleEditDrawer from './components/CSingleEditDrawer';

const { RangePicker } = DatePicker;
const FormItem = Form.Item;
const schemaType = 3;
const offset = 0;
const limit = 10;
const pageSizeOptions = ['10', '30', '50', '70', '100'];

@connect(({ scene, loading }) => ({
  ...scene,
  loading: loading.models.rule,
}))
@Form.create()
export default class VScene extends PureComponent {

  state = {
    expandForm: false,
    pageSize: 10,
  };

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'scene/fetch',
      payload: { type: schemaType },
    });
    dispatch({
      type: 'scene/getIndices',
      payload: {} ,
    });

  }

  create = (e) => {
    this.props.dispatch({
      type: 'scene/show',
      payload: { visible: true, editType: 'create' },
    });
    console.log('create')
  };

  edit = (value) => {
    if (!value) return;
    this.props.dispatch({
      type: 'scene/edit',
      payload: { id: value },
    });
  };

  advanceSearch = (value) => {
    if (!value) return;
    router.push(`/essearch/scene/search/${value}`);
  };

  delete = (id) => {
    this.props.dispatch({

      type: 'scene/remove',
      payload: { id },
    });
  };

  columns = [
    {
      title: '编号',
      dataIndex: 'id',
    },
    {
      title: '配置名称',
      dataIndex: 'name',
    },
    {
      title: '数据集',
      dataIndex: 'index',
    },
    {
      title: '作者',
      dataIndex: 'author',
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      render: (text, record) => (
        <Fragment>
          {moment(text).format('YYYY-MM-DD')}
        </Fragment>),
    },
    {
      title: '操作',
      render: (text, record) => (
        <Fragment>
          <a onClick={() => this.edit(record.id)}>编辑</a>
          <Divider type="vertical"/>
          <a onClick={() => this.advanceSearch(record.id)}>查询</a>
          <Divider type="vertical"/>
          <Popconfirm title="是否要删除此行？" onConfirm={() => this.delete(record.id)}>
            <a style={{ color: '#ff0000' }}>删除</a>
          </Popconfirm>
        </Fragment>
      ),
    },
  ];

  getCondition(values) {
    let formData = {};
    Object.keys(values).forEach(key => {
      if (values[key] !== undefined) {
        if (values[key] !== '') {
          if (key === 'created_at') {
            if (values[key].length !== 0)
              formData = { ...formData, [key]: values[key].map(item => moment(item).format('YYYY-MM-DD')) };
          } else {
            formData = { ...formData, [key]: values[key] };
          }
        }

      }
    });
    return formData;
  }

  search = (e) => {
    e.preventDefault();
    const { form: { validateFieldsAndScroll }, dispatch } = this.props;
    validateFieldsAndScroll((err, values) => {
      if (err) return;
      console.log(values);

      const formData = this.getCondition(values);

      console.log('formData', formData);
      dispatch({
        type: 'scene/fetch',
        payload: { type: schemaType, ...formData, offset, limit },
      });

    });
  };

  reset = (e) => {
    e.preventDefault();
    const { form: { resetFields }, dispatch } = this.props;
    resetFields();
    dispatch({
      type: 'scene/fetch',
      payload: { type: schemaType },
    });
    this.setState({pageSize: 10});
  };

  toggleForm = () => {
    const { expandForm } = this.state;
    this.setState({
      expandForm: !expandForm,
    });
  };

  renderSimpleForm() {
    const {
      form: { getFieldDecorator },indexs
    } = this.props;
    return (
      <Form onSubmit={this.search} layout="inline">
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col md={8} sm={24}>
            <FormItem label={<span>配置名称</span>}>
              {getFieldDecorator('name')(<Input placeholder="请输入(模糊匹配，可不输全)"/>)}
            </FormItem>
          </Col>
          <Col md={8} sm={24}>
            <FormItem label={<span>数据集名</span>} style={{ width: '100%' }}>
              {getFieldDecorator('index')(
                <Select
                  showSearch
                  allowClear
                  style={{ width: '100%' }}
                  placeholder="请输入"
                  optionFilterProp="children"
                  filterOption={(input, option) => option.props.children.indexOf(input) >= 0}
                >
                  {indexs.map(item => <Select.Option value={item} key={item}>{item}</Select.Option>)}
                </Select>,
              )}
            </FormItem>
          </Col>
          <Col md={8} sm={24}>
            <span>
              <Button type="primary" htmlType="submit">
                查询
              </Button>
              <Button style={{ marginLeft: 8 }} onClick={this.reset}>
                重置
              </Button>
              <a style={{ marginLeft: 18 }} onClick={this.toggleForm}>
                展开 <Icon type="down"/>
              </a>
            </span>
          </Col>
        </Row>
      </Form>
    );
  }

  renderAdvancedForm() {
    const {
      form: { getFieldDecorator },indexs
    } = this.props;
    return (
      <Form onSubmit={this.search}>
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col md={8} sm={24}>
            <FormItem label="配置名称">
              {getFieldDecorator('name')(<Input style={{ width: '100%' }} placeholder="请输入(模糊匹配，可不输全)"/>)}
            </FormItem>
          </Col>
          <Col md={8} sm={24}>
            <FormItem label="数据集名">
              {getFieldDecorator('index')(
                <Select
                  showSearch
                  allowClear
                  style={{ width: '100%' }}
                  placeholder="请输入"
                  optionFilterProp="children"
                  filterOption={(input, option) => option.props.children.indexOf(input) >= 0}
                >
                  {indexs.map(item => <Select.Option value={item} key={item}>{item}</Select.Option>)}
                </Select>,
              )}
            </FormItem>
          </Col>
          <Col md={8} sm={24}>
            <FormItem label="创建作者">
              {getFieldDecorator('author')(<Input style={{ width: '100%' }} placeholder="请输入"/>)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>

          <Col md={8} sm={24}>
            <FormItem label="创建日期">
              {getFieldDecorator('created_at')(
                <RangePicker style={{ width: '100%' }}/>,
              )}
            </FormItem>
          </Col>
        </Row>
        <div style={{ overflow: 'hidden' }}>
          <div style={{ float: 'right', marginBottom: 24, }}>
            <Button type="primary" htmlType="submit">
              查询
            </Button>
            <Button style={{ marginLeft: 8 }} onClick={this.reset}>
              重置
            </Button>
            <a style={{ marginLeft: 18 }} onClick={this.toggleForm}>
              收起 <Icon type="up"/>
            </a>
          </div>
        </div>
      </Form>
    );
  }

  renderForm = () => {
    const { expandForm } = this.state;
    return expandForm ? this.renderAdvancedForm() : this.renderSimpleForm();
  };

  render() {
    const { list, loading, total } = this.props;

    const pagination = {
      onChange: (page, pageSize) => {
        const { dispatch, form } = this.props;
        const values = form.getFieldsValue();
        const formData = this.getCondition(values);
        console.log(formData);
        dispatch({
          type: 'scene/fetch',
          payload: { offset: (page - 1) * pageSize, limit: pageSize, type: schemaType, ...formData },
        });
      },
      onShowSizeChange: (current, size) => {
        const { dispatch, form } = this.props;
        const values = form.getFieldsValue();
        const formData = this.getCondition(values);
        console.log(formData);
        dispatch({
          type: 'single/fetch',
          payload: { offset: (current - 1) * size, limit: size, type: schemaType, ...formData },
        });
        this.setState({ pageSize: size });
      },
      showQuickJumper: true,
      showSizeChanger: true,
      total,
      pageSizeOptions,
      pageSize: this.state.pageSize,
      showTotal: (num) => {
        return <p style={{ color: '#9d9d9d' }}>总共{num}条数据</p>;
      },
    };

    return (
      <PageHeaderWrapper>

        <Card bordered={false}>
          <div className={styles.tableListForm}>{this.renderForm()}</div>
          <div><Button icon="plus" onClick={this.create} type="primary">新建</Button></div>

          <Table
            style={{ marginTop: 30 }}
            rowKey="id"
            loading={loading}
            dataSource={list}
            columns={this.columns}
            onSelectRow={this.handleSelectRows}
            onChange={this.handleStandardTableChange}
            pagination={pagination}
          />
        </Card>

        <CSingleEditDrawer />
      </PageHeaderWrapper>
    );
  }
}


