const { Bot, Message } = require('mirai-js');
const SSR = require('./features/ssr');
const setu = require('./features/mzitu');
const pixiv = require('./features/pixiv');
const searchYHDM = require('./features/searchYHDM');
const utils = require('./common/utils');

const bot = new Bot();

const tips = [
  '.ssr n   进行n次抽卡（n <= 1000000）',
  '.pix     随机一张p站图',
  '.pix18   随机一张R18的p站图',
  '.pid id  根据id搜索p站图',
  '.uid id  随机一张该画师首页的图',
  '.pt      获取热门搜索提示',
  '.pix/pix18 key 根据关键词key搜索(r18？)',
  '.search key 根据关键词key搜索动漫',
  '.st      随机一张三次元涩图',
];

const start = async() => {
  // 连接到一个 mirai-api-http 服务
  await bot.open({
    baseUrl: 'http://127.0.0.1:2233',
    // mirai-api-http 中设置的authKey
    authKey: 'xxx',
    // 要绑定的 qq，须确保该用户已在 mirai-console 登录
    qq: 123,
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

    const isPlain = msgType === 'Plain' && typeof msgContent === 'string';

    if (isPlain && msgContent === '.help') {
      await bot.sendMessage({
        group: senderGroupId,
        message: new Message().addText(tips.join('\n')),
      });
      return;
    }

    if (isPlain && (
      msgContent.includes('充值') ||
      msgContent.includes('充一波') ||
      msgContent.includes('再氪是狗') ||
      msgContent.includes('氪金')
    )) {
      await bot.sendMessage({
        group: senderGroupId,
        message: new Message().addImagePath(`/zksg${utils.getRandom(2)}.jpg`),
      });
      return;
    }

    if (isPlain && msgContent === '.el') {
      await bot.sendMessage({
        group: senderGroupId,
        message: new Message().addImagePath('/el.jpg'),
      });
      return;
    }

    if (isAtAll) {
      await bot.sendMessage({
        group: senderGroupId,
        message: new Message().addAt(senderId).addText('\n').addImagePath('/atAll.jpg'),
      });
      return;
    }

    // 抽卡鸡
    if (isPlain && msgContent.startsWith('.ssr')) {
      SSR({bot, msgContent, senderGroupId});
      return;
    }

    // 涩图鸡3
    if (isPlain && msgContent.startsWith('.st')) {
      setu({bot, senderGroupId});
      return;
    }

    // pixiv 筛选提示
    if (isPlain && msgContent === '.pt') {
      await bot.sendMessage({
        group: senderGroupId,
        message: new Message().addText('.pix 10000users入り'),
      });
      return;
    }

    // 涩图鸡2
    if (isPlain && (
      msgContent.startsWith('.pix') ||
      msgContent.startsWith('.pid') ||
      msgContent.startsWith('.uid') ||
      msgContent.startsWith('.pif')
      )
    ) {
      pixiv({bot, msgContent, senderGroupId});
      return;
    }

    // 樱花动漫search
    if (isPlain && msgContent.startsWith('.search')) {
      searchYHDM({bot, msgContent, senderGroupId});
      return;
    }

    if (
      isPlain && (
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

    if (isPlain && (
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
    if (isPlain && msgContent.toLowerCase().startsWith('ohhh')) {
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
  });
}

start();
