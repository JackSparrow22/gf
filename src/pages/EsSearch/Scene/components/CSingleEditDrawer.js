import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import {
  Drawer,
  Form
} from 'antd';
import CSingleCreateForm from './CSingleCreateForm';
import CSingleEditForm from './CSingleEditForm';

const schemaType = 3;

/**
 * 外部通过redux与本组件交互
 */
@connect(({ scene }) => ({
  ...scene
}))
@Form.create()
class VSingleEditDrawer extends PureComponent {

  close = () => {
    this.props.dispatch({
      type: 'scene/show',
      payload: { visible: false }
    })
  }

  save = (value) => {
    const { dispatch, editType } = this.props;
    const { rule, index } = value
    if (editType === 'create') {
      dispatch({
        type: 'scene/create',
        payload: { name: rule, index, type: schemaType, schema: value, author: 'admin' }
      })
    } else if (editType === 'edit') {
      const { editRow: { id } } = this.props;
      const { rule } = value;
      dispatch({
        type: 'scene/update',
        payload: { id, name: rule, schema: value }
      })

      // dispatch({
      //   type: 'single/create',
      //   payload: { name: rule, index, type: schemaType, schema: value, author: 'admin' }
      // })
    }
  }

  copy = (value) => {
    const { dispatch } = this.props;
    const schema = value && value.schema ? JSON.parse(value.schema) : {};
    dispatch({
      type: 'scene/copy',
      payload: schema
    })
  }

  render() {
    const { visible, editRow, editRow: { schema }, editType, copy } = this.props;

    const formOpts = {
      data: schema ? JSON.parse(schema) : editRow,
      copy,
      onChange: this.save,
      onCopy: this.copy,
    }

    return (
      <Drawer
        destroyOnClose
        title={`单表查询配置`}
        width={document.body.clientWidth < 1024 ? document.body.clientWidth : '61.8%'}
        bodyStyle={{ padding: '32px 40px 48px' }}
        visible={visible}
        maskClosable={false}
        onClose={this.close}
      >
        {editType === 'create' ? <CSingleCreateForm {...formOpts} /> :
          (
            <Fragment>
              {
                editType === 'edit' ? <CSingleEditForm {...formOpts} /> : null
              }
            </Fragment>
          )}
      </Drawer>
    )
  }
}
export default VSingleEditDrawer
