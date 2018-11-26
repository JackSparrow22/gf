import React, { Component } from 'react';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
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
import CSingleNormalSearchForm from './components/CSingleNormalSearchForm';
import CSingleSearchTable from './components/CSingleSearchTable';


@Form.create()
@connect(({ singleNormal }) => ({
  singleNormal,
}))

class NormalSearch extends Component {
  constructor(props) {
    super(props);
    this.state = {
      searchCondition:{}
    };

  }


  componentDidMount() {
    const { id } = this.props.match.params;
    if (id === undefined) {
      message.warning('url错误的参数');
      return;
    }

    const { dispatch } = this.props;
    dispatch({
      type: 'singleNormal/fetchSchema',
      payload: { id },
    });

  }

  componentWillUnmount(){
    const { dispatch } = this.props;
    dispatch({
      type: 'singleNormal/resetState',
      payload: {} ,
    });
  }


  handleSubmitNormalSearch = (values) => {
    const { dispatch, singleNormal } = this.props;
    const { index, result} = singleNormal.schema;

    const displayField = [];

    Object.keys(result).forEach((key) => {
      // if (result[key].selected) {
      //   displayField.push(result[key].key);
      // }
      displayField.push(result[key].key);
    });

    const searchCondition = { index, ...values, offset: 0, limit: 10,targetField: displayField};
    dispatch({
      type: 'singleNormal/fetchNormalSearchData',
      payload: searchCondition,
    });

    this.setState({searchCondition});


    console.log(searchCondition)

  };


  render() {

    const { singleNormal, dispatch, match } = this.props;
    const {searchCondition} = this.state;
    const { id } = match.params;
    console.log(singleNormal.schema);

    const CSingleNormalSearchFormParam = {
      handleSubmitSearch: this.handleSubmitNormalSearch,
      level: singleNormal.schema.normal,
      id,
    };

    const CSingleNormalSearchTableParam = {
      result: singleNormal.schema.result,
      data: singleNormal.data,
      total: singleNormal.total,
      dispatch,
      searchCondition,
      dispatchType:'singleNormal/fetchNormalSearchData'
    };

    return (
      <PageHeaderWrapper>
        <CSingleNormalSearchForm {...CSingleNormalSearchFormParam} />
        {singleNormal.total >= 0 ? <CSingleSearchTable {...CSingleNormalSearchTableParam} /> : ''}
      </PageHeaderWrapper>
    );
  }
}

export default NormalSearch;
