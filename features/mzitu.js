const { Message } = require('mirai-js');
const axios = require('axios');
const cheerio = require('cheerio');
const { downLoadImg, getRandom } = require('../common/utils');

const paths = [
  '',
  '/hot',
  '/best',
  '/xinggan',
  '/japan',
  '/taiwan',
  '/mm',
];

const getBig = (url) => {
  return (
    new Promise((resolve, reject) => {
      axios(url).then(res => {
        const $ = cheerio.load(res.data);
        const url = $('.main-image img').attr('src');
        resolve(url);
      }).catch(err => reject());
    })
  )
};

const getMzitu = () => {
  return new Promise((resolve, reject) => {
    const aimPage = getRandom(261);
    const aimPath = paths[getRandom(paths.length)] + aimPage === 1 ? '' : '/page';

    axios.get(`https://www.mzitu.com/${aimPath}/${aimPage}`).then(async(res) => {
      const $ = cheerio.load(res.data);
      const list = $('#pins li');
      const randomItem = $(list[getRandom(list.length)]).find('a');
      const bigUrl = await getBig(randomItem.attr('href'));
      await downLoadImg({
        url: bigUrl,
        path: '/mzitu.jpg',
        headers: {
          referer: 'https://www.mzitu.com/',
        },
      });
      resolve();
    }).catch(err => {
      reject();
    });
  })
}

const mzitu = async({bot, senderGroupId}) => {
  await getMzitu();
  await bot.sendMessage({
    group: senderGroupId,
    message: new Message().addImagePath('/mzitu.jpg'),
  });
};

module.exports = mzitu;