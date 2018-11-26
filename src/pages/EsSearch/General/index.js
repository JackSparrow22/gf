import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import router from 'umi/router';
import {
  Card,
  Button,
  Table,
  Divider
} from 'antd';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import styles from './SchemaList.less';

@connect(({ generalList, loading }) => ({
  ...generalList,
  loading: loading.models.rule,
}))
class VGeneralList extends PureComponent {

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'generalList/fetchList',
      payload: {},
    });
  }

  create = (e) => {
    router.push('/essearch/general/create')
  };

  edit = (value) => {
    if (!value) return;
    //router push
    router.push(`/essearch/general/edit/${value}`);
  };

  search = (value) => {
    if (!value) return;
    //router push
    router.push(`/essearch/general/search/${value}`);
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
          <Divider type="vertical" />
          <a onClick={() => this.search(record.id)}>查询</a>
        </Fragment>
      )
    },
  ];


  render() {
    const {
      list,
      loading,
      total,
    } = this.props;

    const pagination = {
      onChange: (index) => {
        const { dispatch } = this.props;
        const limit = 10;
        dispatch({
          type: 'general/fetchList',
          payload: { offset: (index - 1) * limit, limit },
        });
      },
      total,
      showTotal: (num) => {
        return <p style={{ color: "#9d9d9d" }}>总共{num}条数据</p>
      },
    };
    return (
      <PageHeaderWrapper>
        <Card bordered={false}>
          <div className={styles.tableList}>
            <div className={styles.tableListOperator}>
              <Button icon="plus" type="primary" onClick={() => this.create(true)}>
                新建
              </Button>
            </div>
            <Table
              rowKey="id"
              loading={loading}
              dataSource={list}
              columns={this.columns}
              onSelectRow={this.handleSelectRows}
              onChange={this.handleStandardTableChange}
              pagination={pagination}
            />
          </div>
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default VGeneralList
