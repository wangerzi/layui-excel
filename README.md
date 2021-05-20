# LAY-EXCEL 简单快捷的导出插件

现有导出前端库中，XLSX.JS功能强大但是操作颇为不便，于是封装了此插件，**无额外依赖**，支持 **npm 引入**，支持 **Layui插件形式**加载，**导出仅需一句话**。

导出excel功能基于 XLSX.js，下载功能基于 FileSaver，读取文件基于 H5的 FileReader。

**功能演示地址：** [http://excel.wj2015.com](http://excel.wj2015.com)

**文档地址：** [http://excel.wj2015.com/_book/](http://excel.wj2015.com/_book/)

![1570418356365](ScreenToGif.gif)

## 兼容性

支持IE10+、Firefox、Chrome 等

**！！！ 兼容性警告： v1.7.2+ 不再支持 IE9 ，如需必须在 IE9 环境使用，请使用 v1.6.6 版本！！！**

## 快速入门

一句话导出，快速上手请查看 [『快速上手』](http://excel.wj2015.com/_book/docs/快速上手.html)，更多便捷函数请查看[『函数列表』](http://excel.wj2015.com/_book/docs/函数列表/)，样式设置请查看[『样式设置专区』](http://excel.wj2015.com/_book/docs/样式设置专区.html)。

## 使用本项目的几种方式

### npm安装

```shell
$ npm i lay-excel
```

然后使用 `import` 引入并调用导出函数

```js
import LAY_EXCEL from 'lay-excel';
LAY_EXCEL.exportExcel([[1, 2, 3]], '表格导出.xlsx', 'xlsx')
```

### script引入

```html
<script src="layui_exts/excel.js"></script>
<script>
    LAY_EXCEL.exportExcel([[1, 2, 3]], '表格导出.xlsx', 'xlsx')
</script>
```

### Layui插件引入

```js
layui.config({
	base: 'layui_exts/', // 配置一个可访问地址
}).extend({
    excel: 'excel',
});
layui.use(['excel'], function (){
    layui.excel.exportExcel([[1, 2, 3]], '表格导出.xlsx', 'xlsx')
})
```

## 依赖的开源项目

| 开源项目名称                                             | 地址                                                         | 用于                           |
| -------------------------------------------------------- | ------------------------------------------------------------ | ------------------------------ |
| [SheetJS / js-xlsx](https://github.com/SheetJS/js-xlsx)  | [https://github.com/SheetJS/js-xlsx](https://github.com/SheetJS/js-xlsx) | 导出的基础逻辑                 |
| [protobi / js-xlsx](https://github.com/protobi/js-xlsx)  | [https://github.com/protobi/js-xlsx](https://github.com/protobi/js-xlsx) | 可以设置样式，用于补全样式功能 |
| [FileSaver.js](https://github.com/eligrey/FileSaver.js/) | [https://github.com/eligrey/FileSaver.js/](https://github.com/eligrey/FileSaver.js/) | 前端用于保存文件的JS功能组件   |
| [Blob.js](https://github.com/eligrey/Blob.js/)           | [https://github.com/eligrey/Blob.js/](https://github.com/eligrey/Blob.js/) | Blob在IE10中的hack实现         |
| [polyfill.js](https://github.com/philipwalton/polyfill/) | [https://github.com/philipwalton/polyfill/](https://github.com/philipwalton/polyfill/) | 有名的IE兼容插件               |
| [shim.js](https://github.com/es-shims/es5-shim)          | [https://github.com/es-shims/es5-shim](https://github.com/es-shims/es5-shim) | xlsx.js内置的兼容组件，支持ES5 |

> 注：魔改 js-xlsx 支持样式的具体细节请见博客：[JeffreyWang的个人博客：令最新JS-XLSX支持样式的改造方法](https://blog.wj2015.com/2019/05/01/js-xlsx%E6%94%AF%E6%8C%81%E6%A0%B7%E5%BC%8F/)

## 待完成需求

- [x] 【文档】制作 Gitbook 方便查阅
- [x] 【文档】新增『参与开发』页，以便其他开发者上手此插件
- [x] 【文档】新增『常见问题整理』，整理群内高频问题，提高处理效率
- [x] 【兼容】移除 jQuery 依赖
- [ ] 【兼容】导入支持IE11（卡住）
- [x] **【兼容】兼容 npm 的方式加载**，vue demo：[lay-excel-vue](https://github.com/wangerzi/lay-excel-vue)
- [ ] 【测试】单元测试覆盖
- [ ] 【测试】建立CI/CD机制（做了一半）
- [ ] 【导出】分段递归获取数据函数封装
- [ ] 【导出】分段压缩打包
- [ ] 【导出】导出图片（卡住）
- [ ] **【导出】样式设置函数更友好**
- [ ] 【导入】导入图片（卡住）
- [ ] **【导入】优化导入处理函数**


## 参与开发

如果有好的想法，或者想实现 [『待完成需求』](#待完成需求)中的部分功能，请邮 [admin@wj2015.com](mailto:admin@wj2015.com)，或者提 GitHub Issue，或者加群 [555056599](https://jq.qq.com/?_wv=1027&k=5RcqcwI) 讨论。

如果有意贡献代码，那么在开始之前，请先阅读 [『参与开发』](http://excel.wj2015.com/_book/docs/参与开发.html) 文档。

## 特别感谢

感谢 Layui 社区的小伙伴们的使用及建议，还有交流群中反馈各种问题和积极回复问题的群友们，以及 Github 上提 ISSUE、PR 的小伙伴们~

也非常感谢大方的 Jetbrains 提供的免费 IDE License，很好用很强大，[https://www.jetbrains.com/?from=LAY-EXCEL](https://www.jetbrains.com/?from=LAY-EXCEL)

## 友情链接

[Authtree插件](https://github.com/wangerzi/layui-authtree) 、 [JeffreyWang的个人博客](https://blog.wj2015.com)

## 开源协议

LAY-EXCEL is licensed under the Apache License, Version 2.0. See [LICENSE](https://github.com/GitbookIO/gitbook/blob/master/LICENSE) for the full license text.