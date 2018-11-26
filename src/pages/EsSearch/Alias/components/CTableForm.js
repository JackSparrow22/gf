import React, { PureComponent, Fragment } from 'react';
import { Table, Input } from 'antd';
import isEqual from 'lodash/isEqual';

class TableForm extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      data: props.value,
      loading: false,
      value: props.value,
    };
  }

  static getDerivedStateFromProps(nextProps, preState) {
    if (isEqual(nextProps.value, preState.value)) {
      return null;
    }
    return {
      data: nextProps.value,
      value: nextProps.value,
    };
  }

  handleInputChange = (e, record) => {
    const { onChange } = this.props;
    const { value } = this.state;
    const inputValue = e.target.value;

    const newData = value.map(item => item.field === record.field ? { ...item, alias: inputValue } : {
      ...item,
      alias: item.alias ? item.alias : '',
    });
    onChange(newData);
  };


  render() {
    const { loading, data } = this.state;
    const columns = [
      {
        title: '字段',
        dataIndex: 'field',
      },
      {
        title: '类型',
        dataIndex: 'type',
      }, {
        title: '别名',
        dataIndex: 'alias',
        render: (alias, record) => (
          <Input
            key={record.field}
            onChange={(e) => this.handleInputChange(e, record)}
            defaultValue={alias}
          />
        ),
      },
    ];
    return (
      <Fragment>
        <Table
          loading={loading}
          columns={columns}
          dataSource={data}
          pagination={false}
          rowKey="field"
        />
      </Fragment>
    );
  }
}

export default TableForm;
