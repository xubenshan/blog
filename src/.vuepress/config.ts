import { defineUserConfig } from "vuepress";

import theme from "./theme.js";
import { docsearchPlugin } from '@vuepress/plugin-docsearch'
import { searchPlugin } from '@vuepress/plugin-search'
import { noticePlugin } from '@vuepress/plugin-notice'
import { copyrightPlugin } from '@vuepress/plugin-copyright'


// .vuepress/config.ts



export default defineUserConfig({
  base: "/blog/",
  lang: "zh-CN",
  title: "C++转码笔记",
  description: "记录自己的C++转码所学知识",
  head: [
    ["link", { rel: "icon", href: "https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/logo.png" }],
    ["link", { rel: "preconnect", href: "https://fonts.gstatic.com" }],
    [
      "link",
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossorigin: "" },
    ],
    [
      "link",
      {
        href: "https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@300..900&display=swap",
        rel: "stylesheet",
      },
    ],
  ],

  theme,
  plugins: [
    searchPlugin({
      locales: {
        '/': {
          placeholder: 'Search',
        },
        '/zh/': {
          placeholder: '搜索',
        },
      },

    }),
    noticePlugin({
      config: [
        {
          // showOnce: true,
          // confirm: true,
          path: '/',
          title: '通知公告',
          content: '欢迎来到C++转码笔记，希望在这里你能有所收获！',
          actions: [
            {
              text: '添加管理员微信',
              link: 'https://example.com',
              type: 'primary',
            },
          ],
        },
      ],
    }),

  ],
  // 和 PWA 一起启用
  // shouldPrefetch: false,
});
