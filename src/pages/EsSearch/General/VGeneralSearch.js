import React, { Component } from 'react';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import { connect } from 'dva';
import moment from 'moment';
import router from 'umi/router';
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
  List,
} from 'antd';

import CSearchForm from './components/CSearchForm';
import styles from './style.less';


function ListItem(props) {
  const { value, index } = props;
  return (
    <List.Item>
      <strong>{index+1}:&nbsp;</strong>
      {
        Object.keys(value).map((key, index) =>
          value[key] === '' || index >= 4 ? '' : <nobr key={key}>{key}:{value[key]} &nbsp;&nbsp;</nobr>,
        )
      }
    </List.Item>
  );

}

@Form.create()
@connect(({ generalSearch }) => ({
  generalSearch,
}))

class VGeneralSearch extends Component {
  constructor(props) {
    super(props);
    this.state = { searchCondition: {} };
  }


  componentDidMount() {
    const { dispatch, match: { params } } = this.props;
    const { id } = params;
    if (!id) {
      message.warning('参数异常');
      return;
    }

    dispatch({
      type: 'generalSearch/fetchRuleCost',
      payload: { id },
    });
  }

  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'generalSearch/reset',
      payload: { field:"cardArr" },
    });
  }

  /**
   *
   * @param condition
   * exclude: ""
   * keyword: ""
   * sourceIndex:['index1','index2']
   *
   * @param options
   * 别名与index的映射 {alias:"",index:""}
   */

  handleSearch = (condition, options) => {
    const { dispatch } = this.props;
    const { exclude, keyword, sourceIndex } = condition;

    dispatch({
      type: 'generalSearch/reset',
      payload: { field:"cardArr" },
    });

    sourceIndex.forEach(index => {
      const { alias } = options.filter(item => item.value === index)[0];
      const formData = {
        index,
        exclude,
        keyword,
        sourceField: [],
        targetField: [],
        limit: 3,
      };
      dispatch({
        type: 'generalSearch/search',
        payload: { formData, alias },
      });

    });

    this.setState({ searchCondition: condition });
  };

  onCardClick = (index) =>{
    router.push(`/essearch/general/search/advance/${index}`);
  };

  render() {
    const { searchCondition: { exclude, keyword, sourceIndex } } = this.state;
    const { generalSearch: { cardArr } } = this.props;

    return (
      <PageHeaderWrapper>
        <CSearchForm handleSearch={this.handleSearch}/>
        <Card style={{ marginTop: 20 }} bordered={false}>
          <Row gutter={32}>
            {
              cardArr.map(item => (
                <Col xl={12} lg={12} md={12} sm={24} xs={24} key={item.index} style={{minHeight:"292px"}}>
                  <Card title={<span style={{ fontWeight: 'bold', margin: 0, overflow:"hidden",}}>{item.alias}<Divider type="vertical"/>搜索结果</span>} className={styles.box} onClick={()=>this.onCardClick(item.index)}>
                    <div>
                      <List
                        size="small"
                        bordered={false}
                        dataSource={item.data}
                        renderItem={(value, index) => (<ListItem value={value} index={index}/>)}
                      />
                      {item.data.length >0 ?<p style={{ margin: 0,padding:"20px 0 0 0" }}>找到{item.total}条相关结果 &nbsp;&nbsp;<a>点击查看详情</a></p>:""}
                    </div>
                  </Card>
                </Col>
              ))
            }
          </Row>
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default VGeneralSearch;
