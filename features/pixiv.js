const { Message } = require('mirai-js');
const axios = require('axios');
const cheerio = require('cheerio');
const compressing = require('compressing');
const { getRandom, downLoadImg, convert, proGif } = require('../common/utils');

const headers = {
  Referer: 'https://www.pixiv.net/',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 Safari/537.36',
    cookie: 'xxx',
}

const getUserHome = ({
  uid = '',
}) => {
  const url = `https://www.pixiv.net/ajax/user/${uid}/profile/top?lang=zh`;
  return new Promise((resolve) =>{
    axios({
      method: 'get',
      url,
      headers,
    }).then((res) => {
      const list = Object.keys(res?.data?.body?.illusts || {});
      resolve({
        success: true,
        aimId: list[getRandom(list.length)],
      });
    }).catch(() => {
      resolve({
        success: false,
        msg: `查无此人。=> https://www.pixiv.net/users/${uid}/artworks`,
      });
    })
  });
};

const startSelf = ({
  isR18,
  withSearch,
  searchKey,
}) => {
  const url = withSearch ?
    `https://www.pixiv.net/ajax/search/artworks/${searchKey}?word=${searchKey}&order=date_d&mode=${isR18 ? 'r18' : 'safe'}&p=1&s_mode=s_tag&type=all&lang=zh`
    : `https://www.pixiv.net/ranking.php?p=1&content=illust&format=json${isR18 ? '&mode=daily_r18' : ''}`;

  return new Promise((resolve) => {
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

const getGif = (id) => {
  const imgPath = '/root/mcl-1.0.5/data/net.mamoe.mirai-api-http/images';
  return (
    new Promise((resolve) => {
      axios({
        method: 'get',
        url: `https://www.pixiv.net/ajax/illust/${id}/ugoira_meta?lang=zh`,
        headers,
      }).then(async(res) => {
        const zipFileUrl = res.data.body.originalSrc;
        const delay = res.data.body.frames[0].delay;
        await downLoadImg({
          url: zipFileUrl,
          headers,
          path: '/gif.zip',
        });

        await compressing.zip.uncompress(`${imgPath}/gif.zip`, `${imgPath}/gif/`);
        // console.log('解压完毕');
        await convert();
        // console.log('转换完毕');
        await proGif(delay);
        // console.log('gif生成');
        resolve();

      });
    })
  );
}

const getBig = (id) => {
  return (
    new Promise((resolve) => {
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
      }).catch(() => {
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
  let aim = '';
  let aimId = '';
  let aimUid = '';

  // 插画id搜索
  if (msgContent.startsWith('.pid')) {
    aimId = parseInt(msgContent.replace('.pid ', ''));
    if (isNaN(aimId)) {
      bot.sendMessage({
        group: senderGroupId,
        message: new Message().addText('输入的数字ID噢~'),
      });
      return;
    }
  } else if (msgContent.startsWith('.uid')) { // 画师id搜索
    aimUid = parseInt(msgContent.replace('.uid ', ''));
    aim = await getUserHome({ uid: aimUid });
    if (!aim.success) {
      bot.sendMessage({
        group: senderGroupId,
        message: new Message().addText(aim.msg),
      });
      return;
    }
    aimId = aim.aimId;
  } else if (msgContent.startsWith('.pif')) {
    aimUid = parseInt(msgContent.replace('.pif ', ''));
    await getGif(aimUid);
    bot.sendMessage({
      group: senderGroupId,
      message: new Message().addImagePath('/pixiv.gif'),
    });
    return;
  } else { // 常规关键词搜索
    const searchKey = encodeURIComponent(msgContent.replace(isR18 ? '.pix18 ' : '.pix ', ''));
    const withSearch = searchKey !== msgContent;
  
    aim = await startSelf({ isR18, withSearch, searchKey });
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
