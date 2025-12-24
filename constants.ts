// CONFIGURATION: Change these dates for your specific anniversary
// Format: YYYY-MM-DD
export const WEDDING_DATE = '2020-12-25'; 

export const DEFAULT_SONGS = [
  {
    name: "私奔到月球 - 五月天 & 陈绮贞",
    url: "/私奔到月球-五月天&陈绮贞.mp3",
    isLocal: false
  }
];

export const LOVE_LETTER = `
亲爱的老婆：

在这白雪皑皑的圣诞节，也是我们五周年的纪念日。
回首这五年，每一个有你的日子，都是我生命中最珍贵的礼物。

感谢你成为我的伴侣，以及我冬日里最温暖的阳光。
未来的日子里，愿我们依然手牵手，共度每一个春夏秋冬。

圣诞&纪念日快乐！

永远爱你的老公
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
