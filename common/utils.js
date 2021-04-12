const axios = require('axios');
const fs = require('fs');
const Jimp = require('jimp');
const sizeOf = require('image-size');
const GIFEncoder = require('gifencoder');
const pngFileStream = require('png-file-stream');

const prePath = '/root/mcl-1.0.5/data/net.mamoe.mirai-api-http/images';

const downLoadImg = async({
  url,
  headers,
  path = '/temp.jpg',
}) => {
  const img = await axios({
    url,
    responseType: 'stream',
    headers,
  });
  const writer = fs.createWriteStream(prePath + path);
  img.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on("finish", resolve);
    writer.on("error", reject);
  });
}

const getRandom = (n) => {
  return Math.floor(Math.random() * n);
};

const convert = () => {
  const imgs = fs.readdirSync(`${prePath}/gif`);

  return new Promise((resolve) => {
    // Promise.all();
    const promises = imgs.map(item => (
      new Promise((res) => {
        // console.log('路径', item);
        Jimp.read(`${prePath}/gif/${item}`, (err, img) => {
          if (err) {
            console.log('convert err', err);
          } else {
            img.writeAsync(`${prePath}/gif/gif${item.replace(/.[a-zA-Z]+/, '.png')}`);
            res();
          }
        });
      })
    ));

    Promise.all(promises).then(() => resolve());
  });

};

function delDir(path){
  let files = [];
  if(fs.existsSync(path)){
    files = fs.readdirSync(path);
    files.forEach((file) => {
      let curPath = path + "/" + file;
      if(fs.statSync(curPath).isDirectory()){
        delDir(curPath); //递归删除文件夹
      } else {
        fs.unlinkSync(curPath); //删除文件
      }
    });
    fs.rmdirSync(path);
  }
}

const proGif = (delay = 100) => {
  const imgs = fs.readdirSync(`${prePath}/gif`);
  const imgInfo = sizeOf(`${prePath}/gif/${imgs[0]}`);
  const encoder = new GIFEncoder(imgInfo.width, imgInfo.height);

  return new Promise((resolve) => {
    const stream = pngFileStream(`${prePath}/gif/gif*.png`)
      .pipe(encoder.createWriteStream({ repeat: 0, delay, quality: 10 }))
      .pipe(fs.createWriteStream(`${prePath}/pixiv.gif`));

    stream.on('finish', function () {
      delDir(`${prePath}/gif`);
      resolve();
    });
  });
}


module.exports = {
  getRandom,
  downLoadImg,
  convert,
  proGif,
};