import { defineUserConfig } from "vuepress";

import theme from "./theme.js";

export default defineUserConfig({
  base: "/",

  lang: "zh-CN",
  title: "C++转码笔记",
  description: "记录自己的C++转码所学知识",

  theme,

  // 和 PWA 一起启用
  // shouldPrefetch: false,
});
