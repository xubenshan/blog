import { navbar } from "vuepress-theme-hope";

export default navbar([
  // "/",
  // "/portfolio",
  // "/demo/",
  {
    text: "编程基础",
    icon: "lightbulb",
    prefix: "/cpp/",
    children: [
      {
        text: "",
        icon: "lightbulb",
        prefix: "base/",
        children: ["C++提高编程"],
      },
    ],
  },

  {
    text: "算法",
    icon: "lightbulb",
    prefix: "/algorithm/",
    children: [
      {
        text: "",
        icon: "lightbulb",
        prefix: "search/",
        children: ["搜索专题"],
      },
      {
        text: "Linux入门",
        // icon: "lightbulb",
        link: "/tools/linux/README.md",
      },
    ],
  },

  {
    text: "计算机基础",
    icon: "lightbulb",
    prefix: "/工具/",
    children: [
      {
        text: "Git",
        // icon: "lightbulb",
        link: "/tools/Git/README.md",
      },
      {
        text: "Linux入门",
        // icon: "lightbulb",
        link: "/tools/linux/README.md",
      },
    ],
  },
  {
    text: "工具",
    icon: "lightbulb",
    prefix: "/工具/",
    children: [
      {
        text: "Git",
        // icon: "lightbulb",
        link: "/tools/Git/README.md",
      },
      {
        text: "Linux入门",
        // icon: "lightbulb",
        link: "/tools/linux/README.md",
      },
    ],
  },
  {
    text: "项目实战",
    icon: "lightbulb",
    prefix: "/工具/",
    children: [
      {
        text: "Git",
        // icon: "lightbulb",
        link: "/tools/Git/README.md",
      },
      {
        text: "Linux入门",
        // icon: "lightbulb",
        link: "/tools/linux/README.md",
      },
    ],
  },
  {
    text: "面经",
    icon: "lightbulb",
    prefix: "/工具/",
    children: [
      {
        text: "Git",
        // icon: "lightbulb",
        link: "/tools/Git/README.md",
      },
      {
        text: "Linux入门",
        // icon: "lightbulb",
        link: "/tools/linux/README.md",
      },
    ],
  },
  // {
  //   text: "计算机基础",
  //   icon: "book",
  //   link: "https://theme-hope.vuejs.press/zh/",
  // },
]);
