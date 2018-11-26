import React, { PureComponent, Fragment } from 'react';
import { Table, Button, Input, message, Popconfirm, Divider, Select } from 'antd';
import isEqual from 'lodash/isEqual';

import { DragDropContext, DragSource, DropTarget } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import update from 'immutability-helper';

import styles from './style.less';
import DragableBodyRow from './CBodyRow';


// function dragDirection(
//   dragIndex,
//   hoverIndex,
//   initialClientOffset,
//   clientOffset,
//   sourceClientOffset,
// ) {
//   const hoverMiddleY = (initialClientOffset.y - sourceClientOffset.y) / 2;
//   const hoverClientY = clientOffset.y - sourceClientOffset.y;
//   if (dragIndex < hoverIndex && hoverClientY > hoverMiddleY) {
//     return 'downward';
//   }
//   if (dragIndex > hoverIndex && hoverClientY < hoverMiddleY) {
//     return 'upward';
//   }
// }

// class BodyRow extends React.Component {
//   render() {
//     const {
//       isOver,
//       connectDragSource,
//       connectDropTarget,
//       moveRow,
//       dragRow,
//       clientOffset,
//       sourceClientOffset,
//       initialClientOffset,
//       ...restProps
//     } = this.props;
//     const style = { ...restProps.style, cursor: 'move' };
//
//     let { className } = restProps;
//     if (isOver && initialClientOffset) {
//       const direction = dragDirection(
//         dragRow.index,
//         restProps.index,
//         initialClientOffset,
//         clientOffset,
//         sourceClientOffset,
//       );
//       if (direction === 'downward') {
//         className += ' drop-over-downward';
//       }
//       if (direction === 'upward') {
//         className += ' drop-over-upward';
//       }
//     }
//
//     return connectDragSource(
//       connectDropTarget(
//         <tr
//           {...restProps}
//           className={className}
//           style={style}
//         />,
//       ),
//     );
//   }
// }
//
// const rowSource = {
//   beginDrag(props) {
//     return {
//       index: props.index,
//     };
//   },
// };
//
// const rowTarget = {
//   drop(props, monitor) {
//     const dragIndex = monitor.getItem().index;
//     const hoverIndex = props.index;
//
//     if (dragIndex === hoverIndex) {
//       return;
//     }
//
//     props.moveRow(dragIndex, hoverIndex);
//
//     monitor.getItem().index = hoverIndex;
//   },
// };
//
// const DragableBodyRow = DropTarget('row', rowTarget, (connect, monitor) => ({
//   connectDropTarget: connect.dropTarget(),
//   isOver: monitor.isOver(),
//   sourceClientOffset: monitor.getSourceClientOffset(),
// }))(
//   DragSource('row', rowSource, (connect, monitor) => ({
//     connectDragSource: connect.dragSource(),
//     dragRow: monitor.getItem(),
//     clientOffset: monitor.getClientOffset(),
//     initialClientOffset: monitor.getInitialClientOffset(),
//   }))(BodyRow),
// );

class CSingleSimpleEditForm extends PureComponent {
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

  newRow = (e) => {
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

  fieldChange(e, fieldName, key) {
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
      //data早已经通过fieldChange更新了，所以可以直接用
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
      onChange(data.map(d => {
        delete d.editable;
        return d;
      }));

      this.setState({
        loading: false,
      });
    }, 500);
  }

  validate = (data) => {
    let flag = true;
    for (let d of data.values()) {
      if (/NEW_TEMP_ID_/.test(d['key']))
        flag = false;
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


  components = {
    body: {
      row: DragableBodyRow,
    },
  };

  moveRow = (dragIndex, hoverIndex) => {
    const { data } = this.state;
    const dragRow = data[dragIndex];
    const { onChange } = this.props;

    this.setState(
      (state) => update(state, {
        data: {
          $splice: [[dragIndex, 1], [hoverIndex, 0, dragRow]],
        },
      }), () => {
        onChange(this.state.data);
      },
    );
  };

  render() {
    const { mapping } = this.props;
    const { loading, data } = this.state;

    const columns = [
      {
        title: '字段',
        dataIndex: 'key',
        key: 'key',
        width: 300,
        render: (text, record) => record.editable ? (
          <Select
            showSearch
            style={{ width: '100%' }}
            placeholder="请选择表字段"
            defaultValue={/NEW_TEMP_ID_/.test(text) ? '' : text}
            onSelect={value => this.fieldChange(value.replace(/\s(.*)$/, ''), 'key', record.key)}
          >
            {mapping
              .filter(item => {
                const same = data.filter(d => d.key === item.key);
                return same.length === 0;
              })
              .map(item => (<Select.Option key={item.key}
                                           value={`${item.key} (${item.alias})`}>{`${item.key} (${item.alias})`}</Select.Option>))}
          </Select>
        ) : text,
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
        width: 200,
        render: (text, record) => record.editable ? (
          <Input
            value={text}
            onChange={e => this.fieldChange(e, 'alias', record.key)}
            onKeyPress={e => this.handleKeyPress(e, record.key)}
            placeholder="字段别名"
          />
        ) : text,
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
                  <Divider type="vertical"/>
                  <Popconfirm title="是否要删除此行？" onConfirm={() => this.remove(record.key)}>
                    <a>删除</a>
                  </Popconfirm>
                </span>
              );
            }
            return (
              <span>
                <a onClick={e => this.saveRow(e, record.key)}>保存</a>
                <Divider type="vertical"/>
                <a onClick={e => this.cancel(e, record.key)}>取消</a>
              </span>
            );
          }
          return (
            <span>
              <a onClick={e => this.toggleEditable(e, record.key)}>编辑</a>
              <Divider type="vertical"/>
              <Popconfirm title="是否要删除此行？" onConfirm={() => this.remove(record.key)}>
                <a>删除</a>
              </Popconfirm>
            </span>
          );
        },
      },
    ];

    return (
      <Fragment>
        <Table
          loading={loading}
          columns={columns}
          dataSource={data}
          pagination={false}
          rowClassName={record => (record.editable ? styles.editable : '')}
          components={this.components}
          onRow={(record, index) => ({
            index,
            moveRow: this.moveRow,
          })}
        />
        <Button
          style={{ width: '100%', marginTop: 16, marginBottom: 8 }}
          type="dashed"
          onClick={this.newRow}
          icon="plus"
        >
          新增字段
        </Button>
      </Fragment>
    );
  }
}

export default DragDropContext(HTML5Backend)(CSingleSimpleEditForm);
