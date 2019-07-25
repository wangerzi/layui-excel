/*
* @Author: Jeffrey Wang
* @Desc:  整理强大的 SheetJS 功能，依赖 XLSX.js 和 FileSaver
* @Version: v1.4
* @Date:   2018-03-24 09:54:17
* @Last Modified by:   Jeffrey Wang
* @Last Modified time: 2019-01-15 11:49:09
*/
if (typeof layui === 'undefined' && typeof jQuery === 'undefined') {
	console.error('非layui调用请先加载jQuery')
}
if (typeof jQuery !== 'undefined') {
  $ = jQuery
}
LAY_EXCEL = {
  /**
   * 兼容老版本的导出函数
   * @param  {[type]} data     [description]
   * @param  {[type]} filename [description]
   * @param  {[type]} type     [description]
   * @return {[type]}          [description]
   */
  downloadExl: function(data, filename, type) {
    type = type ? type : 'xlsx';
    this.exportExcel({sheet1: data}, filename+'.'+type, type, null);
  },
  /**
   * 导出Excel并弹出下载框，具体使用方法和范围请参考文档
   * @param data object
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
    opt && opt.Props && (Props = $.extend(Props, opt.Props));
    // 默认进行压缩
    wb.compression = opt ? opt.compression : true
    if(wb.compression !== false) {
      wb.compression = true
    }
    wb.Props = Props;
    // 特殊属性实现，比如合并单元格
    var wbExtend = {
      '!merges': null
      ,'!margins': null
      ,'!cols': null
      ,'!rows': null
      ,'!protect': null
      ,'!autofilter': null
    };
    opt && opt.extend && (wbExtend = $.extend(wbExtend, opt.extend));
    // 清理空配置
    for (var key in wbExtend) {
      if (!wbExtend.hasOwnProperty(key)) {
        continue;
      }
      if (!wbExtend[key]) {
        delete wbExtend[key];
      }
    }

    // 判断 data 如果是 sheet 级别数据，自动加 sheet1
    if ($.isArray(data)) {
      data = {sheet1: data};
    }

    for(var sheet_name in data) {
      if (!data.hasOwnProperty(sheet_name)) {
        continue;
      }
      var content = data[sheet_name];
      // 2. 设置sheet名称
      wb.SheetNames.push(sheet_name);
      // 3. 分配工作表对象到 sheet
      var is_aoa = false;
      if (content.length && content[0] && $.isArray(content[0])) {
        is_aoa = true;
      }
      if (is_aoa) {
        ws = XLSX.utils.aoa_to_sheet(content);
      } else {
        var option = {};
        if (content.length) {
          option.headers = content.unshift();
          option.skipHeader = true;
          // 分离并重组样式
          var splitRes = this.splitContent(content);
        }
        var ws = XLSX.utils.json_to_sheet(content, option);
        // 特殊属性，支持单独设置某个sheet的属性
        if (wbExtend[sheet_name]) {
          $.extend(ws, wbExtend[sheet_name]);
        } else {
          $.extend(ws, wbExtend);
        }
        // 合并样式
        if (typeof splitRes !== 'undefined') {
          this.mergeCellOpt(ws, splitRes.style);
        }
      }
      wb.Sheets[sheet_name] = ws;
    };

    // 4. 输出工作表
    var wbout = XLSX.write(wb, {bookType: type, type: 'binary', cellStyles: true, compression: wb.compression});

    // 5. 跨浏览器支持，采用 FileSaver 三方库
    saveAs(new Blob([this.s2ab(wbout)], {type: "application/octet-stream"}), filename);
  },
  /**
   * 分离内容和样式
   * @param  {[type]} content [description]
   * @return {[type]}         [description]
   */
  splitContent: function(content) {
    var styleContent = {};
    // 扫描每个单元格，如果是对象则等表格转换完毕后分离出来重新赋值
    for (var line = 0; line < content.length; line++) {
      var lineData = content[line];
      var rowIndex = 0;
      for (var row in lineData) {
        if (!lineData.hasOwnProperty(row)) {
          continue;
        }
        var rowData = lineData[row];
        if (typeof rowData === 'object') {
          // typeof null == object
          if (rowData !== null) {
            styleContent[this.numToTitle(rowIndex+1)+(parseInt(line)+1)] = rowData;
          } else {
            lineData[row] = '';
          }
        } else {
          // JeffreyWang 2019-03-10针对 0 的hack处理
          if (rowData === 0) {
            rowData = {
              v: '0',
              s: {
                alignment: {
                  horizontal: 'right'
                }
              }
            }
          }
          styleContent[this.numToTitle(rowIndex+1)+(parseInt(line)+1)] = rowData;
        }
        rowIndex++;
      }
    }
    return {
      content: content,
      style: styleContent
    };
  },
  /**
   * 合并内容和样式
   * @param  {[type]} ws    [description]
   * @param  {[type]} style [description]
   * @return {[type]}       [description]
   */
  mergeCellOpt: function(ws, style) {
    for (var row in style) {
      if (!style.hasOwnProperty(row)) {
        continue;
      }
      var rowOpt = style[row];
      if (ws[row]) {
        // 其他属性做一个初始化
        var otherOpt = ['t', 'w', 'f', 'r', 'h', 'c', 'z', 'l', 's'];
        for (var i = 0; i < otherOpt.length; i++) {
          ws[row][otherOpt[i]] = ws[row][otherOpt[i]];
        }
        $.extend(ws[row], rowOpt);
      }
    }
  },
  /**
   * 将table转换为JSON数据
   * @param dom
   */
  tableToJson: function(dom) {
    dom = $(dom)

    var head = []
    dom.find('thead > tr').each(function () {
      var line = []
      $(this).find('td,th').each(function () {
        line.push($(this).text())
      })
      head.push(line)
    })

    var body = [];
    dom.find('tbody > tr').each(function () {
      var line = []
      $(this).find('td').each(function () {
        line.push($(this).text())
      })
      body.push(line)
    })

    return {
      head: head,
      body: body
    }
  },
  // 测试代码：
  // 		for(i=1;i<100;i++){var change = layui.excel.numToTitle(i);console.log(i, change, layui.excel.titleToNum(change));}
  // numsToTitle备忘录提效
  numsTitleCache: {},
  // titleToTitle 备忘录提效
  titleNumsCache: {},
  /**
   * 将数字(从一开始)转换为 A、B、C...AA、AB
   * @param  {[int]} num [description]
   * @return {[type]}     [description]
   */
  numToTitle: function(num) {
    if (this.numsTitleCache[num]) {
      return this.numsTitleCache[num];
    }
    var ans = '';
    if (num > 26) {
      // 要注意小心 26 的倍数导致的无限递归问题
      var dec = num % 26;
      ans = this.numToTitle((num - dec)/26) + this.numToTitle(dec?dec:26);
      this.numsTitleCache[num] = ans;
      this.titleNumsCache[ans] = num;
      return ans;
    } else {
      // A 的 ascii 为 0，顺位相加
      ans = String.fromCharCode(64 + num);
      this.numsTitleCache[num] = ans;
      this.titleNumsCache[ans] = num;
      return ans;
    }
  },
  /**
   * 将A、B、AA、ABC转换为 1、2、3形式的数字
   * @param  {[type]} title [description]
   * @return {number}       [description]
   */
  titleToNum: function(title) {
    if (this.titleNumsCache[title]) {
      return this.titleNumsCache[title];
    }
    var len = title.length;
    var total = 0;
    for (var index in title) {
      if (!title.hasOwnProperty(index)) {
        continue;
      }
      var char = title[index];
      var code = char.charCodeAt() - 64;
      total += code * Math.pow(26, len - index - 1);
    }
    this.numsTitleCache[total] = title;
    this.titleNumsCache[title] = total;
    return total;
  },
  /**
   * 批量设置单元格属性
   * @param  {array} data     [sheet级别的数据]
   * @param  {string} range		 [范围字符串，比如 A1:C12，开始位置默认 A1，结束位置默认整个表格右下角]
   * @param  {object} config   [批量设置的单元格属性]
   * @param  {function} filter   [回调函数，传递函数生效，返回值作为新的值（可用于过滤、规则替换样式等骚操作）]
   * @return {array}          [重新渲染后的 sheet 数据]
   */
  setExportCellStyle: function(data, range, config, filter) {
    if (typeof data !== 'object' || !data.length || !data[0] || !Object.keys(data[0]).length) {
      return [];
    }

    // 以 rowIndex 为键，field 为值
    var fieldKeys = Object.keys(data[0]);
    var maxCol = fieldKeys.length - 1;
    var maxRow = data.length -1;
    // 默认 A1 ~ 右下角
    var startPos = {c: 0, r: 0};
    var endPos = {c: maxCol, r: maxRow};

    if (range && typeof range === 'string') {
      var rangeArr = range.split(':');
      if (rangeArr[0].length) {
        startPos = this.splitPosition(rangeArr[0]);
      }
      if (typeof rangeArr[1] !== 'undefined' && rangeArr[1] !== '') {
        endPos = this.splitPosition(rangeArr[1]);
      }
    } else {
      // pass
    }
    // position范围限制 - 考虑到特殊情况取消此限制
    // startPos.c = startPos.c < maxCol ? startPos.c : maxCol;
    // endPos.c = endPos.c < maxCol ? endPos.c : maxCol;
    // startPos.r = startPos.r < maxRow ? startPos.r : maxRow;
    // endPos.r = endPos.r < maxRow ? endPos.r : maxRow;

    if (startPos.c > endPos.c) {
      console.error('开始列不得大于结束列');
    }
    if (startPos.r > endPos.r) {
      console.error('开始行不得大于结束行');
    }

    // 遍历范围内的数据，进行样式设置，按从上到下从左到右按行遍历
    for (var currentRow = startPos.r; currentRow <= endPos.r; currentRow++) {
      for (var currentCol = startPos.c; currentCol <= endPos.c; currentCol++) {
        // 如果有回调则执行回调判断，否则全部更新，如果遇到超出数据范围的，自动置空
        var row = data[currentRow];
        if (!row) {
          row = {};
          for (var key = 0; key < fieldKeys.length; key++) {
            row[fieldKeys[key]] = '';
          }
          data[currentRow] = row;
        }
        var cell = row[fieldKeys[currentCol]];
        var newCell = null;
        if (cell === null || cell === undefined) {
          cell = '';
        }

        // 手工合并（相同的则以当前函数config为准）
        if (typeof cell === 'object') {
          newCell = $.extend(true, {}, cell, config);
        } else {
          newCell = $.extend(true, {}, {v: cell}, config);
        }

        if (
          typeof filter === 'function'
        ) {
          newCell = filter(cell, newCell, row, config, currentRow, currentCol, fieldKeys[currentCol]);
        } else {
        }
        // 回写
        data[currentRow][fieldKeys[currentCol]] = newCell;
      }
    }
    return data;
  },
  /**
   * 合并单元格快速生成配置的函数 传入 [ ['开始坐标 A1', '结束坐标 D2'], ['开始坐标 B2', '结束坐标 E3'] ]
   * @param  {[type]} origin [description]
   * @return {[type]}        [description]
   */
  makeMergeConfig: function(origin) {
    var merge = [];
    for (var index = 0; index < origin.length; index++) {
      merge.push({
        s: this.splitPosition(origin[index][0]),
        e: this.splitPosition(origin[index][1]),
      });
    }
    return merge;
  },
  /**
   * 自动生成列宽配置
   * @param  {$ObjMap} data    [A、B、C的宽度映射]
   * @param  {number} defaultNum [description]
   * @return {$ObjMap}         [description]
   */
  makeColConfig: function(data, defaultNum) {
    defaultNum = defaultNum > 0 ? defaultNum : 50;
    // 将列的 ABC 转换为 index
    var change = [];
    var startIndex = 0;
    for (var index in data) {
      if (!data.hasOwnProperty(index)) {
        continue;
      }
      var item = data[index];
      if (index.match && index.match(/[A-Z]*/)) {
        var currentIndex = this.titleToNum(index) - 1;
        // 填充未配置的单元格
        while (startIndex < currentIndex) {
          change.push({wpx: defaultNum});
          startIndex++;
        }
        startIndex = currentIndex+1;
        change.push({wpx: item > 0 ? item : defaultNum});
      }
    };
    return change;
  },
  /**
   * 自动生成列高配置
   * @param  {[type]} data    [description]
   * @param  {[type]} defaultNum [description]
   * @return {[type]}         [description]
   */
  makeRowConfig: function(data, defaultNum) {
    defaultNum = defaultNum > 0 ? defaultNum : 10;
    // 将列的 ABC 转换为 index
    var change = [];
    var startIndex = 0;
    for (var index in data) {
      if (!data.hasOwnProperty(index)) {
        continue;
      }
      var item = data[index];
      if (index.match && index.match(/[0-9]*/)) {
        var currentIndex = parseInt(index) - 1;
        // 填充未配置的行
        while (startIndex < currentIndex) {
          change.push({hpx: defaultNum});
          startIndex++;
        }
        startIndex = currentIndex+1;
        change.push({hpx: item > 0 ? item : defaultNum});
      }
    };
    return change;
  },
  /**
   * 将A1分离成 {c: 0, r: 0} 格式的数据
   * @param  {string} pos [description]
   * @return {{r: number, c: number}}     [description]
   */
  splitPosition: function(pos) {
    var res = pos.match('^([A-Z]+)([0-9]+)$');
    if (!res) {
      return {c: 0, r: 0};
    }
    // 转换结果相比需要的结果需要减一转换
    return {
      c: this.titleToNum(res[1]) - 1,
      r: parseInt(res[2]) - 1
    }
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
    $.each(filterData, function(index, item) {
      var itemData = [];
      for (var i in item) {
        if (!item.hasOwnProperty(i)) {
          continue;
        }
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
      for (var i = 0; i< fields.length; i++) {
        true_fields[fields[i]] = fields[i];
      }
    } else {
      true_fields = fields;
    }
    for (var i = 0; i < data.length; i++) {
      var item = data[i];
      exportData[i] = {};
      for (var key in true_fields) {
        if (!true_fields.hasOwnProperty(key)) {
          continue;
        }
        var new_field_name = key;
        var old_field_name = true_fields[key];
        // 如果传入的是回调，则回调的值则为新值
        if (typeof old_field_name === 'function' && old_field_name.apply) {
          exportData[i][new_field_name] = old_field_name.apply(window, [item[new_field_name], item, data]);
        } else {
          if (typeof item[old_field_name] !== 'undefined') {
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
    $.each(data, function(fileindex, xlsx) {
      $.each(xlsx, function(sheetname, content) {
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
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      ''
    ];
    $.each(files, function(index, item) {
      if (supportReadMime.indexOf(item.type) === -1) {
        throw {code: 999, message: item.name+'（'+item.type+'）为不支持的文件类型'};
      }
    });

    // 按照二进制读取
    var data = {};
    var book = {};
    $.each(files, function(index, item) {
      var reader = new FileReader();
      if (!reader) {
        throw {code: 999, message: '不支持FileReader，请更换更新的浏览器'};
      }
      // 读取excel表格对象
      reader.onload = function(ev) {
        var wb = XLSX.read(ev.target.result, {
          type: 'binary'
        });
        var excelData = {};
        $.each(wb.Sheets, function(sheet, sheetObj) {
          // 全为空的去掉
          if (wb.Sheets.hasOwnProperty(sheet)) {
            var opt = {
              header: option.header,
              defval: ''
            };
            if (option.range) {
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
        book[index] = wb;
        // 全部读取完毕才执行
        if (index === files.length - 1) {
          callback && callback.apply && callback.apply(window, [data, book]);
        }
      };
      reader.readAsBinaryString(item);
    });
  }
}

if (typeof layui !== 'undefined') {
  layui.define(['jquery'], function(exports){
    $ = layui.jquery;
    exports('excel', LAY_EXCEL);
  });
}
