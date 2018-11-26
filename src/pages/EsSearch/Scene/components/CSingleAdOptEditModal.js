import React, { PureComponent, Fragment } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import {
  Form,
  Select,
  Modal
} from 'antd';

import {
  uniqueValInField
} from '@/services/EsSearch/ses';

const FormItem = Form.Item;
const { Option } = Select;
const formItemLayout = {
  labelCol: { span: 7 },
  wrapperCol: { span: 13 },
};

/**
 * 高级属性设置
 */
const SelectOptionSettingForm = props => {
  const { uniqueValList, form: { getFieldDecorator }, record } = props;
  return (
    <div>
      <FormItem {...formItemLayout} label="过滤选项">
        {
          getFieldDecorator('exclude', {
            initialValue: record.exclude
          })(<Select
            mode="multiple"
            placeholder="请选择需要排除的选项"
          >
            {uniqueValList.map((item, index) => {
              return (<Option value={item} key={index}>{item}</Option>)
            })}
          </Select>)
        }
      </FormItem>
    </div>
  )
}


/**
 * 查询组件高级设置
 * @param {*} param0 
 */
@Form.create()
class CSingleAdOptEditModal extends PureComponent {
  static propTypes = {
    onRef: PropTypes.func,
    onSubmit: PropTypes.func,
  };

  // static defaultProps = {
  // };

  state = {
    visible: false,
    index: '',
    record: {},
    uniqueValList: [],
  }

  componentDidMount() {
    //双向绑定
    this.props.onRef(this)
  }

  /**
   * 设置弹出框打开或关闭
   */
  setModalVisible = async ({ visible, index, record }) => {
    const { form: { resetFields } } = this.props;
    resetFields();
    this.setState({
      visible: !!visible,
      index: index || '',
      record: record || {},
    });

    if (record) {
      const { key, componentType } = record
      if (componentType === 'select' || componentType === 'multipleSelect') {
        const result = await uniqueValInField({
          index,
          field: key
        });

        console.log(`result`, result)

        if (result) {
          const { code, data } = result;
          this.setState({
            uniqueValList: code === 0 ? data : []
          });
        }
      }
    }
  }

  onCompomentTypeChange = async (value) => {
    const { index, record: { key } } = this.state;
    if (value === 'select' || value === 'multipleSelect') {
      const result = await uniqueValInField({
        index,
        field: key
      });
      const { code, data } = result;
      if (code === 0) {
        this.setState({
          uniqueValList: data
        })
      }
    }
  }

  onOk = () => {
    const { form: { getFieldsValue }, onChange } = this.props;
    const { record } = this.state;
    const { componentType, exclude } = getFieldsValue();
    this.setModalVisible({ visible: false })
    onChange({
      ...record,
      componentType,
      exclude
    })
  }

  render() {
    const { form, form: { getFieldDecorator, getFieldValue } } = this.props;
    const { visible, record, record: { key, type }, index } = this.state;
    const componentType = getFieldValue('componentType') || record.componentType;
    const formOptions = {
      ...this.state, form
    }
    return (
      <Modal
        destroyOnClose
        title="查询组件高级配置"
        width={640}
        bodyStyle={{ padding: '32px 40px 48px' }}
        visible={visible}
        onOk={this.onOk}
        onCancel={() => this.setModalVisible(false, null)}
      >
        <Form >
          <FormItem {...formItemLayout} label="字段">
            {key ? key : ''}
          </FormItem>
          <FormItem {...formItemLayout} label="数据类型">
            {type ? type : ''}
          </FormItem>
          <FormItem {...formItemLayout} label="组件类型">
            {getFieldDecorator(`componentType`, {
              initialValue: record.componentType
            })(
              <Select onChange={this.onCompomentTypeChange}>
                <Option value="input">输入框</Option>
                <Option value="select">单选下拉框</Option>
                <Option value="multipleSelect">多选下拉框</Option>
                <Option value="cascader" disabled>级联选择框</Option>
                <Option value="datePicker">日期选择框</Option>
              </Select>
            )}
          </FormItem>
          {
            componentType === 'select' || componentType === 'multipleSelect' ? (
              <SelectOptionSettingForm {...formOptions} />
            ) : null
          }
        </Form>
      </Modal >
    );
  }
}
export default CSingleAdOptEditModal;
