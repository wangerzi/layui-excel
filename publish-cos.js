const COS = require("cos-nodejs-sdk-v5");
const fs = require("fs");
const path = require("path");
const cos = new COS({
  SecretId: process.env.TENCENT_SECRET_ID,
  SecretKey: process.env.TENCENT_SECRET_KEY,
});

// 递归获取目录中的所有文件
const getAllFiles = (dir, prefix) => {
  let results = [];
  const list = fs.readdirSync(dir);

  list.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      // 递归子目录
      results = results.concat(getAllFiles(filePath, path.join(prefix, file)));
    } else {
      results.push({
        Key: path.join(prefix, file),
        FilePath: filePath,
      });
    }
  });

  return results;
};

const uploadDir = async (dir, bucket, region, prefix) => {
    // 忽略 node_modules 目录
    const files = getAllFiles(dir, prefix).filter((file) => !file.Key.includes('node_modules')).map((file) => ({
    Bucket: bucket,
    Region: region,
    Key: file.Key,
    FilePath: file.FilePath,
  }));
  console.log('waiting to check', files.length);

  const getETag = (filePath) => {
    const data = fs.readFileSync(filePath);
    const hash = require("crypto").createHash("md5").update(data).digest("hex");
    return hash;
  };

  const checkFileHead = (file) => {
    return new Promise((resolve, reject) => {
      cos.headObject(
        {
          Bucket: file.Bucket,
          Region: file.Region,
          Key: file.Key,
        },
        (err, headResponse) => {
          if (err) {
            // 如果 HTTP 状态码为 404，表示 COS 中不存在该文件
            if (err.statusCode === 404) {
              resolve(file);
            } else {
              console.error("Error checking file:", file.Key, err);
              reject(err);
            }
          } else if (headResponse.ETag !== '"' + getETag(file.FilePath) + '"') {
            resolve(file);
          } else {
            resolve(null);
          }
        }
      );
    });
  };

  const filesToUploadPromises = files.map(checkFileHead);
  let filesToUpload = await Promise.all(filesToUploadPromises);
  filesToUpload = filesToUpload.filter((file) => file !== null);

  if (filesToUpload.length > 0) {
    console.log("waiting to upload:", filesToUpload.length);
    // 使用 uploadFiles 方法批量上传
    cos.uploadFiles(
      {
        files: filesToUpload,
        SliceSize: 1024 * 1024, // 1MB
        onProgress: (progressData) => {
          console.log(JSON.stringify(progressData));
        },
        async: true,
      },
      (err, data) => {
        if (err) {
          console.error(err);
        } else {
          console.log("上传完成:", data);
        }
      }
    );
  } else {
    console.log("所有文件均已存在且未更改，无需上传。");
  }
};

// 循环上传多个目录
const dirs = [
    './'
];
dirs.forEach(dir => {
  uploadDir(
    dir,
    process.env.COS_BUCKET,
    process.env.COS_REGION,
    process.env.COS_UPLOAD_PATH
  );
});