/*
* @Author: Jeffrey Wang
* @Desc:  整理强大的 SheetJS 功能，依赖 XLSX.js 和 FileSaver
* @Version: v1.2
* @Date:   2018-03-24 09:54:17
* @Last Modified by:   Jeffrey Wang
* @Last Modified time: 2019-01-03 13:44:48
*/
layui.define(['jquery', 'xlsx', 'FileSaver'], function(exports){
	var $ = layui.jquery;
	exports('excel', {
		/**
		 * 导出Excel并弹出下载框，具体使用方法和范围请参考文档
		 * @param  {[type]} data     [description]
		 * @param  {[type]} filename [description]
		 * @param  {[type]} type     [description]
		 * @param  {[type]} opt      [description]
		 * @return {[type]}          [description]
		 */
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
				Manager: '',
				Company: '',
				Category: '',
				Keywords: '',
				Comments: '',
				LastAuthor: '',
				CreatedData: new Date(),
			};
			opt && $.extend(Props, opt.Props);
			wb.Props = Props;
			// 2. 设置sheet名称
			var sheet_name = 'sheet1';
			wb.SheetNames.push(sheet_name);
			// 3. 分配工作表对象到 sheet
			var is_aoa = false;
			if (data.length && data[0] && $.isArray(data[0])) {
				is_aoa = true;
			}
			if (is_aoa) {
				var ws = XLSX.utils.aoa_to_sheet(data);
			} else {
				var opt = {};
				if (data.length) {
					opt.headers = data.unshift();
					opt.skipHeader = true;
				}
				var ws = XLSX.utils.json_to_sheet(data, opt);
			}
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
			console.log(filterData.length);
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
		 * 梳理导出的数据，包括字段排序和多余数据过滤，具体功能请参见文档
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
					var new_field_name = key;
					var old_field_name = true_fields[key];
					// 如果传入的是回调，则回调的值则为新值
					if (typeof old_field_name == 'function' && old_field_name.apply) {
						exportData[i][new_field_name] = old_field_name.apply(window, [item[new_field_name], item, data]);
					} else {
						if (typeof item[old_field_name] != 'undefined') {
							exportData[i][new_field_name] = item[old_field_name];
						} else {
							exportData[i][new_field_name] = '';
						}
					}
				}
			}
			return exportData;
		},
		/**
		 * 梳理导入的数据，参数意义可参考 filterExportData
		 * @param  {[type]} data   [description]
		 * @param  {[type]} fields [description]
		 * @return {[type]}        [description]
		 */
		filterImportData: function(data, fields) {
			var that = this;
			layui.each(data, function(fileindex, xlsx) {
				layui.each(xlsx, function(sheetname, content) {
					xlsx[sheetname] = that.filterExportData(content, fields);
				});
			});
			return data;
		},
		/**
		 * 读取Excel，支持多文件多表格读取
		 * @param  {[type]}   files    [description]
		 * @param  {[type]}   opt      [description]
		 * @param  {Function} callback [description]
		 * @return {[type]}            [description]
		 */
		importExcel: function(files, opt, callback) {
			var option = {
				header: 'A',
				range: null,
				fields: null,
			};
			$.extend(option, opt);
			var that = this;

			if (files.length < 1) {
				throw {code: 999, 'message': '传入文件为空'};
			}
			var supportReadMime = [
				'application/vnd.ms-excel',
				'application/msexcel',
				'application/x-msexcel',
				'application/x-ms-excel',
				'application/x-excel',
				'application/x-dos_ms_excel',
				'application/xls',
				'application/x-xls',
				'application/vnd-xls',
				'application/csv',
				'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
			];
			layui.each(files, function(index, item) {
				if (supportReadMime.indexOf(item.type) == -1) {
					throw {code: 999, message: item.name+'（'+item.type+'）为不支持的文件类型'};
				}
			});

			// 按照二进制读取
			var data = {};
			layui.each(files, function(index, item) {
				var reader = new FileReader();
				if (!reader) {
					throw {code: 999, message: '不支持FileReader，请更换更新的浏览器'};
				}
				// 读取excel表格对象
				reader.onload = function(ev) {
					var wb = XLSX.read(ev.target.result, {
						type: 'binary',
					});
					var excelData = {};
					layui.each(wb.Sheets, function(sheet, sheetObj) {
						// 全为空的去掉
						if (wb.Sheets.hasOwnProperty(sheet)) {
							var opt = {
								header: option.header,
							}
							if (!option.range) {
								opt.range = option.range;
							}
							excelData[sheet] = XLSX.utils.sheet_to_json(sheetObj, opt);
							// 支持梳理数据
							if (option.fields) {
								excelData[sheet] = that.filterExportData(excelData[sheet], option.fields);
							}
						}
					});
					data[index] = excelData;
					// 全部读取完毕才执行
					if (index == files.length - 1) {
						callback && callback.apply && callback.apply(window, [data]);
					}
				}
				reader.readAsBinaryString(item);
			});
		}
	});
});