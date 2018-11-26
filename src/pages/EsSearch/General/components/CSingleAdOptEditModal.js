import React, { PureComponent, Fragment } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import {
  Form,
  Select,
  Modal, Radio,
  DatePicker,Icon,Tooltip
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

const TooltipTitle = "过滤参数指下拉列表不会出现过滤的选项，指定参数指下拉列表只会出现指定的选项。指定参数必须指定值。";


/**
 * 高级属性设置
 */
const SelectOptionSettingForm = props => {
  const { uniqueValList, form: { getFieldDecorator, getFieldValue }, record } = props;


  let type = 'exclude';
  const bool = Object.keys(record).some(key => key === 'include');
  if (bool) type = 'include';


  return (
    <div>
      <FormItem {...formItemLayout} label='选项方式'>
        {
          getFieldDecorator('extra', {
            initialValue: type,
          })(
            <Radio.Group buttonStyle="solid">
              <Radio.Button value="exclude">过滤参数</Radio.Button>
              <Radio.Button value="include">指定参数</Radio.Button>
            </Radio.Group>
          )
        }
        <Tooltip title={TooltipTitle}>
          <Icon type="question-circle" style={{fontSize:"16px",marginLeft:10}}/>
        </Tooltip>,

      </FormItem>

      <FormItem {...formItemLayout} label={getFieldValue('extra')==='exclude'?"过滤参数":"指定参数"}>
        {
          getFieldDecorator(getFieldValue('extra'), {
            rules:[{
              required: getFieldValue('extra')==='include',
              message: '请指定参数',
            }],
            initialValue: record[getFieldValue('extra')],
          })(<Select
            mode='multiple'
            placeholder="请选择"
          >
            {uniqueValList.map((item, index) => {
              return (<Option value={item} key={index}>{item}</Option>);
            })}
          </Select>)
        }
      </FormItem>
    </div>
  )
};


const DatePickerOptionSettingForm = props => {
  console.log('DatePickerOptionSettingForm record', props.record);
  const { form: { getFieldDecorator, getFieldValue }, record } = props;
  return (
    <Fragment>
      <FormItem {...formItemLayout} label='指定开始时间'>
        {
          getFieldDecorator('startData', {
            initialValue: record.startData ? moment(record.startData, 'YYYY-MM-DD') : undefined,
          })(<DatePicker/>)
        }
      </FormItem>
      <FormItem {...formItemLayout} label='指定结束时间'>
        {
          getFieldDecorator('endData', {
            initialValue: record.endData ? moment(record.endData, 'YYYY-MM-DD') : undefined,
          })(<DatePicker/>)
        }
      </FormItem>
    </Fragment>

  );
};


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
    const { form: { getFieldsValue, getFieldValue }, onChange } = this.props;
    const { record } = this.state;
    const componentType = getFieldValue('componentType');
    let changeData = {};
    if (componentType === 'select' || componentType === 'multipleSelect') {
      const extraType = getFieldValue('extra');
      const value= getFieldsValue();

      if(extraType==='include')
        delete value.exclude;
      if(extraType==='exclude')
        delete value.include;

      delete value.startData;
      delete value.endData;
      delete value.extra;

      const { include, exclude, startData, endData, extra, ...other } = record;

      changeData = {
        ...other,
        ...value,
      };

    }

    if (componentType === 'datePicker') {
      const { startData, endData, ...otherValue } = getFieldsValue();
      if (startData === 'Invalid date' || endData === 'Invalid date') {
        changeData = {
          ...record,
          ...otherValue,
        };
        onChange(changeData);
        this.setModalVisible({ visible: false });
        return;
      }

      delete otherValue.exclude;
      delete otherValue.include;
      delete otherValue.extra;

      const { include, exclude,extra, ...other } = record;
      changeData = {
        ...other,
        ...getFieldsValue(),
        startData: moment(startData).format('YYYY-MM-DD'),
        endData: moment(endData).format('YYYY-MM-DD'),
      };

      // console.log(changeData);
    }
    onChange(changeData);
    this.setModalVisible({ visible: false });
  };

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

          {
            componentType === 'datePicker' ? (
              <DatePickerOptionSettingForm {...formOptions}/>
            ) : null
          }
        </Form>
      </Modal >
    );
  }
}
export default CSingleAdOptEditModal;
