module.exports = {
  title: 'Leecason',
  description: '若我所见不同，独守一角青空',
  locales: { '/': { lang: 'zh' } },
  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }],
    ['meta', { name: 'viewport', content: 'width=device-width,initial-scale=1,user-scalable=no' }],
  ],
  theme: 'reco',
  themeConfig: {
    type: 'blog',
    huawei: false,
    // 自动形成侧边导航
    sidebar: 'auto',
    nav: [
      { text: '主页', link: '/', icon: 'reco-home' },
      { text: '时间线', link: '/timeLine/', icon: 'reco-date' },
      { text: 'GitHub', link: 'https://github.com/Leecason', icon: 'reco-github' },
    ],
    blogConfig: {
      category: {
        location: 2, // 在导航栏菜单中所占的位置，默认2
        text: '分类', // 默认 “分类”
      },
      tag: {
        location: 3, // 在导航栏菜单中所占的位置，默认3
        text: '标签', // 默认 “标签”
      },
    },
    sidebarDepth: 3,
    // 文档更新时间
    lastUpdated: false,
    authorAvatar: '/avatar.png',
    author: 'Leecason',
    startYear: '2018',
    logo: '/logo.jpeg',
    // 搜索设置
    search: true,
    searchMaxSuggestions: 10,
    // 评论
    valineConfig: {
      appId: 'KzUoq3F8YsCkQ58nNR3XQtj1-gzGzoHsz',
      appKey: 'Q1uPUMv153GlBbfsVa8xlgY1',
      placeholder: '欢迎交流 😁～',
      avatar: 'wavatar',
      notify: true,
    },
  },
  markdown: {
    lineNumbers: true
  },
  plugins: [
    'ribbon', // 彩带背景
  ],
};
