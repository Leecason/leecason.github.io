module.exports = {
  title: 'Leecason',
  description: 'Talk is cheap. Show me the code.',
  locales: { '/': { lang: 'zh' } },
  head: [
    ['meta', { name: 'viewport', content: 'width=device-width,initial-scale=1,user-scalable=no' }],
  ],
  theme: 'reco',
  themeConfig: {
    type: 'blog',
    huawei: false,
    // 自动形成侧边导航
    sidebar: 'auto',
    nav: [
      { text: 'Home', link: '/', icon: 'reco-home' },
      { text: 'TimeLine', link: '/timeLine/', icon: 'reco-date' },
      { text: 'Contact',
        icon: 'reco-message',
        items: [
          { text: 'GitHub', link: 'https://github.com/Leecason', icon: 'reco-github' },
        ],
      },
    ],
    blogConfig: {
      category: {
        location: 2, // 在导航栏菜单中所占的位置，默认2
        text: 'Category', // 默认 “分类”
      },
      tag: {
        location: 3, // 在导航栏菜单中所占的位置，默认3
        text: 'Tag', // 默认 “标签”
      },
    },
    sidebarDepth: 2,
    // 文档更新时间
    lastUpdated: 'Last Updated',
    authorAvatar: './avatar.jpeg',
    author: 'leecason',
    startYear: '2018',
    logo: './avatar.jpeg',
    // 搜索设置
    search: true,
  },
  markdown: {
    lineNumbers: true
  },
};
