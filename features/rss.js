const Parser = require('rss-parser');
const { Message } = require('mirai-js');
const schedule = require('node-schedule');
const fs = require('fs');
const parser = new Parser();

const checkUpdate = (url, feed) => {
  const filePath = __dirname + '/rss.json';
  let data = fs.readFileSync(filePath);
  data = JSON.parse(data.toString());
  if (!data[url] || (data[url] !== feed.link)) {
    data[url] = feed.link;
    try {
      fs.writeFileSync(filePath, JSON.stringify(data));
    } catch (error) {
      console.log('干呕', error);
    }
    return true;
  }
  return false;
};

const RSS = async({bot, msgContent, senderGroupId, url}) => {
  const getRss = async (url) => {
    let feed = await parser.parseURL(url);
    if (feed && feed.items && feed.items.length && checkUpdate(url, feed.items[0])) {
      bot.sendMessage({
        group: 934486456,
        message: new Message().addText(feed.items[0].title + '\n\n').addText(feed.items[0].link),
      });
    }
  };
  try {
    // schedule.scheduleJob('1 * * * *', () => {
    //   getRss(url);
    // });
    setInterval(() => {
      getRss(url);
    }, 1000);
  } catch (error) {
    // 
  }
};

module.exports = RSS; 
