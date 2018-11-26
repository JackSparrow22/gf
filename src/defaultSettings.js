module.exports = {
  navTheme: 'dark', // theme for nav menu
  primaryColor: '#1890FF', // primary color of ant design
  layout: 'sidemenu', // nav menu position: sidemenu or topmenu
  contentWidth: 'Fluid', // layout of content: Fluid or Fixed, only works when layout is topmenu
  fixedHeader: false, // sticky header
  autoHideHeader: false, // auto hide header
  fixSiderbar: false, // sticky siderbar

  //查询中间件服务地址
  // host: 'http://10.2.226.32:7001/api/v1'
  host: 'http://192.168.80.243:7001/api/v1',
  //243
  //host: 'http://192.168.80.243:7001/api/v1',
  //本机
  //host: 'http://127.0.0.1:7001/api/v1'
  //unit test  or mock
  // host: 'http://localhost:8000/api/v1'



};
