# 函数列表

> 仅做函数用途介绍，具体使用方法请见 『[重要函数参数配置](重要函数参数配置.md)』

| 函数名                                              | 描述                                                        | 索引                                                         |
| --------------------------------------------------- | ----------------------------------------------------------- | ------------------------------------------------------------ |
| **exportExcel(data, filename, type, opt)**          | 导出数据，并弹出指定文件名的下载框                          | [exportExcel参数配置](重要函数参数配置.md#exportexcel%E5%8F%82%E6%95%B0%E9%85%8D%E7%BD%AE) |
| downloadExl(data, filename, type)                   | 快速导出excel，无需指定 sheet_name 和文件后缀               | [downloadExl参数配置](重要函数参数配置.md#downloadexl%E5%8F%82%E6%95%B0%E9%85%8D%E7%BD%AE) |
| **filterExportData(data, fields)**                  | 梳理导出的数据，包括字段排序和多余数据                      | [filterExportData参数配置](重要函数参数配置.md#filterexportdata%E5%8F%82%E6%95%B0%E9%85%8D%E7%BD%AE) |
| **importExcel(files, opt, callback)**               | 读取Excel，支持多文件多表格读取                             | [importExcel参数配置](重要函数参数配置.md#importexcel%E5%8F%82%E6%95%B0%E9%85%8D%E7%BD%AE) |
| **makeMergeConfig(origin)**                         | 生成合并的配置参数，返回结果需放置于opt.extend['!merges']中 | [makeMergeConfig参数配置](重要函数参数配置.md#makemergeconfig%E5%8F%82%E6%95%B0%E9%85%8D%E7%BD%AE) |
| **setExportCellStyle(data, range, config, filter)** | 为sheet级别数据批量设置单元格属性                           | [setExportCellStyle参数配置](重要函数参数配置.md#setExportCellStyle%E5%8F%82%E6%95%B0%E9%85%8D%E7%BD%AE) |
| makeColConfig(data, defaultNum)                     | 生成列宽配置，返回结果需放置于opt.extend['!cols']中         | [makeColConfig参数配置](重要函数参数配置.md#makecolconfig%E5%8F%82%E6%95%B0%E9%85%8D%E7%BD%AE) |
| makeRowConfig(data, defaultNum)                     | 生成行高配置，返回结果需放置于opt.extend['!rows']           | [makeRowConfig参数配置](重要函数参数配置.md#makerowconfig%E5%8F%82%E6%95%B0%E9%85%8D%E7%BD%AE) |
| tableToJson(dom)                                    | 将原生table转换为JSON格式                                   | [tableToJson参数配置](重要函数参数配置.md#tabletojson%E5%8F%82%E6%95%B0%E9%85%8D%E7%BD%AE) |
| **setRoundBorder(data, range ,config)**             | 设置范围环绕的边框                                          | [setRoundBorder参数配置](重要函数参数配置.md#setRoundBorder%E5%8F%82%E6%95%B0%E9%85%8D%E7%BD%AE) |
| dateCodeToDate(code)                                | EXCEL日期码转换为Date对象                                   | [dateCodeToDate参数配置](重要函数参数配置.md#dateCodeToDate%E5%8F%82%E6%95%B0%E9%85%8D%E7%BD%AE) |
| dateFormat(date, format)                            | Date 对象格式化                                             | [dateFormat参数配置](重要函数参数配置.md#dateFormat%E5%8F%82%E6%95%B0%E9%85%8D%E7%BD%AE) |
| dateCodeFormat(code, format)                        | EXCEL日期码转换为格式化字符串                               | [dateCodeFormat参数配置](重要函数参数配置.md#dateCodeFormat%E5%8F%82%E6%95%B0%E9%85%8D%E7%BD%AE) |
| filterDataToAoaData(sheet_data)                     | 将单个sheet的映射数组数据转换为加速导出效率的aoa数据        | 无                                                           |
| filterImportData(data, fields)                      | 梳理导入的数据，字段含义与 filterExportData 类似            | 无                                                           |
| numToTitle(num)                                     | 将1/2/3...转换为A/B/C/D.../AA/AB/.../ZZ/AAA形式             | 无                                                           |
| titleToNum(title)                                   | 将A、B、AA、ABC转换为 1、2、3形式的数字                     | 无                                                           |
| splitPosition(pos)                                  | 将A1分离成 {c: 0, r: 1} 格式的数据                          | 无                                                           |