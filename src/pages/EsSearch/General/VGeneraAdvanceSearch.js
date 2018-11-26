import React, { Component } from 'react';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import CGeneraAdvanceSearchForm from './components/CGeneraAdvanceSearchForm';
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
import CGeneraSearchTable from './components/CGeneraSearchTable';

const offset = 0;
const limit = 10;

@Form.create()
@connect(({ generalSearch }) => ({
  generalSearch,
}))

class AdvanceSearch extends Component {
  constructor(props) {
    super(props);
    this.state = { searchCondition: {} };
  }

  componentDidMount() {
    const { dispatch, match } = this.props;
    const { index } = match.params;
    if (!index || index === '') return;
    dispatch({
      type: 'generalSearch/getOption',
      payload: { index },
    });
  }


  componentWillUnmount() {
    // const { dispatch,  } = this.props;
    //
    // dispatch({
    //   type: 'generalSearch/getOption',
    //   payload: { index },
    // });
  }

  handleSubmitAdvanceSearch = (values = {}) => {
    const { generalSearch: { schema }, dispatch, match } = this.props;
    const { index } = match.params;

    if (!index || index === undefined || index === '') return;

    const row = schema.rows.filter(item => item.index === index);

    const { result } = row[0];
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
      index,
      condition: effectCondition,
      targetField,
      limit,
      offset,
    };

    this.setState({ searchCondition: formData });

    dispatch({
      type: 'generalSearch/fetchAdvanceSearchData',
      payload: formData,
    });

    console.log(formData);
  };


  render() {
    const { generalSearch:{searchData, total, schema, selectOptions}, dispatch, match } = this.props;
    const { index } = match.params;
    const { searchCondition } = this.state;
    const row = schema.rows.filter(item => item.index === index);

    const searchParam = {
      handleSubmitSearch: this.handleSubmitAdvanceSearch,
      advance: row[0] ? row[0].advance : [],
      index,
      selectOptions,
      dispatch,
    };
    console.log(searchParam);

    const tableParam = {
      result: row[0] ? row[0].result : [],
      data: searchData,
      total,
      dispatch,
      searchCondition,
      dispatchType: 'generalSearch/fetchAdvanceSearchData',
    };

    return (
      <PageHeaderWrapper>
        <CGeneraAdvanceSearchForm {...searchParam} />
        {total >= 0 ? <CGeneraSearchTable {...tableParam} /> : ''}
      </PageHeaderWrapper>
    );
  }
}

export default AdvanceSearch;
