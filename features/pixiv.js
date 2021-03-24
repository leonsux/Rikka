const { Message } = require('mirai-js');
const axios = require('axios');
const cheerio = require('cheerio');
const { getRandom, downLoadImg } = require('../common/utils');

const headers = {
  Referer: 'https://www.pixiv.net/',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 Safari/537.36',
    cookie: 'xxx',
}

const startSelf = ({
  isR18,
  withSearch,
  searchKey,
}) => {
  const url = withSearch ?
    `https://www.pixiv.net/ajax/search/artworks/${searchKey}?word=${searchKey}&order=date_d&mode=${isR18 ? 'r18' : 'safe'}&p=1&s_mode=s_tag&type=all&lang=zh`
    : `https://www.pixiv.net/ranking.php?p=1&content=illust&format=json${isR18 ? '&mode=daily_r18' : ''}`;

  return new Promise((resolve, reject) => {
    axios({
      method: 'get',
      url,
      headers,
    }).then((res) => {
      let aim = {};
      let list = [];
      if (!withSearch) {
        list = res?.data?.contents || [];
        aim = list[getRandom(list.length)];
      } else {
        list = res?.data?.body?.illustManga?.data || [];
        aim = list[getRandom(list.length)];
      }
      resolve(aim);
    }).catch(err => {
      console.log('get pixiv fail', err);
    })
  })
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
        try {
          const obj = JSON.parse($('#meta-preload-data').attr('content'));
          const url = obj?.illust[id]?.urls?.original;
          resolve({
            success: true,
            url,
          });
        } catch (err) {
          resolve({
            success: false,
            msg: `该作品已被删除，或作品ID不存在。=> https://www.pixiv.net/artworks/${id}`,
          });
        }
      }).catch(err => {
        resolve({
          success: false,
          msg: `该作品已被删除，或作品ID不存在。=> https://www.pixiv.net/artworks/${id}`,
        });
      });
    })
  )
}

const pixiv = async({bot, msgContent, senderGroupId}) => {
  const isR18 = msgContent.startsWith('.pix18');
  let aimId = '';

  if (msgContent.startsWith('.pid')) {
    aimId = parseInt(msgContent.replace('.pid ', ''));
    if (isNaN(aimId)) {
      bot.sendMessage({
        group: senderGroupId,
        message: new Message().addText('输入的数字ID噢~'),
      });
      return;
    }
  } else {
    const searchKey = encodeURIComponent(msgContent.replace(isR18 ? '.pix18 ' : '.pix ', ''));
    const withSearch = searchKey !== msgContent;
  
    const aim = await startSelf({ isR18, withSearch, searchKey });
    aimId = aim?.illust_id || aim?.id;
    if (!aimId) {
      bot.sendMessage({
        group: senderGroupId,
        message: new Message().addText('什么都没找到噢(✺ω✺)'),
      });
      return;
    }
  }

  const { success, url, msg } = await getBig(aimId);

  if (!success) {
    bot.sendMessage({
      group: senderGroupId,
      message: new Message().addText(msg),
    });
    return;
  }
  await downLoadImg({
    url,
    path: '/pixiv.jpg',
    headers,
  });
  if (isR18) {
    bot.sendMessage({
      group: senderGroupId,
      message: new Message().addText(`https://www.pixiv.net/artworks/${aimId}`),
    });
    bot.sendMessage({
      group: senderGroupId,
      message: new Message().addFlashImagePath('/pixiv.jpg'),
    });
  } else {
    bot.sendMessage({
      group: senderGroupId,
      message: new Message().addText(`https://www.pixiv.net/artworks/${aimId}\n`).addImagePath('/pixiv.jpg'),
    });
  }
};

module.exports = pixiv;
