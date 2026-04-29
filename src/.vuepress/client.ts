import { defineClientConfig } from "vuepress/client";

const addMixedSpacing = (text: string): string =>
  text
    .replace(/([\u4e00-\u9fff])([A-Za-z0-9][A-Za-z0-9+#._-]*)/g, "$1 $2")
    .replace(/([A-Za-z0-9][A-Za-z0-9+#._-]*)([\u4e00-\u9fff])/g, "$1 $2");

const removeMixedSpacing = (text: string): string =>
  text
    .replace(/([\u4e00-\u9fff])\s+([A-Za-z0-9][A-Za-z0-9+#._-]*)/g, "$1$2")
    .replace(/([A-Za-z0-9][A-Za-z0-9+#._-]*)\s+([\u4e00-\u9fff])/g, "$1$2");

const processTextNodes = (root: Element): void => {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let node = walker.nextNode();

  while (node) {
    const textNode = node as Text;
    const original = textNode.nodeValue ?? "";

    if (original.trim()) {
      const spaced = addMixedSpacing(original);
      if (spaced !== original) textNode.nodeValue = spaced;
    }

    node = walker.nextNode();
  }
};

const applySidebarSpacing = (): void => {
  document.querySelectorAll(".vp-sidebar").forEach((sidebar) => {
    processTextNodes(sidebar);
  });
};

const applyHeadingCompactSpacing = (): void => {
  document
    .querySelectorAll(".theme-hope-content :is(h1, h2, h3, h4, h5, h6)")
    .forEach((heading) => {
      const walker = document.createTreeWalker(heading, NodeFilter.SHOW_TEXT);
      let node = walker.nextNode();

      while (node) {
        const textNode = node as Text;
        const original = textNode.nodeValue ?? "";
        const compact = removeMixedSpacing(original);
        if (compact !== original) textNode.nodeValue = compact;
        node = walker.nextNode();
      }
    });
};

export default defineClientConfig({
  enhance: ({ router }) => {
    if (typeof window === "undefined") return;

    const run = (): void => {
      window.requestAnimationFrame(() => {
        applySidebarSpacing();
        applyHeadingCompactSpacing();
      });
    };

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", run, { once: true });
    } else {
      run();
    }

    router.afterEach(() => {
      run();
      setTimeout(run, 30);
    });

    const observer = new MutationObserver(() => run());
    const observe = (): void => {
      observer.observe(document.body, { childList: true, subtree: true });
    };

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", observe, { once: true });
    } else {
      observe();
    }
  },
});
