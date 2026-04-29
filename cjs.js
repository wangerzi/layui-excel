// CJS entry point for lay-excel
// The UMD bundle (layui_exts/excel.js) sets window.LAY_EXCEL as a side effect.
// This CJS wrapper preserves backward compatibility for Node.js/webpack users.
// In Node.js environments, provide a minimal global object.
// See: https://github.com/wangerzi/layui-excel/issues/45
if (typeof window === 'undefined') {
  global.window = {};
}
require('./layui_exts/excel.js');
module.exports = window.LAY_EXCEL;
