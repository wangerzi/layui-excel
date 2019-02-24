# 扩展 layui 的导出插件 layui.excel

之前在工作过程中还有社区交流过程中，发现对导出 Excel 文件有需求，所以就萌发了封装插件的想法。导出excel功能基于 XLSX.js，部分代码参考网上的资料。

> 环境提示：预览环境需要部署在服务器下，不然无法异步获取需要导出的数据

> 版本更新提示：如果使用 v1.2 以前的版本，filterExportData 的映射关系有所调整，请注意

> 浏览器兼容性：支持IE10+、Firefox、chrome

> 特别注意：**不能直接在IFRAME里边直接调用导出方法，因为浏览器会限制这种导出行为，如有遇到此类情况，可使用 parent.layui.excel.exportExcel() 的方式调用父级页面函数以避免这个问题（父页面需要先加载插件）**


## 功能演示：

##### 在线演示：

[http://excel.wj2015.com/](http://excel.wj2015.com/)

![功能演示](https://raw.githubusercontent.com/wangerzi/layui-excel/master/screenGIF.gif)

## 期望收集


- [x] 支持导出到IE、Firefox(社区：[TeAmo](https://fly.layui.com/u/2297904/))
- [x] 梳理数据函数支持列合并(社区：[SoloAsural](https://fly.layui.com/u/10405920/))
- [x] 支持Excel内列合并(社区：[SoloAsural](https://fly.layui.com/u/10405920/))
- [x] 优化大量数据导出，比如~~100W~~45W(社区：[Th_omas](https://fly.layui.com/u/28037520/))
- [x] 支持Excel样式设置（魔改xlsx-style后支持设置列宽行高和单元格样式）(社区：[锁哥](https://fly.layui.com/u/17116008/))
- [x] 支持公式、链接等特殊属性（个人、社区：[快乐浪子哥](https://fly.layui.com/u/46872/)）
- [x] 可以读取Excel内容(个人)
- [x] 支持一个Excel导出多个sheet（个人、社区：[玛琳菲森 ](https://fly.layui.com/u/29272992/)）
- [ ] 批量设置样式(个人、交流群：limin)
- [ ] 边框设置的样例(交流群：limin)
- [x] layui上传文件的样例(交流群：睡不够先森)
- [ ] 替换官方的导出功能（社区：[yutons](https://fly.layui.com/u/5932248/)）


## BUG收集

- [x] QQ浏览器MIME-TYPE 无法读取(交流群：三小)
- [ ] 导出xls实际类型不一致问题（交流群：背后的故事†）
- [ ] 导入日期处理(交流群：雨桐)
- [ ] 导出;导致区分cell的问题
- [x] 导入的range参数传递问题

## 快速上手

> 由于插件规模扩大和功能的增加，导致插件上手难度有一定的增加。但如果只使用核心功能，其实没有必要去研究插件的所有方法，故在此把此插件解决核心需求的方法展示出来。

#### 第一步：从后台获取需要导出的数据

> 一般的导出场景是后端给出获取数据的接口，前端请求后端接口后，根据接口返回参数导出，所以需要 $.ajax() 异步请求接口数据

```javascript
$.ajax({
    url: '/path/to/get/data',
    dataType: 'json',
    success: function(res) {
        // 假如返回的 res.data 是需要导出的列表数据
        console.log(res.data);// [{name: 'wang', age: 18}, {name: 'layui', age: 3}]
    }
});
```

#### 第二步：下载源码并引入插件

如果使用 `layuiadmin`,则只需要将插件(`layui_exts/excel.js`、`layui_exts/FileSaver.js`、`layui_exts/xlsx.js`)放到 `controller/`下,然后 `layui.use` 即可,或者可以放在 `lib/extend` 中,只不过需要改 `config.js`

非 `layuiadmin` 初始化如下：

```javascript
layui.config({
	base: 'layui_exts/',
}).extend({
    excel: 'excel',
    FileSaver: 'FileSaver',// 如果所有扩展放一起可忽略此行配置
    xlsx: 'xlsx',// 如果所有扩展放一起可忽略此行配置
});
```

#### 第三步：手工添加一个表头，并调用导出excel的内部函数

```javascript
layui.use(['jquery', 'excel', 'layer'], function() {
    var $ = layui.jquery;
    var excel = layui.excel;
    $.ajax({
        url: '/path/to/get/data',
        dataType: 'json',
        success: function(res) {
            // 假如返回的 res.data 是需要导出的列表数据
            console.log(res.data);// [{name: 'wang', age: 18, sex: '男'}, {name: 'layui', age: 3, sex: '女'}]
            // 1. 数组头部新增表头
            res.data.unshift({name: '用户名',sex: '男', age: '年龄'});
            // 2. 如果需要调整顺序，请执行梳理函数
            var data = excel.filterExportData(data, [
                'name',
                'sex',
                'age',
            ]);
            // 3. 执行导出函数，系统会弹出弹框
            excel.exportExcel({
                sheet1: data
            }, '导出接口数据.xlsx', 'xlsx');
        }
    });
});
```



## 接口设计和后台程序参考

完善中....

## 函数列表

| 函数名                                | 描述                                       |
| ------------------------------------- | ------------------------------------------ |
| **exportExcel(data, filename, type)** | 导出数据，并弹出指定文件名的下载框         |
| downloadExl(data, filename, type)          | 快速导出excel，无需指定 sheet_name 和文件后缀               |
| **filterExportData(data, fields)**    | 梳理导出的数据，包括字段排序和多余数据过滤 |

## 重要函数参数配置

##### exportExcel参数配置

> 核心方法，用于将 data 数据依次导出，如果需要调整导出后的文件字段顺序或者过滤多余数据，请查看 filterExportData 方法

| 参数名称 | 描述                                             | 默认值 |
| -------- | ------------------------------------------------ | ------ |
| data     | 数据列表                                         | 必填   |
| filename | 文件名称（不要带后缀）                           | 必填   |
| type     | 导出类型，支持 xlsx、csv、ods、xlsb、fods、biff2 | xlsx   |

##### data样例：

```javascript
{
    "sheet1": [
        {name: '111', sex: 'male'},
        {name: '222', sex: 'female'},
    ]
}
```

##### opt支持的配置项

| 参数名称   | 描述                                                         | 默认值 |
| ---------- | ------------------------------------------------------------ | ------ |
| opt.Props  | 配置文档基础属性，支持Title、Subject、Author、Manager、Company、Category、Keywords、Comments、LastAuthor、CreatedData | null   |
| opt.extend | 表格配置参数，支持 `!merge` (合并单元格信息)、`!cols`(行数)、`!protect`(写保护)等，[原生配置请参考](https://github.com/SheetJS/js-xlsx#worksheet-object)，其中 `!merge` 配置支持辅助方法生成，详见 `makeMergeConfig(origin)`！ | null   |

> 如果想指定某个 sheet 的opt.extend，请按照 'sheet名称' => {单独配置}，如：

```javascript
excel.exportExcel({
    sheet1: data,
    sheet2: data
}, '测试导出复杂表头.xlsx', 'xlsx', {
    extend: {
        // extend 中可以指定某个 sheet 的属性，如果不指定 sheet 则所有 sheet 套用同一套属性
        sheet1: {
            // 以下配置仅 sheet1 有效
            '!merges': mergeConf
            ,'!cols': colConf
            ,'!rows': rowConf
        }
    }
});
```

#### downloadExl参数配置

> 兼容旧用法，用于快速导出数据，无需指定 sheet_name，无需指定后缀名，其余跟 `exportExcel` 用法相同。

| 参数名称 | 描述                             | 默认值 |
| -------- | -------------------------------- | ------ |
| data     | 导出的数据                       |        |
| filename | 不带后缀名的文件名               |        |
| type     | 导出类型（自动拼接在filename后） |        |

#### filterExportData参数配置

> 辅助方法，梳理导出的数据，包括字段排序和多余数据过滤

| 参数名称 | 描述                                   | 默认值 |
| -------- | -------------------------------------- | ------ |
| data     | 需要梳理的数据                         | 必填   |
| fields   | 支持数组和对象，用于映射关系和字段排序 | 必填   |

> fields参数设计

在实际使用的过程中，后端给的参数多了，或者字段数据不符合导出要求，这都是很常见的情况。为了导出数据的顺序正确和数据映射正确，于是新增了这个方法。

fields 用于表示对象中的属性顺序和映射关系，支持『数组』和『对象』两种方式

假如后台给出了这样的数据：

```json
{
    "code":0,
    "msg":"",
    "count":3,
    "data":[
        {
            "id":10000,
            "username":"user-0",
            "sex":"女",
            "city":"城市-0",
            "sign":"签名-0",
            "experience":255,
            "logins":24,
            "wealth":82830700,
            "classify":"作家",
            "score":57
        }
    ]
}
```

**数组方式：**

仅用于排序、字段过滤，比如我希望的导出顺序和字段是：

`id`、`sex`、`username`、`city`

那么，我可以这样写：

```javascript
var data = [];// 假设的后台的数据
excel.filterExportData(data, ['id', 'sex', 'username', 'city']);
excel.exportExcel(data, '导出测试.xlsx', 'xlsx');
```

**对象方式：**

可以用于排序、重命名字段、字段过滤，比如我希望 `username` 字段重命名为 `name`，保留 `sex` 和 `city` 字段

那么，我可以这样写：

```javascript
var data = [];// 假设的后台的数据
excel.filterExportData(data, {
    username: 'name',
    sex:'sex',
    city: 'city'
});
excel.exportExcel(data, '导出测试.xlsx', 'xlsx');
```

##### 回调模式：

可用于对每一列进行处理，程序会对每个单元格进行遍历，并将当前键名、当前行对象、当前数据整体以参数的形式传入回调函数

比如，我希望新增字段 `timeRange`，此字段由 `start`、`end` 字段合并而成，中间以 `~` 分割；还希望将所有 `score` 字段乘以10；并且 `username` 字段重命名为 `name`，保留 `sex` 和 `city` 字段

那么，我可以这样写：

```javascript
var data = [];// 假设的后台数据
excel.filterExportData(data, {
    username: 'name',
    sex:'sex',
    city: 'city',
    timeRange: function(key, line, data) {
        if (key == 'timeRange') {
            
        }
    }
});
```

##### 调用样例

请见下方『使用方法』

## 功能概览：

- 支持梳理导出的数据并导出多种格式数据

## 使用方法：

> 注意：此扩展需先引入layui.js方可正常使用。demo详见index.html

##### js使用样例：

```javascript
// 注：extends/excel.js的存放路径
layui.config({
	base: 'extends/',
}).extend({
	excel: 'excel',
});
layui.use(['jquery', 'excel', 'layer'], function() {
		var $ = layui.jquery;
		var layer = layui.layer;
		var excel = layui.excel;

		// 模拟从后端接口读取需要导出的数据
		$.ajax({
			url: 'list.json'
			,dataType: 'json'
			,success(res) {
				var data = res.data;
				// 重点！！！如果后端给的数据顺序和映射关系不对，请执行梳理函数后导出
				data = excel.filterExportData(data, [
					'id'
					,'username'
					,'experience'
					,'sex'
					,'score'
					,'city'
					,'classify'
					,'wealth'
					,'sign'
				]);
				// 重点2！！！一般都需要加一个表头，表头的键名顺序需要与最终导出的数据一致
				data.unshift({ id: "ID", username: "用户名", experience: '积分', sex: '性别', score: '评分', city: '城市', classify: '职业', wealth: '财富', sign: '签名' });

				var timestart = Date.now();
				excel.downloadExcel(data, '导出接口数据', 'xlsx');
				var timeend = Date.now();

				var spent = (timeend - timestart) / 1000;
				layer.alert('单纯导出耗时 '+spent+' s');
			}
			,error() {
				layer.alert('获取数据失败，请检查是否部署在本地服务器环境下');
			}
		});
	});
```

##### 导出数据返回样例：

> 此数据来自 layui 官方的表格样例

```json
{
    "code":0,
    "msg":"",
    "count":3,
    "data":[
        {
            "id":10000,
            "username":"user-0",
            "sex":"女",
            "city":"城市-0",
            "sign":"签名-0",
            "experience":255,
            "logins":24,
            "wealth":82830700,
            "classify":"作家",
            "score":57
        },
        {
            "id":10001,
            "username":"user-1",
            "sex":"男",
            "city":"城市-1",
            "sign":"签名-1",
            "experience":884,
            "logins":58,
            "wealth":64928690,
            "classify":"词人",
            "score":27
        },
        {
            "id":10002,
            "username":"user-2",
            "sex":"女",
            "city":"城市-2",
            "sign":"签名-2",
            "experience":650,
            "logins":77,
            "wealth":6298078,
            "classify":"酱油",
            "score":31
        }
    ]
}
```

##### Demo说明：

index.html			页面文件+JS处理文件

list.json				模拟导出的数据

extends/excel.js	权限树扩展

layui/				官网下载的layui

## 更新预告：

无

## 更新记录：

2018-12-14 v1.0 最初版本

## 特别感谢

暂无
