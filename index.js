/**
 * 阅读指南：
 * 导出数据测试：搜索 「exportDataByUser」关键字，找到函数即可
 * 导出接口数据：搜索「exportApiDemo」关键字，找到函数即可
 * 导出复杂表头：搜索「exportExtendDemo」关键字，找到函数即可
 * 批量设置样式：搜索「exportStyleDemo」关键字，找到函数即可
 * 简单文件导入：搜索「uploadExcel」可找到导入的处理逻辑，拖拽文件/选择文件回调获取files对象请搜索「#LAY-excel-import-excel」
 * upload模块：搜索「uploadInst」查看使用逻辑，导入相关逻辑同上
 */

layui.use(['jquery', 'layer', 'upload', 'excel', 'laytpl', 'element', 'code'], function () {
  var $ = layui.jquery;
  var layer = layui.layer;
  var upload = layui.upload;
  var excel = layui.excel;
  var laytpl = layui.laytpl;
  var element = layui.element;


  /**
   * 上传excel的处理函数，传入文件对象数组
   * @param  {FileList} files [description]
   * @return {[type]}       [description]
   */
  function uploadExcel(files) {
    try {
      excel.importExcel(files, {
        // 可以在读取数据的同时梳理数据
        /*fields: {
          'id': 'A'
          , 'username': 'B'
          , 'experience': 'C'
          , 'sex': 'D'
          , 'score': 'E'
          , 'city': 'F'
          , 'classify': 'G'
          , 'wealth': 'H'
          , 'sign': 'I'
        }*/
      }, function (data, book) {
        // data: {1: {sheet1: [{id: 1, name: 2}, {...}]}}// 工作表的数据对象
        // book: {1: {Sheets: {}, Props: {}, ....}} // 工作表的整个原生对象，https://github.com/SheetJS/js-xlsx#workbook-object
        // 也可以全部读取出来再进行数据梳理
/*        data = excel.filterImportData(data, {
          'id': 'A'
          , 'username': 'B'
          , 'experience': 'C'
          , 'sex': 'D'
          , 'score': 'E'
          , 'city': 'F'
          , 'classify': 'G'
          , 'wealth': 'H'
          , 'sign': 'I'
        })*/
        // 如果不需要展示直接上传，可以再次 $.ajax() 将JSON数据通过 JSON.stringify() 处理后传递到后端即可
        /**
         * 2019-06-21 JeffreyWang 应群友需求，加一个单元格合并还原转换
         * 思路：
         * 1. 渲染时为每个cell加上唯一的ID，demo里边采用 table-export-文件索引-sheet名称-行索引-列索引
         * 2. 根据 book[文件索引].Sheets[sheet名称]['!merge'] 参数，取左上角元素设置 colspan 以及 rowspan，并删除其他元素
         */
        layer.open({
          title: '文件转换结果'
          , area: ['799px', '399px']
          , tipsMore: true
          , content: laytpl($('#LAY-excel-export-ans').html()).render({data: data, files: files})
          , success: function () {
            element.render('tab')
            layui.code({})
            // 处理合并
            for (var file_index in book) {
              if (!book.hasOwnProperty(file_index)) {
                continue
              }
              // 遍历每个Sheet
              for (var sheet_name in book[file_index].Sheets) {
                if (!book[file_index].Sheets.hasOwnProperty(sheet_name)) {
                  continue
                }
                var sheetObj = book[file_index].Sheets[sheet_name]
                // 仅在有合并参数时进行操作
                if (!sheetObj['!merges']) {
                  continue
                }
                // 遍历每个Sheet中每个 !merges
                for (var merge_index = 0; merge_index < sheetObj['!merges'].length; merge_index++) {
                  var mergeObj = sheetObj['!merges'][merge_index]
                  // 每个合并参数的 s.c 表示左上角单元格的列，s.r 表示左上角单元格的行，e.c 表示右下角单元格的列，e.r 表示右下角单元格的行，计算时注意 + 1
                  $('#table-export-' + file_index + '-' + sheet_name + '-' + mergeObj.s.r + '-' + mergeObj.s.c)
                    .prop('rowspan', mergeObj.e.r - mergeObj.s.r + 1)
                    .prop('colspan', mergeObj.e.c - mergeObj.s.c + 1)
                  for (var r = mergeObj.s.r; r <= mergeObj.e.r; r++) {
                    for (var c = mergeObj.s.c; c <= mergeObj.e.c; c++) {
                      // 排除左上角
                      if (r === mergeObj.s.r && c === mergeObj.s.c) {
                        continue
                      }
                      $('#table-export-' + file_index + '-' + sheet_name + '-' + r + '-' + c).remove()
                    }
                  }
                }
              }
            }
          }
        })
      })
    } catch (e) {
      layer.alert(e.message)
    }
  }

  //upload上传实例
  var uploadInst = upload.render({
    elem: '#LAY-excel-upload' //绑定元素
    , url: '/upload/' //上传接口（PS:这里不用传递整个 excel）
    , auto: false //选择文件后不自动上传
    , accept: 'file'
    , choose: function (obj) {// 选择文件回调
      var files = obj.pushFile()
      var fileArr = Object.values(files)// 注意这里的数据需要是数组，所以需要转换一下

      // 用完就清理掉，避免多次选中相同文件时出现问题
      for (var index in files) {
        if (files.hasOwnProperty(index)) {
          delete files[index]
        }
      }
      $('#LAY-excel-upload').next().val('');

      uploadExcel(fileArr) // 如果只需要最新选择的文件，可以这样写： uploadExcel([files.pop()])
    }
  });

  $(function () {
    // 监听上传文件的事件
    $('#LAY-excel-import-excel').change(function (e) {
      // 注意：这里直接引用 e.target.files 会导致 FileList 对象在读取之前变化，导致无法弹出文件
      var files = Object.values(e.target.files)
      uploadExcel(files)
      // 变更完清空，否则选择同一个文件不触发此事件
      e.target.value = ''
    })
    // 文件拖拽
    document.body.ondragover = function (e) {
      e.preventDefault()
    }
    document.body.ondrop = function (e) {
      e.preventDefault()
      var files = e.dataTransfer.files
      uploadExcel(files)
    }
    // 2019-08-17 页面直接展示所有demo
    renderDemoList()

  })
})

/**
 * 上传excel的处理函数，传入文件对象数组
 * @param  {[type]} files [description]
 * @return {[type]}       [description]
 */
function uploadExcel(files) {
  layui.use(['excel', 'layer'], function () {
    var excel = layui.excel
    var layer = layui.layer
    try {
      excel.importExcel(files, {
        // 读取数据的同时梳理数据
        fields: {
          'id': 'A'
          , 'username': 'B'
          , 'experience': 'C'
          , 'sex': 'D'
          , 'score': 'E'
          , 'city': 'F'
          , 'classify': 'G'
          , 'wealth': 'H'
          , 'sign': 'I'
        }
      }, function (data) {
        // 还可以再进行数据梳理
        /*						data = excel.filterImportData(data, {
                'id': 'A'
                ,'username': 'B'
                ,'experience': 'C'
                ,'sex': 'D'
                ,'score': 'E'
                ,'city': 'F'
                ,'classify': 'G'
                ,'wealth': 'H'
                ,'sign': 'I'
              });
        */
        // 如果不需要展示直接上传，可以再次 $.ajax() 将JSON数据通过 JSON.stringify() 处理后传递到后端即可
        layer.open({
          title: '文件转换结果'
          , area: ['800px', '400px']
          , tipsMore: true
          , content: laytpl($('#LAY-excel-export-ans').html()).render({data: data, files: files})
          , success: function () {
            element.render('tab')
            layui.code({})
          }
        })
      })
    } catch (e) {
      layer.alert(e.message)
    }
  })
}

/**
 * 导出数据的测试
 * @return {[type]} [description]
 */
function exportDataByUser() {
  layui.use(['layer'], function () {
    layer.ready(function () {
      layer.prompt({
        title: '请输入测试数据量(9列)'
        , value: 3000
      }, function (value, index, elem) {
        // 使用setTimeout、async、ajax等方式可以实现异步导出
        setTimeout(function () {
          var num = parseInt(value)
          var timestart = Date.now()
          exportDataTest(num)
          var timeend = Date.now()

          var spent = (timeend - timestart) / 1000
          layer.alert('耗时 ' + spent + ' s')
        }, 0)
        layer.close(index)
      })
    })
  })
}

/**
 * 导出接口数据的样例
 * @return {[type]} [description]
 */
function exportApiDemo(url) {
  layui.use(['jquery', 'excel', 'layer'], function () {
    var $ = layui.jquery
    var layer = layui.layer
    var excel = layui.excel

    // 模拟从后端接口读取需要导出的数据
    $.ajax({
      url: url
      , dataType: 'json'
      , success: function (res) {
        var data = res.data
        // 重点！！！如果后端给的数据顺序和映射关系不对，请执行梳理函数后导出
        data = excel.filterExportData(data, {
          id: 'id'
          , username: 'username'
          , experience: 'experience'
          , sex: 'sex'
          , score: function (value, line, data, lineIndex, newField) {
            // 可以直接指定类型为数字
            return {
              v: value,
              t: 'n'
            }
          }
          , city: function (value, line, data, lineIndex, newField) {
            return {
              v: value,
              s: {
                font: {sz: 14, bold: true, color: {rgb: "FFFFAA00"}},
                fill: {bgColor: {indexed: 64}, fgColor: {rgb: "FFFF00"}}
              }
            }
          }
          , classify: 'classify'
          , wealth: 'wealth'
          , sign: 'sign'
        })
        // 重点2！！！一般都需要加一个表头，表头的键名顺序需要与最终导出的数据一致
        data.unshift({
          id: "ID",
          username: "用户名",
          experience: '积分',
          sex: '性别',
          score: '评分',
          city: '城市',
          classify: '职业',
          wealth: '财富',
          sign: '签名'
        })

        var timestart = Date.now()
        excel.exportExcel({
          sheet1: data
        }, '导出接口数据.xlsx', 'xlsx')
        var timeend = Date.now()

        var spent = (timeend - timestart) / 1000
        layer.alert('单纯导出耗时 ' + spent + ' s')
      }
      , error: function () {
        layer.alert('获取数据失败，请检查是否部署在本地服务器环境下')
      }
    })
  })
}

/**
 * 导出 total 数据测试
 * @param  {[type]} total [description]
 * @return {[type]}       [description]
 */
function exportDataTest(total) {
  layui.use(['excel'], function () {
    var excel = layui.excel

    // 如果数据量特别大，最好直接传入 AOA 数组，减少内存/CPU消耗
    var data = [
      ["ID", "用户名", '积分', '性别', '评分', '城市', '签名', '职业', '财富']
    ]
    if (total > 0) {
      // 造 num 条数据
      for (var i = 0; i < total; i++) {
        data.push([
          'LAY-' + i,
          'test' + i,
          '男',
          200,
          100,
          '魔都',
          'test' + i,
          '程序猿',
          100 * i,
        ])
      }
    }

    excel.exportExcel({
      sheet1: data
    }, '测试导出' + total + '条数据.xlsx', 'xlsx')
  })
}

/**
 * 导出复杂表头数据问题
 * @return {[type]} [description]
 */
function exportExtendDemo() {
  layui.use(['excel'], function () {
    var excel = layui.excel
    var data = [
      {
        id: '标志位', username: {
          v: '用户信息', s: {
            alignment: {
              horizontal: 'center',
              vertical: 'center'
            },
            fill: {bgColor: {indexed: 64}, fgColor: {rgb: "FF0000"}}
          }
        }, age: '', sex: '', score: '', classify: ''
      },// 被合并的列数据也需要填充上
      {id: 'ID', username: '基础信息', age: '', sex: '', score: '扩展数据', classify: ''},
      {id: 'id', username: '用户名', age: '年龄', sex: '性别', score: '积分', classify: '职业'},
      {id: 1, username: 'wang', age: 10, sex: '男', score: 100, classify: '程序猿'},
      {id: 1, username: 'wang', age: 10, sex: '男', score: 100, classify: '程序猿'},
      {id: 1, username: 'wang', age: 10, sex: '男', score: 100, classify: '程序猿'},
      {id: 1, username: 'wang', age: 10, sex: '男', score: 100, classify: '程序猿'},
      {id: 1, username: 'wang', age: 10, sex: '男', score: 100, classify: '程序猿'},
      {id: 1, username: 'wang', age: 10, sex: '男', score: 100, classify: '程序猿'},
      {id: 1, username: 'wang', age: 10, sex: '男', score: 100, classify: '程序猿'},
    ]
    // 生成配置的辅助函数，返回结果作为扩展功能的配置参数传入即可
    // 1. 复杂表头合并[B1,C1,D1][E1,F1]
    var mergeConf = excel.makeMergeConfig([
      ['B1', 'F1'],
      ['B2', 'D2'],
      ['E2', 'F2'],
    ])
    // 2. B列宽 150，F列宽200，默认80
    var colConf = excel.makeColConfig({
      'B': 150,
      'F': 200,
    }, 80)
    // 3. 第1行行高40，第二行行高30，默认20
    var rowConf = excel.makeRowConfig({
      1: 40,
      3: 30
    }, 20)
    // 4. 公式的用法
    data.push({
      id: '',
      username: '总年龄',
      age: {t: 'n', f: 'SUM(C4:C10)'},
      sex: '总分',
      score: {t: 'n', f: 'SUM(E4:E10)'},
      classify: {
        v: '注意：保护模式中公式无效，请「启用编辑」',
        s: {font: {color: {rgb: 'FF0000'}}}
      }
    })
    excel.exportExcel({
      sheet1: data,
      sheet2: data
    }, '测试导出复杂表头.xlsx', 'xlsx', {
      extend: {
        // extend 中可以指定某个 sheet 的属性，如果不指定 sheet 则所有 sheet 套用同一套属性
        sheet1: {
          '!merges': mergeConf
          , '!cols': colConf
          , '!rows': rowConf
        }
      }
    })
  })
}

/**
 * 快速设置样式使用方法
 */
function exportStyleDemo() {
  layui.use(['excel'], function () {
    var excel = layui.excel
    var data = [
      {username: '520', sex: '男', city: 'J', 'score': 100, 'start': '2019-03-11'},
      {username: '520', sex: '女', city: 'X', 'score': 100, 'start': '2019-03-11'},
      {username: '520', sex: '男', city: '上海', 'score': 100, 'start': '2019-03-11'},
      {username: '520', sex: '男', city: '上海', 'score': 100, 'start': '2019-03-11'},
      {username: '520', sex: '男', city: '上海', 'score': 100, 'start': '2019-03-11'},
      {username: '520', sex: '男', city: '上海', 'score': 100, 'start': '2019-03-11'},
      {username: '520', sex: '男', city: '上海', 'score': 100, 'start': '2019-03-11'},
      {username: '520', sex: '男', city: '上海', 'score': 100, 'start': '2019-03-11'},
      {username: '520', sex: '男', city: '上海', 'score': 100, 'start': '2019-03-11'},
      {username: '520', sex: '男', city: '上海', 'score': 100, 'start': '2019-03-11'}
    ]// 假设的后台的数据
    // 1. 使用filter梳理一下
    data = excel.filterExportData(data, {
      name: 'username',
      sex: 'sex',
      score: 'score',
      start: 'start',
      // 这里设置的样式会被合并
      city: function (value) {
        return {
          v: value,
          s: {
            font: {sz: 14, bold: true, color: {rgb: "FFFFAA00"}},
            alignment: {
              horizontal: 'center',
              vertical: 'center'
            }
          }
        }
      },
      start2: 'start',
      score2: 'score',
      sex2: 'sex',
      name2: 'username'
    })
    // 笔芯彩蛋（JeffreyWang 2019-03-11）
    var heart = [
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 1, 1, 0, 1, 1, 0, 0],
      [0, 1, 1, 1, 1, 1, 1, 1, 0],
      [1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1],
      [0, 1, 1, 1, 1, 1, 1, 1, 0],
      [0, 0, 1, 1, 1, 1, 1, 0, 0],
      [0, 0, 0, 1, 1, 1, 1, 0, 0],
      [0, 0, 0, 0, 1, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
    ]
    // 2. 调用设置样式的函数，传入设置的范围，支持回调
    excel.setExportCellStyle(data, 'A1:I10', {
      s: {
        fill: {bgColor: {indexed: 64}, fgColor: {rgb: "FF0000"}},
        alignment: {
          horizontal: 'center',
          vertical: 'center'
        }
      }
    }, function (cell, newCell, row, config, currentRow, currentCol, fieldKey) {
      // 回调参数，cell:原有数据，newCell:根据批量设置规则自动生成的样式，row:所在行数据，config:传入的配置,currentRow:当前行索引,currentCol:当前列索引，fieldKey:当前字段索引
      // return ((currentRow + currentCol) % 2 === 0) ? newCell : cell;// 隔行隔列上色
      return (heart[currentRow] && heart[currentRow][currentCol]) ? newCell : cell // 根据阵列，给心形上色
      // return newCell;
    })
    // console.log(data);
    // 3. 单元格样式优化为正方形
    var colConfig = excel.makeColConfig({
      'A': 80,
      'I': 80
    }, 80)
    var rowConfig = excel.makeRowConfig({
      1: 40,
      10: 40
    }, 40)
    excel.exportExcel(data, '批量设置样式.xlsx', 'xlsx', {
      extend: {
        '!cols': colConfig,
        '!rows': rowConfig
      }
    })
  })
}

/**
 * 加群交流弹窗
 * @return {[type]} [description]
 */
function groupAdd() {
  layui.use(['laytpl', 'layer', 'jquery'], function () {
    var laytpl = layui.laytpl
    var layer = layui.layer
    var $ = layui.jquery

    var content = laytpl($('#LAY-excel-group-add').html()).render({})
    layer.open({
      title: "加群交流"
      , area: ['300px', '450px']
      , content: content
    })
  })
}

function getDemoListContent(callback) {
  layui.use(['laytpl', 'jquery'], function () {
    var laytpl = layui.laytpl
    var $ = layui.jquery

    var list = [
      {
        href: 'demos/tableExport/index.html',
        path: 'demos/tableExport/index.html',
        person: '雨桐',
        email: 'yuton.yao@qq.com',
        desc: '导出表格数据的DEMO'
      },
      {
        href: 'demos/noLayui/index.html',
        path: 'demos/noLayui/index.html',
        person: '藏锋入鞘',
        email: 'admin@wj2015.com',
        desc: '非LAYUI调用及原生表格导出'
      },
      {
        href: 'demos/borderExport/index.html',
        path: 'demos/borderExport/index.html',
        person: '藏锋入鞘',
        email: 'admin@wj2015.com',
        desc: '边框设置DEMO'
      },
      {
        href: 'demos/iframeExport/index.html',
        path: 'demos/iframeExport/index.html',
        person: '藏锋入鞘',
        email: 'admin@wj2015.com',
        desc: 'iframe子页面调用导出'
      },
      {
        href: 'demos/timeHandle/index.html',
        path: 'demos/timeHandle/index.html',
        person: '藏锋入鞘',
        email: 'admin@wj2015.com',
        desc: '时间的导入导出控制'
      }
    ]
    var content = laytpl($('#LAY-excel-demo-list').html()).render({
      list: list
    })
    if (typeof callback == 'function' && callback.apply) {
      callback.apply(window, [content])
    }
  })
}

/**
 * 弹窗弹出demo列表
 */
function demoList() {
  getDemoListContent(function (content) {
    layui.use(['layer'], function () {
      var layer = layui.layer

      layer.open({
        title: "使用样例"
        , area: ['800px', '250px']
        , content: content
      })
    })
  })
}

/**
 * 页面上直接展示demo列表
 */
function renderDemoList() {
  layui.use(['jquery'], function () {
    var $ = layui.jquery;
    getDemoListContent(function (content) {
      $('#LAY-excel-demo-list-dom').html(content)
    })
  });
}
