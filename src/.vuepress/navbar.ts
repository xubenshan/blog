import { navbar } from "vuepress-theme-hope";

export default navbar([
  // "/",
  // "/portfolio",
  // "/demo/",
  {
    text: "编程基础",
    icon: "user",
    prefix: "/cpp/",
    children: [
      {
        text: "",
        icon: "lightbulb",
        prefix: "",
        children: ["C++入门"],
      },
      {
        text: "",
        icon: "lightbulb",
        prefix: "",
        children: ["C++核心编程"],
      },
      {
        text: "",
        icon: "lightbulb",
        prefix: "",
        children: ["C++提高编程"],
      },


      {
        text: "",
        icon: "lightbulb",
        prefix: "",
        children: ["C++新特性"],
      },
      {
        text: "",
        icon: "lightbulb",
        prefix: "",
        children: ["项目构建工具"],
      },
      {
        text: "C++ Primer Plus（第6版）代码仓库",
        link: "https://github.com/ShujiaHuang/Cpp-Primer-Plus-6th",
      },
    ],
  },

  {
    text: "算法",
    icon: "comment",
    prefix: "/algorithm/",
    children: [
      {
        text: "搜索专题",
        // icon: "lightbulb",
        link: "search/",
      },
      // {
      //   text: "Linux入门",
      //   // icon: "lightbulb",
      //   link: "/tools/linux/Git项目搭建.md",
      // },
      {
        text: "DP专题",
        // icon: "lightbulb",
        link: "DP/",
      }
    ],
  },

  {
    text: "计算机基础",
    icon: "database",
    prefix: "/计算机基础/",
    children: [

      {
        text: "计算机网络",
        // icon: "lightbulb",
        link: "/tools/Git/Git项目搭建.md",
      },
      {
        text: "操作系统",
        // icon: "lightbulb",
        link: "/tools/linux/Git项目搭建.md",
      },
        {
            text: "数据库",
            // icon: "lightbulb",
            link: "/tools/linux/Git项目搭建.md",
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
        link: "/tools/Git/Git项目搭建.md",
      },
      {
        text: "Linux",
        // icon: "lightbulb",
        link: "/tools/linux/Linux入门.md",
      },
      {
        text: "Docker",
        // icon: "lightbulb",
        link: "/tools/Docker.md",
      }
    ],
  },
  {
    text: "项目实战",
    icon: "circle-question",
    prefix: "/project/",
    children: [
      {
        text: "WebServer",
        // icon: "lightbulb",
        link: "https://github.com/qinguoyi/TinyWebServer",
      },
      {
        text: "手写STL",
        // icon: "lightbulb",
        link: "https://github.com/parallel101/stl1weekend",
      },
      {
        text: "协程库",
        // icon: "lightbulb",
        link: "https://github.com/youngyangyang04/coroutine-lib/tree/main",
      },
      {
        text: "C++全栈聊天项目",
        // icon: "lightbulb",
        link: "https://www.bilibili.com/video/BV1k2421K7ZB?spm_id_from=333.788.videopod.sections&vd_source=5940e85c0b18a907a0fdea51914b4f65",
      },

    ],
  },
  {
    text: "设计模式",
    icon: "pencil",
    link: "/tools/linux/Linux入门.md",
  },

  {
    text: "八股文",
    icon: "book",
    link: "/八股文/",
    // link: "https://theme-hope.vuejs.press/zh/",
  },

  // {
  //   text: "计算机基础",
  //   icon: "book",
  //   link: "https://theme-hope.vuejs.press/zh/",
  // },
]);
