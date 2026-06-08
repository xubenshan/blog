import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { sidebar } from "vuepress-theme-hope";

const docsRoot = fileURLToPath(new URL("../", import.meta.url));

const stripMarkdownExtension = (fileName: string): string =>
  fileName.replace(/\.md$/i, "");

const stripQuotes = (value: string): string =>
  value.trim().replace(/^["']|["']$/g, "");

const getPageTitle = (filePath: string, fallback: string): string => {
  const content = readFileSync(filePath, "utf-8");
  const frontmatter = content.match(/^---\n([\s\S]*?)\n---/);
  const frontmatterTitle = frontmatter?.[1].match(/^(?:title|shortTitle):\s*(.+)$/m);

  if (frontmatterTitle) return stripQuotes(frontmatterTitle[1]);

  const body = frontmatter ? content.slice(frontmatter[0].length) : content;
  const heading = body.match(/^#\s+(.+)$/m);

  return heading ? heading[1].trim() : fallback;
};

const toRouteSegment = (segment: string): string =>
  segment.replace(/#/g, "").replace(/[+,&[\]]/g, "_");

const toHtmlLink = (relativePath: string): string =>
  encodeURI(
    `/${relativePath
      .split("/")
      .map((segment) => toRouteSegment(segment))
      .join("/")}.html`,
  );

const getProblemChildren = (): { text: string; link: string }[] => {
  const problemDir = join(docsRoot, "八股文", "problems");

  return readdirSync(problemDir)
    .filter((fileName) => fileName.endsWith(".md") && !/^readme\.md$/i.test(fileName))
    .sort((a, b) => a.localeCompare(b, "zh-CN", { numeric: true, sensitivity: "base" }))
    .map((fileName) => {
      const title = stripMarkdownExtension(fileName);

      return {
        text: getPageTitle(join(problemDir, fileName), title),
        link: toHtmlLink(`八股文/problems/${title}`),
      };
    });
};

const baguwenChildren = [
  "",
  {
    text: "C++ 八股文",
    link: "/八股文/C__八股文.html",
  },
  {
    text: "Problems",
    prefix: "problems/",
    collapsible: true,
    children: getProblemChildren(),
  },
  "计算机基础八股文",
  "面经汇总",
  "面经汇总2",
];

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
      children: baguwenChildren,
    },
    // {
    //   text: "幻灯片",
    //   icon: "person-chalkboard",
    //   link: "https://ecosystem.vuejs.press/zh/plugins/markdown/revealjs/demo.html",
    // },
  ],

  "/八股文/": baguwenChildren,

  // "/cpp/":  "structure",
  // "/algorithm/":  "structure",
  // "/计算机基础/":  "structure",
  // "/tools/":  "structure",
  // // "/posts/":  "structure",


});
