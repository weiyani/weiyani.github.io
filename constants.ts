// CONFIGURATION: Change these dates for your specific anniversary
// Format: YYYY-MM-DD
export const WEDDING_DATE = '2020-12-25';

// 计算周年数的函数
export const getAnniversaryYears = (): number => {
  const dateParts = WEDDING_DATE.split('-');
  const weddingYear = parseInt(dateParts[0]);
  const weddingMonth = parseInt(dateParts[1]) - 1; // Month is 0-indexed in JS
  const weddingDay = parseInt(dateParts[2]);
  
  // Beijing Time Offset (UTC+8) in milliseconds
  const BEIJING_OFFSET = 8 * 60 * 60 * 1000;
  
  const now = new Date();
  const nowUtc = now.getTime() + (now.getTimezoneOffset() * 60000);
  const nowBeijingTimestamp = nowUtc + BEIJING_OFFSET;
  
  // 获取当前北京时间的年份
  const currentYearInBeijing = new Date(nowBeijingTimestamp).getUTCFullYear();
  
  // 获取今年纪念日的北京时间戳
  const thisYearAnniversary = Date.UTC(currentYearInBeijing, weddingMonth, weddingDay, 0, 0, 0) - BEIJING_OFFSET;
  
  // 计算距离今年纪念日的天数
  const daysToAnniversary = Math.ceil((thisYearAnniversary - now.getTime()) / (1000 * 60 * 60 * 24));
  
  // 基础周年数
  let years = currentYearInBeijing - weddingYear;
  
  if (daysToAnniversary > 0) {
    // 还没到今年的纪念日
    if (daysToAnniversary <= 3) {
      // 临近3天内，显示为即将到来的周年
      return years;
    } else {
      // 超过3天，显示为上一个已完成的周年
      return years - 1;
    }
  } else if (daysToAnniversary === 0) {
    // 纪念日当天，显示当前周年
    return years;
  } else {
    // 已经过了今年的纪念日，正在进行下一个周年，显示当前进行中的周年数
    return years + 1;
  }
};

// 获取周年数的中文表示
export const getAnniversaryYearsText = (): string => {
  const years = getAnniversaryYears();
  const chineseNumbers = ['', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十'];
  
  if (years < 10) {
    return chineseNumbers[years] + '周年';
  } else {
    return years + '周年';
  }
};

export const DEFAULT_SONGS = [
  {
    name: "私奔到月球 - 五月天 & 陈绮贞",
    url: "/私奔到月球-五月天&陈绮贞.mp3",
    isLocal: false
  }
];

export const LOVE_LETTER = `
亲爱的老婆：

在这白雪皑皑的圣诞节，也是我们${getAnniversaryYearsText()}的纪念日。
在这个值得纪念的日子，特意写了小网站，供你消遣。
如果通关记得截图保存发给我，凭截图有神秘大奖等着你。
最后，感谢你成为我的伴侣,未来的日子里，希望我们相濡以沫，
相互包容，身体健康，开开心心的度过每一个春夏秋冬。

圣诞&纪念日快乐！

爱你的老公
`;

// 动态获取 public/Image 文件夹下的所有图片
export const getPhotos = async (): Promise<string[]> => {
  // 已知的图片文件列表（基于实际文件）
  const knownImages = [
    'IMG_0588.jpeg',
    'IMG_1888.jpeg',
    'IMG_2057.jpeg',
    'IMG_2877.jpeg',
    'IMG_3001.jpeg',
    'IMG_5513.jpeg',
    'IMG_6272.jpeg',
    'IMG_9301.jpeg'
  ];
  
  const photos: string[] = [];
  
  // 检查每个已知图片是否可以访问
  for (const imageName of knownImages) {
    const imagePath = `/Image/${imageName}`;
    
    try {
      // 尝试加载图片来检查是否存在
      const response = await fetch(imagePath, { method: 'HEAD' });
      if (response.ok) {
        photos.push(imagePath);
      }
    } catch (error) {
      console.log(`无法加载图片: ${imagePath}`);
      // 即使无法通过 fetch 检查，也添加到列表中，让浏览器尝试加载
      photos.push(imagePath);
    }
  }
  
  return photos;
};

// 默认的照片数组（使用实际的图片文件名）
export const PHOTOS = [
  "/Image/IMG_0588.jpeg",
  "/Image/IMG_1888.jpeg",
  "/Image/IMG_2057.jpeg",
  "/Image/IMG_2877.jpeg",
  "/Image/IMG_3001.jpeg",
  "/Image/IMG_5513.jpeg",
  "/Image/IMG_6272.jpeg",
  "/Image/IMG_9301.jpeg"
];
