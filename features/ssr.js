const { Message } = require('mirai-js');
const { getRandom } = require('../common/utils');

// 抽卡
const getSSR = (n) => {
  /**
   * SSR: 6/1000 -> 600 / 100000
   * SR: 51 / 1000 -> 5100 / 100000
   * 
   */
  let count = 0;
  let ssr = 0;
      sr = 0;
      r = 0;
      res = 0;
  while (count++ < n) {
    res = getRandom(100000);
    // 十 发保底
    if (count % 10 === 0) {
      if (res > 0 && res < 600) {
        ssr++;
      } else {
        sr++;
      }
      continue;
    }

    if (res > 0 && res < 600) {
      ssr++;
    } else if (res > 600 && res < 5100) {
      sr++;
    } else {
      r++;
    }
  }
  const ssrMsg = `ssr: ${ssr}, ${(ssr / n * 100).toFixed(2)}%`;
  const srMsg = ` sr: ${sr}, ${(sr / n * 100).toFixed(2)}%`
  const rMsg = `  r: ${r}, ${(r / n * 100).toFixed(2)}%`;

  return ssrMsg + '\n' + srMsg + '\n' + rMsg;
};

const SSR = async({bot, msgContent, senderGroupId}) => {
  try {
    const n = parseInt(msgContent.replace('.ssr ', ''));
    if (n >= 1000000) {
      await bot.sendMessage({
        group: senderGroupId,
        message: new Message().addText('指令异常，正确指令：.srr 抽卡次数（整数 <= 1000000）'),
      });
      return;
    }
    await bot.sendMessage({
      group: senderGroupId,
      message: new Message().addText(getSSR(n)),
    });
  } catch (error) {
    console.log('error:', error);
    await bot.sendMessage({
      group: senderGroupId,
      message: new Message().addText('指令异常，正确指令：.srr 抽卡次数（整数）'),
    });
  }
};

module.exports = SSR; 