const { Message } = require('mirai-js');
const axios = require('axios');
const cheerio = require('cheerio');
const { getRandom, downLoadImg } = require('../common/utils');

const headers = {
  Referer: 'https://www.pixiv.net/',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 Safari/537.36',
    cookie: 'xxx',
}

const startSelf = (isR18) => {
  return (
    axios({
      method: 'get',
      url: `https://www.pixiv.net/ranking.php?p=1&format=json${isR18 ? '&mode=daily_r18' : ''}`,
      headers,
    })
  )
};

const getBig = (id) => {
  return (
    new Promise((resolve, reject) => {
      axios({
        method: 'get',
        url: `https://www.pixiv.net/artworks/${id}`,
        headers,
      }).then(res => {
        const $ = cheerio.load(res.data);
        const obj = JSON.parse($('#meta-preload-data').attr('content'));
        const url = obj?.illust[id]?.urls?.original;
        resolve(url);
      });
    })
  )
}

const pixiv = async({bot, msgContent, senderGroupId}) => {
  const isR18 = msgContent === '.pixiv18';
  const res = await startSelf(isR18);
  const list = res?.data?.contents || [];
  const aim = list[getRandom(list.length)];

  const bigUrl = await getBig(aim.illust_id);
  await downLoadImg({
    url: bigUrl,
    path: '/pixiv.jpg',
    headers,
  });
  if (isR18) {
    bot.sendMessage({
      group: senderGroupId,
      message: new Message().addText(`https://www.pixiv.net/artworks/${aim.illust_id}`),
    });
    bot.sendMessage({
      group: senderGroupId,
      message: new Message().addFlashImagePath('/pixiv.jpg'),
    });
  } else {
    bot.sendMessage({
      group: senderGroupId,
      message: new Message().addText(`https://www.pixiv.net/artworks/${aim.illust_id}\n`).addImagePath('/pixiv.jpg'),
    });
  }
};

module.exports = pixiv;
