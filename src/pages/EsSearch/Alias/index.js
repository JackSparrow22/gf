import React, { Fragment } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import {
  Card,
  Form,
  Button,
  Table,
  Divider,
  Popconfirm,
  Drawer,
  Input,
  Select,
} from 'antd';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import TableForm from './components/CTableForm';

const FormItem = Form.Item;

@connect(({ alias }) => ({ alias }))
@Form.create()

class VAlias extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      editType: 0, //0：创建 1：编辑
      isSelectIndex: false, //是否选择了数据集
    };
  }

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'alias/getAlias',
      payload: {},
    });
    dispatch({
      type: 'alias/getIndices',
      payload: {},
    });
  }

  handleDelete = (id) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'alias/delete',
      payload: id,
    });
  };

  handleEdit = (id) => {
    console.log(id);
    const { dispatch } = this.props;
    dispatch({
      type: 'alias/getDetails',
      payload: id,
    });
    this.setState({ visible: true, editType: 1 });
  };

  handleAdd = () => {
    this.setState({ visible: true, editType: 0 });
  };

  handleDrawerClose = () => {
    this.setState({ visible: false, isSelectIndex: false });
    const { dispatch } = this.props;
    const timer = setTimeout(() => {
      dispatch({
        type: 'alias/reset',
      });
      clearTimeout(timer);
    }, 900);

  };

  handleSelectChange = (e) => {
    console.log('handleSelectChange', e);
  };

  handleSelectSelected = (index) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'alias/fetchMapping',
      payload: { index },
    });

    this.setState({ isSelectIndex: true });
    console.log('handleSelectSelected', index);
  };

  handleSubmit = (e) => {
    const { form: { validateFieldsAndScroll } } = this.props;
    e.preventDefault();
    validateFieldsAndScroll((err, values) => {
      if (!err) {
        const { dispatch } = this.props;
        const { editType } = this.state;
        const { schema, alias, ...other } = values;
        let newSchema = {};
        let formData = {};
        schema.forEach(item => {
          newSchema = { ...newSchema, [item.field]: { alias: item.alias ? item.alias : '', type: item.type } };
        });
        if (!alias) {
          formData = {
            ...other,
            schema: newSchema,
          };
        } else {
          formData = {
            ...values,
            schema: newSchema,
          };
        }


        if (editType === 0) {
          console.log('创建: ', formData);
          dispatch({
            type: 'alias/create',
            payload: formData,
          });
        } else if (editType === 1) {
          const { alias: { dataSet: { id } } } = this.props;
          const { name, ...others } = formData;
          console.log('编辑: ', others);
          dispatch({
            type: 'alias/update',
            payload: { id, ...others },
          });
        } else return;

        this.handleDrawerClose();
      }
    });
  };


  render() {
    const { alias: { tableList, index, loading, dataSet: { schema, name, alias } }, form: { getFieldDecorator } } = this.props;
    const { visible, editType, isSelectIndex } = this.state;
    const columns = [
      {
        title: '编号',
        dataIndex: 'id',
      }, {
        title: '数据集',
        dataIndex: 'name',
      },
      {
        title: '数据集别名',
        dataIndex: 'alias',
      },
      {
        title: '创建时间',
        dataIndex: 'created_at',
        render: (created) => (
          <Fragment>
            {moment(created).format('YYYY-MM-DD')}
          </Fragment>),
      },
      {
        title: '操作',
        render: (text, record) => (
          <Fragment>
            <a onClick={() => this.handleEdit(record.id)}>编辑</a>
            <Divider type="vertical"/>
            <Popconfirm title="是否要删除此配置，该操作无法撤销" onConfirm={() => this.handleDelete(record.id)}>
              <a style={{ color: '#ff0000' }}>删除</a>
            </Popconfirm>
          </Fragment>
        ),
      },
    ];

    return (
      <PageHeaderWrapper>
        <Card bordered={false}>
          <div><Button icon="plus" onClick={this.handleAdd} type="primary">新建</Button></div>
          <Table
            style={{ marginTop: 30 }}
            rowKey="id"
            loading={loading}
            dataSource={tableList}
            columns={columns}
            pagination={false}
          />

          <Drawer
            destroyOnClose
            title="别名配置"
            width={document.body.clientWidth < 1024 ? document.body.clientWidth : '61.8%'}
            bodyStyle={{ padding: '32px 40px 48px' }}
            visible={visible}
            maskClosable={false}
            onClose={this.handleDrawerClose}
          >
            <Form onSubmit={this.handleSubmit}>
              <FormItem label="数据集">
                {getFieldDecorator('name', {
                  rules: [{
                    required: true,
                    message: '请选择数据集',
                  }], initialValue: name,
                })(
                  <Select
                    disabled={editType === 1}
                    showSearch
                    allowClear
                    style={{ width: '100%', color: '#545454' }}
                    placeholder="请选择一个数据集"
                    optionFilterProp="children"
                    onChange={this.handleSelectChange}
                    onSelect={this.handleSelectSelected}
                    filterOption={(input, option) => option.props.children.indexOf(input) >= 0}
                  >
                    {index.map(item => <Select.Option value={item} key={item}>{item}</Select.Option>)}
                  </Select>,
                )}
              </FormItem>

              <div style={{ display: editType === 0 && !isSelectIndex ? 'none' : 'block' }}>
                <FormItem label="数据集别名">
                  {getFieldDecorator('alias', { initialValue: alias })(
                    <Input placeholder="请输入数据集别名"/>,
                  )}
                </FormItem>

                <FormItem label="字段">
                  {getFieldDecorator('schema', {
                    initialValue: schema,
                  })(
                    <TableForm/>,
                  )}
                </FormItem>
                <div style={{ textAlign: 'right' }}><Button htmlType="submit" type="primary">提交</Button></div>
              </div>

            </Form>
          </Drawer>
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default VAlias;
