import{_ as n}from"./plugin-vue_export-helper-DlAUqK2U.js";import{c as a,b as i,o as e}from"./app-C6hISLDI.js";const l={};function p(d,s){return e(),a("div",null,[...s[0]||(s[0]=[i(`<p>完美转发是一个与模板和函数重载相关的概念，它允许一个函数将其接收到的参数以原始的值类别（左值或右值）传递给另一个函数。这意味着<strong>如果你传递了一个左值给包装函数，那么被调用的函数也会接收到一个左值；如果传递的是一个右值，则同样地，被调用的函数会接收到一个右值。</strong></p><div class="language- line-numbers-mode" data-highlighter="shiki" data-ext="" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34;"><pre class="shiki shiki-themes one-light one-dark-pro vp-code"><code class="language-"><span class="line"><span>#include &lt;utility&gt;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 这个函数负责“转发”它的参数到另一个函数</span></span>
<span class="line"><span>template&lt;typename T&gt;</span></span>
<span class="line"><span>void wrapper(T&amp;&amp; arg) {</span></span>
<span class="line"><span>    // 使用 std::forward 来确保 arg 的值类别得以保持不变</span></span>
<span class="line"><span>    target(std::forward&lt;T&gt;(arg));</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 一个可能接受左值或右值参数的目标函数</span></span>
<span class="line"><span>void target(int&amp; x) {</span></span>
<span class="line"><span>    // 处理左值</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>void target(int&amp;&amp; x) {</span></span>
<span class="line"><span>    // 处理右值</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>int main() {</span></span>
<span class="line"><span>    int lv = 5;     // 左值</span></span>
<span class="line"><span>    wrapper(lv);    // 应该调用 void target(int&amp; x)</span></span>
<span class="line"><span>    wrapper(10);    // 应该调用 void target(int&amp;&amp; x)</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div>`,2)])])}const c=n(l,[["render",p]]),m=JSON.parse('{"path":"/%E5%85%AB%E8%82%A1%E6%96%87/problems/%E4%BB%80%E4%B9%88%E6%98%AF%E5%AE%8C%E7%BE%8E%E8%BD%AC%E5%8F%91%EF%BC%9F.html","title":"","lang":"zh-CN","frontmatter":{"feed":false,"seo":false,"head":[]},"git":{"createdTime":1768196265000,"updatedTime":1768196265000,"contributors":[{"name":"xubenshan","username":"xubenshan","email":"1782622988@qq.com","commits":1,"url":"https://github.com/xubenshan"}]},"readingTime":{"minutes":0.79,"words":238},"filePathRelative":"八股文/problems/什么是完美转发？.md"}');export{c as comp,m as data};
