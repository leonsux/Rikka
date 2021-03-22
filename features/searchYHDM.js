const { Message } = require('mirai-js');
const axios = require('axios');
const cheerio = require('cheerio');

const getData = (searchKey) => {
  return new Promise((resolve, reject) => {
    axios({
      method: 'post',
      url: `http://www.yhdm.io/search/${searchKey}`,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.90 Safari/537.36',
        Origin:' http://www.yhdm.io',
        Referer:' http://www.yhdm.io/',
      },
    }).then(async(res) => {

      const $ = cheerio.load(res.data);
      const list = $('.lpic li');
      const result = [];
      list.each((index, item) => {
        if (index >= 5) {
          return false;
        }
        const element = $(item);
        const link = 'http://www.yhdm.io' + element.find('a').attr('href');
        const imgEle = element.find('img');
        const img = imgEle.attr('src');
        const title = imgEle.attr('alt');

        result.push({
          link,
          img,
          title,
        });
      });
      resolve(result);
    }).catch(err => {
      reject(err);
    });
  })
}

const searchYHDM = async({bot, msgContent, senderGroupId}) => {
  const res = await getData(encodeURIComponent(msgContent.replace('.search ', '')));
  if (res && res.length) {
    res.forEach((element) => {
      bot.sendMessage({
        group: senderGroupId,
        message: new Message().addText(element.title + '\n').addText(element.link), // .addImageUrl(element.img)
      });
    });
  } else if (res.length === 0) {
    bot.sendMessage({
      group: senderGroupId,
      message: new Message().addText('什么都没找到噢(✺ω✺)'),
    });
  }
};

module.exports = searchYHDM;
