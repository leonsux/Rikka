const axios = require('axios');
const fs = require('fs');

const downLoadImg = async({
  url,
  headers,
  path = '/temp.jpg',
}) => {
  const prePath = '/root/mcl-1.0.5/data/net.mamoe.mirai-api-http/images';
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


module.exports = {
  getRandom,
  downLoadImg,
};