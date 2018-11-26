// es service 数据连调
import { isEmpty } from 'lodash'
import indices from './json/indices'
import account_type from './json/account_type'
import acct_card_no from './json/acct_card_no'
import business_type from './json/business_type'
import gdda_ik_20181024 from './json/gdda_ik_20181024'
import ibbd_pub_cust_info from './json/ibbd_pub_cust_info'
import ibbd_t_khda_check_wf_item from './json/ibbd_t_khda_check_wf_item'
import ibbd_t_khda_folder from './json/ibbd_t_khda_folder'
import ibbd_t_khda_info_temp_jn from './json/ibbd_t_khda_info_temp_jn'
import ibbd_t_khda_info_temp from './json/ibbd_t_khda_info_temp'
import ibbd_t_khda_suff_temp from './json/ibbd_t_khda_suff_temp'
import schemas from './json/schemas'
import schema18 from './json/schema18'
import schema19 from './json/schema19'
import schema23 from './json/schema23'
import schema25 from './json/schema25'
import schema27 from './json/schema27'
import schema28 from './json/schema28'
import schema29 from './json/schema29'
import schema30 from './json/schema30'
import schema17 from './json/schema17'
import schema24 from './json/schema24'


const getUniqueValueInField = (req, res) => {
    const { query: { query } } = req;
    const { index, field, size } = JSON.parse(query);
    console.log(index, field, size)
    return res.send({
        "code": 0,
        "error": {
            "msg": ""
        },
        "data": [
            "零售业务系统请示",
            "部门盖章",
            "收文管理",
            "红冲蓝补",
            "零售系统",
            "总部请示",
            "总部部门"
        ]
    })
}

const getIndexDetail = (req, res) => {
    const { url } = req;
    const matchArr = url.match(/^\/api\/v1\/indices\/(.+)$/)

    if (matchArr) {
        switch (matchArr[1]) {
            case 'ibbd_pub_cust_info': return res.json(ibbd_pub_cust_info);
            case 'ibbd_t_khda_folder': return res.json(ibbd_t_khda_folder);
            case 'ibbd_t_khda_info_temp': return res.json(ibbd_t_khda_info_temp);
            case 'ibbd_t_khda_info_temp_jn': return res.json(ibbd_t_khda_info_temp_jn);
            case 'ibbd_t_khda_check_wf_item': return res.json(ibbd_t_khda_check_wf_item);
            case 'ibbd_t_khda_suff_temp': return res.json(ibbd_t_khda_suff_temp);
            default: return res.json({})
        }
    }
}

const getSchemaDetail = (req, res) => {
    const { url } = req;
    const matchArr = url.match(/^\/api\/v1\/rules\/(\d+)$/)
    if (matchArr) {
        switch (parseInt(matchArr[1])) {
            case 18: return res.json(schema18);
            case 19: return res.json(schema19);
            case 23: return res.json(schema23);
            case 25: return res.json(schema25);
            case 27: return res.json(schema27);
            case 28: return res.json(schema28);
            case 29: return res.json(schema29);
            case 30: return res.json(schema30);
            case 17: return res.json(schema17);
            case 24: return res.json(schema24);
        }
    }
}



export default {
    'GET /api/v1/indices': indices,
    'GET /api/v1/indices/:name': getIndexDetail,
    'GET /api/v1/indices/field': getUniqueValueInField,
    'GET /api/v1/rules': schemas,
    'GET /api/v1/rules/:id': getSchemaDetail
};
