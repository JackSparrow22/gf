import React, { PureComponent, Fragment } from 'react';
import { Table, Button, Input, message, Select, Popconfirm, Divider, Drawer } from 'antd';
import isEqual from 'lodash/isEqual';
import { connect } from 'dva';
import styles from './style.less';

import CSingleEditDrawer from './CSingleEditDrawer'

@connect(({ general }) => ({
  ...general
}))
class CGeneralEditTableForm extends PureComponent {

  index = 0;
  cacheOriginData = {};

  constructor(props) {
    super(props);

    this.state = {
      data: props.value ? props.value : [],//外部注入配置列表,当前通用查询一共配置了几个数据集
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
      value: nextProps.value
    };
  }

  componentDidMount() {
    this.props.dispatch({
      type: 'general/fetchIndices'
    })
  }

  componentWillUnmount() {

  }

  /**
   * 查找对应的行
   */
  getRowByKey(key, newData) {
    const { data } = this.state;
    return (newData || data).filter(item => item.key === key)[0];
  }

  /**
   * 触发当前行编辑视图
   */
  edit = (e, key) => {
    e.preventDefault();
    const { data } = this.state;
    const newData = data.map(item => ({ ...item }));
    const target = this.getRowByKey(key, newData);
    this.props.dispatch({
      type: 'general/showDrawer',
      payload: { visible: true, editRow: target }
    })
  };

  newIndex = (e) => {
    const { data } = this.state;
    const newData = data.map(item => ({ ...item }));

    const lastOne = newData[newData.length - 1];
    if (lastOne && /NEW_TEMP_ID_/.test(lastOne.key)) {
      message.error('请先保存上一条数据');
      e.target.focus();
      return
    }

    newData.push({
      key: `NEW_TEMP_ID_${++this.index}`,
      index: '',
      alias: '',
      normal: [],
      advance: [],
      result: [],
      isNew: true,
    });
    this.setState({ data: newData });
  };

  remove = (key) => {
    const { data } = this.state;
    const { onChange } = this.props;
    const newData = data.filter(item => item.key !== key);
    this.setState({ data: newData });
    onChange(newData);
  }

  /**
   * 响应行内编辑
   */
  fieldChange(value, fieldName, key) {
    const { data } = this.state;
    const newData = data.map(item => ({ ...item }));
    const target = this.getRowByKey(key, newData);
    if (target) {
      target[fieldName] = value;

      if (fieldName === 'index') {
        target['key'] = value;
      }

      this.setState({ data: newData });
    }
  }

  /**
   * 保存一行数据
   */
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

      //检查新增数据集不能为空
      if (!target.index) {
        message.error('新增数据集不能为空');
        e.target.focus();
        this.setState({
          loading: false,
        });
        return;
      }

      delete target.isNew;

      //更新loading状态
      this.setState({
        loading: false,
      });
      //广播事件
      this.props.onChange(this.state.data);
    }, 200);
  }

  cancel(e, key) {

  }

  onClose = (e) => {
  }

  onSaveSingleFormSchema = (value) => {
    const { data } = this.state;
    const { onChange } = this.props;
    const newData = data.map(item => ({ ...item }));

    //替换或新增
    let matchIndex = -1
    newData.map((item, i) => {
      if (item.index === value.index) matchIndex = i;
    })
    matchIndex > -1 ? newData[matchIndex] = value : newData.push(value);


    onChange(newData);
  }

  render() {
    const { indices } = this.props;

    const columns = [
      {
        title: '数据集',
        dataIndex: 'index',
        key: 'index',
        render: (text, record) => record.isNew ? (
          <Select
            showSearch
            style={{ width: '100%' }}
            placeholder="请选择表字段"
            defaultValue={/NEW_TEMP_ID_/.test(text) ? '' : text}
            onSelect={value => this.fieldChange(value, 'index', record.key)}>
            {
              indices.filter((i) => {
                //过滤
                let flag = true;
                this.state.data.map((j) => {
                  if (j.index === i) {
                    flag = false;
                  }
                })
                return flag
              }).map((item, i) => {
                //展示
                return (
                  <Select.Option value={item} key={`item_${i}`}>
                    {item}
                  </Select.Option>
                )
              })
            }
          </Select>
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
          } else {
            return (
              <span>
                <a onClick={e => this.edit(e, record.key)}>编辑</a>
                <Divider type="vertical" />
                <Popconfirm title="是否要删除此行？" onConfirm={() => this.remove(record.key)}>
                  <a>删除</a>
                </Popconfirm>
              </span>
            );
          }
        },
      },
    ];

    const { loading, data } = this.state;

    return (
      <Fragment>
        <Table
          loading={loading}
          columns={columns}
          dataSource={data}
          pagination={false}
          rowClassName={record => (record.editable ? styles.editable : '')}
        />
        <Button
          style={{ width: '100%', marginTop: 16, marginBottom: 8 }}
          type="dashed"
          onClick={this.newIndex}
          icon="plus"
        >
          新增数据集
        </Button>
        <CSingleEditDrawer />
      </Fragment>
    );
  }
}

export default CGeneralEditTableForm;
