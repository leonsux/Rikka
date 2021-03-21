const { Bot, Message } = require('mirai-js');
const SSR = require('./features/ssr');
const setu = require('./features/mzitu');
const pixiv = require('./features/pixiv');
const utils = require('./common/utils');

const bot = new Bot();

const start = async() => {
  // 连接到一个 mirai-api-http 服务
  await bot.open({
    baseUrl: 'http://127.0.0.1:2233',
    // mirai-api-http 中设置的authKey
    authKey: 'xxx',
    // 要绑定的 qq，须确保该用户已在 mirai-console 登录
    qq: 00000,
  });

  bot.on('GroupRecallEvent', async data => {
    const list = [
      '撤回干嘛？怀孕了大家一起想办法嘛',
      '拜托不你要再发自己的裸照了好不好',
    ];
    await bot.sendMessage({
      group: data.group.id,
      message: new Message().addAt(data.authorId).addText(list[utils.getRandom(list.length)]),
    });
  });

  // 监听群消息事件
  bot.on('GroupMessage', async data => {
    const enums = {
      Image: 'url',
      Plain: 'text',
    };
    const msgType = data.messageChain[1]?.type;
    const msgContent = data.messageChain[1]?.[enums[msgType]];
    const senderGroupId = data.sender.group.id;
    const senderId = data.sender.id;
    const isAtAll = data.messageChain[1]?.type === 'AtAll';

    if (isAtAll) {
      await bot.sendMessage({
        group: senderGroupId,
        message: new Message().addAt(senderId).addText('\n').addImagePath('/atAll.jpg'),
      });
      return;
    }
    if (
      msgType === 'Plain' && (
        msgContent.includes('我好了') ||
        msgContent.includes('社保') ||
        msgContent.includes('射爆') ||
        msgContent.includes('hso')
      )
    ) {
      await bot.sendMessage({
        group: senderGroupId,
        message: new Message().addImagePath('/shebao.gif'),
      });
      return;
    }

    if (msgType === 'Plain' && (
      msgContent.includes('恶臭')
      || msgContent.includes('114514')
      || msgContent.includes('野兽')
      || msgContent.includes('目力')
      || msgContent.includes('啊啊啊')
      || msgContent.includes('先辈')
      )
    ) {
      await bot.sendMessage({
        group: senderGroupId,
        message: new Message().addVoicePath('/114514.mp3'),
      });
      return;
    }

    // OHHHHHH
    if (msgType === 'Plain' && msgContent.toLowerCase().startsWith('ohhh')) {
      await bot.sendMessage({
        group: senderGroupId,
        message: new Message().addImagePath('/ohhh.gif'),
      });
      await bot.sendMessage({
        group: senderGroupId,
        message: new Message().addVoicePath('/ohhh.mp3'),
      });
      return;
    }

    // 抽卡鸡
    if (msgType === 'Plain' && msgContent.startsWith('.ssr')) {
      SSR({bot, msgContent, senderGroupId});
      return;
    }

    // 涩图鸡3
    if (msgType === 'Plain' && msgContent.startsWith('.st')) {
      setu({bot, senderGroupId});
      return;
    }

    // 涩图鸡2
    if (msgType === 'Plain' && msgContent.startsWith('.pixiv')) {
      pixiv({bot, msgContent, senderGroupId});
      return;
    }
  });
}

start();
