import React, { PureComponent, Fragment } from 'react';
import { Table, Button, Input, message, Popconfirm, Divider, Select } from 'antd';
import isEqual from 'lodash/isEqual';

import { DragDropContext, DragSource, DropTarget } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import update from 'immutability-helper';

import styles from './style.less';
import CSingleAdOptEditModal from './CSingleAdOptEditModal';
import DragableBodyRow from './CBodyRow';

class CSingleAdvanceEditForm extends PureComponent {
  index = 0;

  cacheOriginData = {};

  constructor(props) {
    super(props);
    this.state = {
      data: props.value ? props.value : [],
      loading: false,
      /* eslint-disable-next-line react/no-unused-state */
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

  getRowByKey(key, newData) {
    const { data } = this.state;
    return (newData || data).filter(item => item.key === key)[0];
  }

  toggleEditable = (e, key) => {
    e.preventDefault();
    const { data } = this.state;
    const newData = data.map(item => ({ ...item }));
    const target = this.getRowByKey(key, newData);
    if (target) {
      // 进入编辑状态时保存原始数据
      if (!target.editable) {
        this.cacheOriginData[key] = { ...target };
      }
      target.editable = !target.editable;
      this.setState({ data: newData });
    }
  };

  newRow = e => {
    const { data } = this.state;
    const newData = data.map(item => ({ ...item }));

    const inValid = newData.filter(d => d.editable === true);
    if (inValid.length) {
      message.error('请先保存数据,再点击新增字段');
      e.target.focus();
      return;
    }

    newData.push({
      key: `NEW_TEMP_ID_${this.index}`,
      type: '',
      alias: '',
      componentType: 'input',
      editable: true,
      isNew: true,
    });
    this.index += 1;
    this.setState({ data: newData });
  };

  remove(key) {
    const { data } = this.state;
    const { onChange } = this.props;
    const newData = data.filter(item => item.key !== key);
    this.setState({ data: newData });
    onChange(newData);
  }

  handleKeyPress(e, key) {
    if (e.key === 'Enter') {
      this.saveRow(e, key);
    }
  }

  handleFieldChange(e, fieldName, key) {
    const { data } = this.state;
    const newData = data.map(item => ({ ...item }));
    const target = this.getRowByKey(key, newData);
    if (target) {
      target[fieldName] = e.target ? e.target.value : e;

      if (fieldName === 'key') {
        const column = this.props.mapping.filter(d => d.key === target[fieldName]);
        target['type'] = column[0]['type'];
        target['alias'] = column[0]['alias'];
      }

      this.setState({ data: newData });
    }
  }

  saveRow(e, key) {
    e.persist();
    this.setState({
      loading: true,
    });
    setTimeout(() => {
      if (this.clickedCancel) {
        this.clickedCancel = false;
        return;
      }
      const target = this.getRowByKey(key) || {};

      if (/NEW_TEMP_ID_/.test(target.key)) {
        message.error('请先选择字段');
        e.target.focus();
        this.setState({
          loading: false,
        });
        return;
      }
      delete target.isNew;
      this.toggleEditable(e, key);
      const { data } = this.state;
      //data早已经通过handleFieldChange更新了，所以可以直接用
      const { onChange } = this.props;

      //validate
      if (!this.validate(data)) {
        message.error('字段选项不能为空');
        e.target.focus();
        this.setState({
          loading: false,
        });
        return;
      }

      //onChange
      onChange(
        data.map(d => {
          delete d.editable;
          return d;
        })
      );

      this.setState({
        loading: false,
      });
    }, 500);
  }

  validate = data => {
    let flag = true;
    for (let d of data.values()) {
      if (/NEW_TEMP_ID_/.test(d['key'])) flag = false;
    }
    return flag;
  };

  cancel(e, key) {
    this.clickedCancel = true;
    e.preventDefault();
    const { data } = this.state;
    const newData = data.map(item => ({ ...item }));
    const target = this.getRowByKey(key, newData);
    if (this.cacheOriginData[key]) {
      Object.assign(target, this.cacheOriginData[key]);
      delete this.cacheOriginData[key];
    }
    target.editable = false;
    this.setState({ data: newData });
    this.clickedCancel = false;
  }

  onShowOptsModal = (e, key) => {
    const { data } = this.state;
    const newData = data.map(item => ({ ...item }));
    const target = this.getRowByKey(key, newData);

    console.log(`onShowOptsModal`, e, key, target);

    this.modal.setModalVisible({ visible: true, index: this.props.index, record: target });
  };

  onOptsChange = payload => {
    const { key } = payload;
    const { data } = this.state;
    const newData = data.map(item => ({ ...item }));
    const target = this.getRowByKey(key, newData);

    delete target.exclude;
    delete target.include;

    delete target.startData;
    delete target.endData;
    delete target.extra;
    //merge
    Object.assign(target, payload);
    //onChange
    this.props.onChange(newData);
  };

  //
  // components = {
  //   body: {
  //     row: DragableBodyRow,
  //   },
  // };

  // moveRow = (dragIndex, hoverIndex) => {
  //   const { data } = this.state;
  //   const dragRow = data[dragIndex];
  //   const { onChange } = this.props;

  //   this.setState(
  //     (state) => update(state, {
  //       data: {
  //         $splice: [[dragIndex, 1], [hoverIndex, 0, dragRow]],
  //       },
  //     }), () => {
  //       onChange(this.state.data);
  //     },
  //   );
  // };

  render() {
    const { mapping } = this.props;
    const { loading, data } = this.state;

    const columns = [
      {
        title: '字段',
        dataIndex: 'key',
        key: 'key',
        width: 200,
        render: (text, record) =>
          record.editable ? (
            <Select
              showSearch
              style={{ width: '100%' }}
              placeholder="请选择表字段"
              defaultValue={/NEW_TEMP_ID_/.test(text) ? '' : text}
              onSelect={value =>
                this.handleFieldChange(value.replace(/\s(.*)$/, ''), 'key', record.key)
              }
            >
              {mapping
                .filter(item => {
                  const same = data.filter(d => d.key === item.key);
                  return same.length === 0;
                })
                .map(item => (
                  <Select.Option key={item.key} value={`${item.key} (${item.alias})`}>{`${
                    item.key
                  } (${item.alias})`}</Select.Option>
                ))}
            </Select>
          ) : (
            text
          ),
      },
      {
        title: '数据类型',
        dataIndex: 'type',
        key: 'type',
        width: 150,
      },
      {
        title: '别名',
        dataIndex: 'alias',
        width: 150,
        render: (text, record) =>
          record.editable ? (
            <Input
              value={text}
              onChange={e => this.handleFieldChange(e, 'alias', record.key)}
              onKeyPress={e => this.handleKeyPress(e, record.key)}
              placeholder="字段别名"
            />
          ) : (
            text
          ),
      },
      {
        title: '显现方式',
        dataIndex: 'componentType',
        width: 150,
        render: (text, record) => {
          if (record.editable)
            return (
              <Select
                showSearch
                style={{ width: '100%' }}
                placeholder="请选择显现方式"
                onSelect={value => this.handleFieldChange(value, 'componentType', record.key)}
                defaultValue="input"
              >
                <Select.Option value="input">输入框</Select.Option>
                <Select.Option value="select">单选下拉框</Select.Option>
                <Select.Option value="multipleSelect">多选下拉框</Select.Option>
                <Select.Option value="cascader" disabled>
                  级联选择框
                </Select.Option>
                <Select.Option value="datePicker">日期选择框</Select.Option>
              </Select>
            );
          else
            switch (text) {
              case 'input':
                return <span>输入框</span>;
                break;
              case 'select':
                return <span>单选框</span>;
                break;
              case 'multipleSelect':
                return <span>多选框</span>;
                break;
              case 'cascader':
                return <span>级联框</span>;
                break;
              case 'datePicker':
                return <span>日期选择框</span>;
                break;
            }
        },
      },
      {
        title: '操作',
        key: 'action',
        render: (text, record) => {
          const { loading } = this.state;
          if (!!record.editable && loading) {
            return null;
          }
          if (record.editable) {
            if (record.isNew) {
              return (
                <span>
                  <a onClick={e => this.saveRow(e, record.key)}>保存</a>
                  <Divider type="vertical" />
                  <Popconfirm title="是否要删除此行？" onConfirm={() => this.remove(record.key)}>
                    <a>删除</a>
                  </Popconfirm>
                </span>
              );
            }
            return (
              <span>
                <a onClick={e => this.saveRow(e, record.key)}>保存</a>
                <Divider type="vertical" />
                <a onClick={e => this.cancel(e, record.key)}>取消</a>
              </span>
            );
          }
          return (
            <span>
              <a onClick={e => this.toggleEditable(e, record.key)}>编辑</a>
              <Divider type="vertical" />
              <a onClick={e => this.onShowOptsModal(e, record.key)}>高级配置</a>
              <Divider type="vertical" />
              <Popconfirm title="是否要删除此行？" onConfirm={() => this.remove(record.key)}>
                <a>删除</a>
              </Popconfirm>
            </span>
          );
        },
      },
    ];

    const modalOptions = {
      onRef: ref => (this.modal = ref),
      onChange: this.onOptsChange,
    };

    return (
      <Fragment>
        <Table
          loading={loading}
          columns={columns}
          dataSource={data}
          pagination={false}
          rowClassName={record => (record.editable ? styles.editable : '')}
          // components={this.components}
          // onRow={(record, index) => ({
          //   index,
          //   moveRow: this.moveRow,
          // })}
        />
        <Button
          style={{ width: '100%', marginTop: 16, marginBottom: 8 }}
          type="dashed"
          onClick={this.newRow}
          icon="plus"
        >
          新增字段
        </Button>
        <CSingleAdOptEditModal {...modalOptions} />
      </Fragment>
    );
  }
}
//export default DragDropContext(HTML5Backend)(CSingleAdvanceEditForm);
export default CSingleAdvanceEditForm;
