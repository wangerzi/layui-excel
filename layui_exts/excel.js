/*
* @Author: Jeffrey Wang
* @Desc: 改造网络上 xlsx 代码而成，如有侵权，请联系我删掉重写(～￣▽￣)～ 
* @Date:   2018-03-24 09:54:17
* @Last Modified by:   Jeffrey Wang
* @Last Modified time: 2018-12-14 21:45:50
*/
layui.define(['xlsx'], function(exports){
	exports('excel', {
		saveAs : function(obj, fileName) {//可以自定义简单的下载文件实现方式 
		    var tmpa = document.createElement("a");
		    tmpa.download = fileName || "下载";
		    tmpa.href = URL.createObjectURL(obj); //绑定a标签
		    tmpa.click(); //模拟点击实现下载
		    setTimeout(function () { //延时释放
		        URL.revokeObjectURL(obj); //用URL.revokeObjectURL()来释放这个object URL
		    }, 100);
		},
		// const wopts = { bookType: 'xlsx', bookSST: false, type: 'binary' };//这里的数据是用来定义导出的格式类型
		// const wopts = { bookType: 'csv', bookSST: false, type: 'binary' };//ods格式
		// const wopts = { bookType: 'ods', bookSST: false, type: 'binary' };//ods格式
		// const wopts = { bookType: 'xlsb', bookSST: false, type: 'binary' };//xlsb格式
		// const wopts = { bookType: 'fods', bookSST: false, type: 'binary' };//fods格式
		// const wopts = { bookType: 'biff2', bookSST: false, type: 'binary' };//xls格式
		// 
		// 弹出下载框
		downloadExcel : function(data, filename, type) {
			type = type || 'xlsx';
			var wopts = { bookType: type, bookSST: false, type: 'binary' }
		    const wb = { SheetNames: ['Sheet1'], Sheets: {}, Props: {} };
		    wb.Sheets['Sheet1'] = XLSX.utils.json_to_sheet(data, { skipHeader: true});//通过json_to_sheet转成单页(Sheet)数据
		    this.saveAs(new Blob([this.s2ab(XLSX.write(wb, wopts))], { type: "application/octet-stream" }), filename + '.' + (wopts.bookType=="biff2"?"xls":wopts.bookType));
		},
		s2ab : function(s) {
		    if (typeof ArrayBuffer !== 'undefined') {
		        var buf = new ArrayBuffer(s.length);
		        var view = new Uint8Array(buf);
		        for (var i = 0; i != s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
		        return buf;
		    } else {
		        var buf = new Array(s.length);
		        for (var i = 0; i != s.length; ++i) buf[i] = s.charCodeAt(i) & 0xFF;
		        return buf;
		    }
		},
		/**
		 * 梳理导出的数据，包括字段排序和多余数据过滤
		 * @param  {[type]} data   [需要梳理的数据]
		 * @param  {[type]} fields [支持数组和对象，用于映射关系和字段排序]
		 * @return {[type]}        [description]
		 */
		filterExportData(data, fields) {
			// PS:之所以不直接引用 data 节省内存，是因为担心如果 fields 可能存在如下情况： { "id": 'test_id', 'test_id': 'new_id' }，会导致处理异常
			var exportData = [];
			var true_fields = [];
			// filed 支持两种模式，数组则单纯排序，对象则转换映射关系，为了统一处理，将数组转换为符合要求的统一对象
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