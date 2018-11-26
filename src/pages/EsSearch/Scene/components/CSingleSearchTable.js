import React, { Component } from 'react';
import {
  Card,
  Table,
} from 'antd';
import moment from 'moment';

const pageSizeOptions = ['10', '30', '50', '70', '100'];

class CSingleSearchTable extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  /**
   * 获取需要显示的字段
   * @param result
   * @returns {Array}
   */

  getDisplayField = (result) => {
    const displayField = [];
    Object.keys(result).forEach((key) => {
      displayField.push({
        label: result[key].alias !== '' ? result[key].alias : result[key].key,
        value: result[key].key,
        type: result[key].type,
      });
    });
    return displayField;
  };

  render() {
    /**
     * result 为schema里的result
     * data 为表格渲染的数据源
     * total 为数据的总条数
     * searchCondition 为表单的搜索条件
     * dispatchType 为请求api的路径
     */

    const { result, data, total, searchCondition, dispatchType } = this.props;
    const displayField = this.getDisplayField(result);
    const displayFieldLength = displayField.length;
    const dataSource = displayFieldLength > 0 ? data.map((item, index) => ({ ...item, id_key_only: index })) : [];
    const columns = [];

    console.log('displayField', displayField);
    displayField.forEach(item => columns.push(
      {
        title: item.label,
        dataIndex: item.value,
        key: item.value,
        render: text => item.type === 'date' ? <p key={text}>{moment(text).format('YYYY-MM-DD')}</p> : text,
      }),
    );

    const pagination = {
      onChange: (page, pageSize) => {
        const { dispatch } = this.props;
        dispatch({
          type: dispatchType,
          payload: { ...searchCondition, offset: (page - 1) * pageSize, limit: pageSize },
        });
      },
      onShowSizeChange: (current, size) => {
        const { dispatch } = this.props;
        dispatch({
          type: dispatchType,
          payload: { ...searchCondition, offset: (current - 1) * size, limit: size },
        });
      },
      showQuickJumper: true,
      showSizeChanger: true,
      pageSizeOptions,
      total: displayFieldLength > 0 ? total : 0,
      showTotal: num => <p style={{ color: '#9d9d9d' }}>总共{num}条数据</p>,
    };

    return (
      <Card bordered={false}>
        <Table rowKey="id_key_only" dataSource={dataSource} columns={columns} pagination={pagination}/>
      </Card>
    );
  }
}

export default CSingleSearchTable;
