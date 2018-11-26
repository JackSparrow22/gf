import React, { Component } from 'react';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import CSingleNormalSearchForm from './components/CSingleNormalSearchForm';
import CSingleAdvanceSearchForm from './components/CSingleAdvanceSearchForm';
import { connect } from 'dva';
import moment from 'moment';
import {
  Row,
  Col,
  Card,
  Form,
  Input,
  Select,
  Icon,
  Button,
  Dropdown,
  Menu,
  InputNumber,
  DatePicker,
  Modal,
  message,
  Badge,
  Divider,
  Steps,
  Radio,
  Table,
  Checkbox,
} from 'antd';
import CSingleSearchTable from './components/CSingleSearchTable';

const offset = 0;
const limit = 10;

@Form.create()
@connect(({ sceneAdvance }) => ({
  sceneAdvance,
}))

class AdvanceSearch extends Component {
  constructor(props) {
    super(props);
    this.state = { searchCondition: {} };
  }


  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'sceneAdvance/resetState',
      payload: {},
    });
  }

  handleSubmitAdvanceSearch = (values={}) => {
    const { sceneAdvance, dispatch } = this.props;

    console.log('values', values);

    const { result } = sceneAdvance.schema;
    const condition = Object.keys(values).map(key => ({
      key: JSON.parse(key).key,
      value: values[key],
      componentType: JSON.parse(key).componentType,
    }));
    let effectCondition = condition.filter(item => item.value !== undefined);

    effectCondition = effectCondition.map(item => {
      const { componentType, ...other } = item;
      if (componentType === 'datePicker') {
        return {
          ...other,
          value: [moment(item.value[0]).format('YYYY-MM-DD hh:mm:ss'), moment(item.value[1]).format('YYYY-MM-DD hh:mm:ss')],
          type: 2,
        };
      }
      return { ...other, value: Array.isArray(item.value) ? item.value : new Array(item.value), type: 1 };
    });

    const targetField = [];
    Object.keys(result).forEach(key => {
      targetField.push(result[key].key);
    });

    const formData = {
      index: sceneAdvance.schema.index,
      condition: effectCondition,
      targetField,
      limit,
      offset,
    };

    this.setState({ searchCondition: formData });

    dispatch({
      type: 'sceneAdvance/fetchAdvanceSearchData',
      payload: formData,
    });

    console.log(formData);
  };


  render() {
    const { sceneAdvance, dispatch, match } = this.props;
    const { id } = match.params;
    const { searchCondition } = this.state;

    // console.log('父组件',sceneAdvance.schema.advance)

    const CSingleAdvanceSearchFormParam = {
      handleSubmitSearch: this.handleSubmitAdvanceSearch,
      advance: sceneAdvance.schema.advance,
      index: sceneAdvance.schema.index,
      selectOptions: sceneAdvance.selectOptions,
      dispatch,
      id,
    };

    const CSingleSearchTableParam = {
      result: sceneAdvance.schema.result,
      data: sceneAdvance.data,
      total: sceneAdvance.total,
      dispatch,
      searchCondition,
      dispatchType: 'sceneAdvance/fetchAdvanceSearchData',
    };

    return (
      <PageHeaderWrapper>
        <CSingleAdvanceSearchForm {...CSingleAdvanceSearchFormParam} />
        {sceneAdvance.total >= 0 ? <CSingleSearchTable {...CSingleSearchTableParam} /> : ''}
      </PageHeaderWrapper>
    );
  }
}

export default AdvanceSearch;
