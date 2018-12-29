/*
* @Author: Jeffrey Wang
* @Desc:  整理强大的 SheetJS 功能，依赖 XLSX.js 和 FileSaver
* @Version: v1.1
* @Date:   2018-03-24 09:54:17
* @Last Modified by:   Jeffrey Wang
* @Last Modified time: 2018-12-29 12:06:18
*/
layui.define(['jquery', 'xlsx', 'FileSaver'], function(exports){
	exports('excel', {
		// 导出Excel
		exportExcel : function(data, filename, type, opt) {
			type = type ? type : 'xlsx';
			filename = filename ? filename : '导出数据.'+type;

			// 创建一个 XLSX 对象
			var wb = XLSX.utils.book_new();
			// 1. 定义excel对的基本属性
			var Props = {
				Title: filename,
				Subject: 'Export From web browser',
				Author: "excel.wj2015.com",
				CreatedData: new Date(),
			};
			opt && $.extend(Props, opt.Props);
			wb.Props = Props;
			// 2. 设置sheet名称
			var sheet_name = 'sheet1';
			wb.SheetNames.push(sheet_name);
			// 3. 分配工作表对象到 sheet
			var ws = XLSX.utils.aoa_to_sheet(this.filterDataToAoaData(data));
			wb.Sheets[sheet_name] = ws;

			// 4. 输出工作表
			var wbout = XLSX.write(wb, {bookType: type, type: 'binary'});

			// 5. 跨浏览器支持，采用 FileSaver 三方库
			saveAs(new Blob([this.s2ab(wbout)], {type: "application/octet-stream"}), filename);
		},
		/**
		 * 将二进制数据转为8位字节
		 * @param  {[type]} s [description]
		 * @return {[type]}   [description]
		 */
		s2ab: function(s) {
			var buf = new ArrayBuffer(s.length);
			var view = new Uint8Array(buf);
			for (var i = 0; i < s.length; i++) {
				view[i] = s.charCodeAt(i) & 0xFF;
			}
			return buf;
		},
		/**
		 * 将导出的数据格式，转换为可以aoa导出的格式
		 * @return {[type]} [description]
		 */
		filterDataToAoaData: function(filterData){
			var aoaData = [];
			layui.each(filterData, function(index, item) {
				var itemData = [];
				for (var i in item) {
					itemData.push(item[i]);
				}
				aoaData.push(itemData);	
			});
			return aoaData;
		},
		/**
		 * 梳理导出的数据，包括字段排序和多余数据过滤
		 * @param  {[type]} data   [需要梳理的数据]
		 * @param  {[type]} fields [支持数组和对象，用于映射关系和字段排序]
		 * @return {[type]}        [description]
		 */
		filterExportData: function(data, fields) {
			// PS:之所以不直接引用 data 节省内存，是因为担心如果 fields 可能存在如下情况： { "id": 'test_id', 'test_id': 'new_id' }，会导致处理异常
			var exportData = [];
			var true_fields = [];
			// filed 支持两种模式，数组则单纯排序，对象则转换映射关系，为了统一处理，将数组转换为符合要求的映射关系对象
			if (Array.isArray(fields)) {
				for (var i in fields) {
					true_fields[fields[i]] = fields[i];
				}
			} else {
				true_fields = fields;
			}
			for (i in data) {
				var item = data[i];
				exportData[i] = {};
				for (key in true_fields) {
					var old_field_name = key;
					var new_field_name = true_fields[key];
					if (typeof item[old_field_name] != 'undefined') {
						exportData[i][new_field_name] = item[old_field_name];
					} else {
						exportData[i][new_field_name] = '';
					}
				}
			}
			return exportData;
		}
	});
});