import { sidebar } from "vuepress-theme-hope";

export default sidebar({
  "/": [
    //   "",
    //   // "portfolio",
    {
      text: "编程基础",
      icon: "laptop-code",
      prefix: "cpp/",
      // link: "demo/",
      children: "structure",
    },
    {
      text: "算法",
      icon: "solid:code",
      prefix: "algorithm/",
      children: "structure",
    },
    {
      text: "计算机基础",
      icon: "solid:computer",
      prefix: "计算机基础/",
      children: "structure",
    },
    {
      text: "工具",
      icon: "screwdriver-wrench",
      prefix: "tools/",
      children: "structure",
    },
    {
      text: "项目实战",
      icon: "tarp",
      prefix: "project/",
      children: "structure",
    },
    {
      text: "设计模式",
      icon: "pencil",
      prefix: "设计模式/",
      children: "structure",
    },
    {
      text: "八股文",
      icon: "book",
      prefix: "八股文/",
      children: "structure",
    },
    // {
    //   text: "幻灯片",
    //   icon: "person-chalkboard",
    //   link: "https://ecosystem.vuejs.press/zh/plugins/markdown/revealjs/demo.html",
    // },
  ],

  // "/cpp/":  "structure",
  // "/algorithm/":  "structure",
  // "/计算机基础/":  "structure",
  // "/tools/":  "structure",
  // // "/posts/":  "structure",


});
