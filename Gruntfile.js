module.exports = function (grunt) {
  //项目配置
  grunt.initConfig({
    //读取配置项
    pkg: grunt.file.readJSON('package.json'),
    //执行具体任务 concat:合并 uglify:压缩
    concat: {
      //设置输出文件合并的字符
      options: {
        separator: "/*---------split--------*/"
      },
      dist: {
        //被合并的文件的路径
        src: [
          "src/excel.js",
          "src/Blob.js",
          "src/FileSaver.js",
          "src/jszip.js",
          "src/xlsx.js",
          "src/polyfill.js"
        ],
        //被合成的文件路径
        dest: "layui_exts/excel.js"
      }
    },
    uglify: {
      //注释
      options: {
        banner: "/* JeffreyWang压缩打包 <%= pkg.name %> <%= pkg.version %>*/ \n"
      },
      build: {
        //被压缩的文件的路径
        src: [
          "src/excel.js",
          "src/Blob.js",
          "src/FileSaver.js",
          "src/jszip.js",
          "src/xlsx.js",
          "src/polyfill.js"
        ],
        //被压缩的文件路径
        dest: "layui_exts/excel.min.js"
      }
    },
  })

  //加载合并插件
  grunt.loadNpmTasks("grunt-contrib-concat")
  grunt.loadNpmTasks("grunt-contrib-uglify")
  //执行任务
  grunt.registerTask("default", ["concat", "uglify"])
}
