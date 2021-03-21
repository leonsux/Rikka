// 复读鸡
const repeatMsg = async(bot,id, msgType, msgContent) => {
  if (!state.isRepeat) return;

  if (msgContent === '.repeat') {
    state.isRepeat = true;
    await bot.sendMessage({
      group: data.sender.group.id,
      message: new Message().addText('开始整活'),
    });
    return;
  }
  if (msgContent === '.repeat off') {
    state.isRepeat = false;
    await bot.sendMessage({
      group: data.sender.group.id,
      message: new Message().addText('匿了匿了'),
    });
    return;
  }
  
  let msg = new Message().addText(msgContent);

  if (msgType === 'Image') {
    msg = new Message().addImageUrl(msgContent);
  }
  await bot.sendMessage({
    group: id,
    message: msg,
  });
};

module.exports = repeatMsg;