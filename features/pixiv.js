const { Message } = require('mirai-js');
const axios = require('axios');
const cheerio = require('cheerio');
const compressing = require('compressing');
const { getRandom, downLoadImg, convert, proGif } = require('../common/utils');

const headers = {
  Referer: 'https://www.pixiv.net/',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 Safari/537.36',
    cookie: 'first_visit_datetime_pc=2020-07-30+21%3A10%3A19; p_ab_id=8; p_ab_id_2=5; p_ab_d_id=1363458546; yuid_b=IUVkERA; __utmc=235335808; _ga=GA1.2.1571175274.1596111059; a_type=0; b_type=1; login_ever=yes; c_type=24; __cfduid=d1a424a5991eba44f58b704db963671ba1614262217; device_token=6b65c309bab518ef1d00ed6558acb11b; __utmz=235335808.1614432679.15.6.utmcsr=accounts.pixiv.net|utmccn=(referral)|utmcmd=referral|utmcct=/; ki_s=213152%3A0.0.0.0.0%3B214027%3A0.0.0.0.2; ki_r=; ki_t=1596120091782%3B1615990544071%3B1615992705796%3B11%3B46; tag_view_ranking=0xsDLqCEW6~y8GNntYHsi~BU9SQkS-zU~Ie2c51_4Sp~5oPIfUbtd6~faHcYIP1U0~Ms9Iyj7TRt~MM6RXH_rlN~yqqObNqIba~MO67n2Zm2e~o2vM33GyaO~9EjdYiMMQH~OFI5amF0sJ~KexWqtgzW1~KN7uxuR89w~8Qlpl5et8m~l2rugVKl6u~oickbxE5ya~yS_WrRrWFi~HBlflqJjBZ~tgP8r-gOe_~-oGijJmC5S~4i9bTBXFoE~NpsIVvS-GF~n7YxiukgPF~JXj60bPp4r~U1eLot-eQg~LEmyJ-RN72~-7ZTNQgdHv~K6JjooB-Ba~PofepD-HuY~uGW7Tzhi1A~bdsHaxGhC9~cLc_d0LDhp~dGdm6eoPgs~d3xXMR1RDK~_LAZq-jG_L~aKhT3n4RHZ~S_mZnA3sxf~BpbzRdPJXg~jH0uD88V6F~SoxapNkN85~V9JXcZBhKn~rOnsP2Q5UN~4QveACRzn3~g5izzko3j2~k_6Tbz5i0P~MUQoS0sfqG~mCNddzqtog~fz0xGzdnSh~ITqZ5UzdOC~I2_oed1ipq~DRwlbP1Gmr~k6BLBm_YGh~spPqEvHEF2~81oVNcGdpM~8zydy1kf22~9t7F-C-ZZh~uusOs0ipBx~tg4cf2wCF6~H8dBmnNhw6~8rkZT4RNwc~qtVr8SCFs5~zlf-XF9osb~THI8rtfzKo~DPr9_MYoUO~dbWQByG3DG~vdbd7LdFLQ~vnydhfA2BB~yi31V_De8q~YuC4pQ4gRG~oM-8lfB8SN~3t8O5D02ps~ziiAzr_h04~jvrlWVVXJR~_EOd7bsGyl~MnGbHeuS94~kZOrpQ0eOB~ayOikcNQZ9~-n6evPa7Tc~Qur56r5Ojs~gFv6cfMyax~RcahSSzeRf~BuqZZCHUEc~rNs-bh_gk3~mzJgaDwBF5~j2Cs25NHKk~NzsShxkKo0~0cxem062a5~E2creqW-lX~2-ldUidl2y~5DpRmxKPln~wM3COoF_qz~XVMR58pW1q~GNcgbuT3T-~8fXMAZ86mk~RTJMXD26Ak~4srBJYeR5-~bFoVVevmn4~HPUdhjStR6; _gid=GA1.2.1723945185.1616227117; __utma=235335808.1571175274.1596111059.1616225949.1616232588.27; __cf_bm=064df9755b76f1ade68b881aef9dcffb7b912919-1616234380-1800-AXkM/6BOKobU5/ZCkPGCoF1HMvhISa5xkobuIWYr8Q6uMGyY3cZznm4/4aR1R0a+usZ+1OLxu1K0YlzmmjA0uLazyO2jxYAUZT+y6mLpGVCbnsI3DOu7d7gvQglxGPMe7HihbmrQcP0I9fXF/xg4T4fNtHl3Oz6YMnuWEG98jbDnv1e3j3DGqzST0JZAs2UuSg==; PHPSESSID=28060485_QYBU9KOhQ0tUpPza7BFkdBxpCdSzj4pR; privacy_policy_agreement=0; __utmv=235335808.|2=login%20ever=yes=1^3=plan=normal=1^5=gender=male=1^6=user_id=28060485=1^9=p_ab_id=8=1^10=p_ab_id_2=5=1^11=lang=zh=1; __utmt=1; __utmb=235335808.7.10.1616232588',
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
