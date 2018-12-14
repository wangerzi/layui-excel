# 扩展 layui 的导出插件 layui.excel

之前在工作过程中还有社区交流过程中，发现对导出 Excel 文件有需求，所以就萌发了封装插件的想法。导出excel功能基于 XLSX.js，部分代码参考网上的资料。

> 环境提示：预览环境需要部署在服务器下，不然无法异步获取需要导出的数据

## 功能演示：

##### 在线演示：

[http://excel.wj2015.com/](http://excel.wj2015.com/)

![功能演示](https://raw.githubusercontent.com/wangerzi/layui-excel/master/screenGIF.gif)

## 期望收集

空

## BUG收集

空

## 接口设计和后台程序参考

完善中....

## 函数列表

| 函数名                                  | 描述                                       |
| --------------------------------------- | ------------------------------------------ |
| **downloadExcel(data, filename, type)** | 导出数据，并弹出指定文件名的下载框         |
| **filterExportData(data, fields)**      | 梳理导出的数据，包括字段排序和多余数据过滤 |

## 重要函数参数配置

##### downloadExcel参数配置

> 核心方法，用于将 data 数据依次导出，如果需要调整导出后的文件字段顺序或者过滤多余数据，请查看 filterExportData 方法

| 参数名称 | 描述                                             | 默认值 |
| -------- | ------------------------------------------------ | ------ |
| data     | 数据列表                                         | 必填   |
| filename | 文件名称（不要带后缀）                           | 必填   |
| type     | 导出类型，支持 xlsx、csv、ods、xlsb、fods、biff2 | xlsx   |

##### filterExportData参数配置

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
excel.downloadExcel(data, '导出测试', 'xlsx');
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
excel.downloadExcel(data, '导出测试', 'xlsx');
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

extends/authtree.js	权限树扩展

layui/				官网下载的layui

## 更新预告：

无

## 更新记录：

2018-12-14 v1.0 最初版本

## 特别感谢

暂无