// ESM entry point for lay-excel
// The UMD bundle (layui_exts/excel.js) sets window.LAY_EXCEL as a side effect.
// This ESM wrapper allows Vite/Rollup to correctly resolve the default export.
// See: https://github.com/wangerzi/layui-excel/issues/45
import './layui_exts/excel.js';

const LAY_EXCEL = window.LAY_EXCEL;
export default LAY_EXCEL;
export { LAY_EXCEL };
