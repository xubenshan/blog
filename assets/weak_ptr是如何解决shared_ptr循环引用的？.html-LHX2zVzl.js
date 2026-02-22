import{_ as n}from"./plugin-vue_export-helper-DlAUqK2U.js";import{c as a,b as l,o as e}from"./app-fLVw3A3k.js";const i={};function p(d,s){return e(),a("div",null,[...s[0]||(s[0]=[l(`<p>当两个对象相互引用并使用<code>shared_ptr</code>时，就会形成循环引用。例如，考虑一个简单的场景：</p><div class="language- line-numbers-mode" data-highlighter="shiki" data-ext="" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34;"><pre class="shiki shiki-themes one-light one-dark-pro vp-code"><code class="language-"><span class="line"><span>#include &lt;memory&gt;</span></span>
<span class="line"><span>#include &lt;iostream&gt;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>class B; // 前置声明</span></span>
<span class="line"><span></span></span>
<span class="line"><span>class A {</span></span>
<span class="line"><span>public:</span></span>
<span class="line"><span>    std::shared_ptr&lt;B&gt; b_ptr;</span></span>
<span class="line"><span>    A() { std::cout &lt;&lt; &quot;A constructor&quot; &lt;&lt; std::endl; }</span></span>
<span class="line"><span>    ~A() { std::cout &lt;&lt; &quot;A destructor&quot; &lt;&lt; std::endl; }</span></span>
<span class="line"><span>};</span></span>
<span class="line"><span></span></span>
<span class="line"><span>class B {</span></span>
<span class="line"><span>public:</span></span>
<span class="line"><span>    std::shared_ptr&lt;A&gt; a_ptr;</span></span>
<span class="line"><span>    B() { std::cout &lt;&lt; &quot;B constructor&quot; &lt;&lt; std::endl; }</span></span>
<span class="line"><span>    ~B() { std::cout &lt;&lt; &quot;B destructor&quot; &lt;&lt; std::endl; }</span></span>
<span class="line"><span>};</span></span>
<span class="line"><span></span></span>
<span class="line"><span>int main() {</span></span>
<span class="line"><span>    std::shared_ptr&lt;A&gt; a = std::make_shared&lt;A&gt;();</span></span>
<span class="line"><span>    std::shared_ptr&lt;B&gt; b = std::make_shared&lt;B&gt;();</span></span>
<span class="line"><span>    </span></span>
<span class="line"><span>    a-&gt;b_ptr = b;</span></span>
<span class="line"><span>    b-&gt;a_ptr = a;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    return 0;</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>在这个例子中，类 <code>A</code> 拥有一个指向类 <code>B</code> 的 <code>shared_ptr</code>，而类 <code>B</code> 拥有一个指向类 <code>A</code> 的 <code>shared_ptr</code>。这样就形成了循环引用。</p><p>为了避免循环引用，我们可以改用 <code>weak_ptr</code> 来解决这个问题：</p><div class="language- line-numbers-mode" data-highlighter="shiki" data-ext="" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34;"><pre class="shiki shiki-themes one-light one-dark-pro vp-code"><code class="language-"><span class="line"><span>#include &lt;memory&gt;</span></span>
<span class="line"><span>#include &lt;iostream&gt;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>class B; // 前置声明</span></span>
<span class="line"><span></span></span>
<span class="line"><span>class A {</span></span>
<span class="line"><span>public:</span></span>
<span class="line"><span>    std::shared_ptr&lt;B&gt; b_ptr;</span></span>
<span class="line"><span>    A() { std::cout &lt;&lt; &quot;A constructor&quot; &lt;&lt; std::endl; }</span></span>
<span class="line"><span>    ~A() { std::cout &lt;&lt; &quot;A destructor&quot; &lt;&lt; std::endl; }</span></span>
<span class="line"><span>};</span></span>
<span class="line"><span></span></span>
<span class="line"><span>class B {</span></span>
<span class="line"><span>public:</span></span>
<span class="line"><span>    std::weak_ptr&lt;A&gt; a_weak_ptr;  // 使用 weak_ptr</span></span>
<span class="line"><span>    B() { std::cout &lt;&lt; &quot;B constructor&quot; &lt;&lt; std::endl; }</span></span>
<span class="line"><span>    ~B() { std::cout &lt;&lt; &quot;B destructor&quot; &lt;&lt; std::endl; }</span></span>
<span class="line"><span>};</span></span>
<span class="line"><span></span></span>
<span class="line"><span>int main() {</span></span>
<span class="line"><span>    std::shared_ptr&lt;A&gt; a = std::make_shared&lt;A&gt;();</span></span>
<span class="line"><span>    std::shared_ptr&lt;B&gt; b = std::make_shared&lt;B&gt;();</span></span>
<span class="line"><span>    </span></span>
<span class="line"><span>    a-&gt;b_ptr = b;</span></span>
<span class="line"><span>    b-&gt;a_weak_ptr = a;  // 使用 weak_ptr</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    return 0;</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>通过将类 <code>B</code> 中指向类 <code>A</code> 的指针改为 <code>weak_ptr</code>，我们成功地避免了循环引用问题。</p>`,6)])])}const r=n(i,[["render",p]]),u=JSON.parse('{"path":"/%E5%85%AB%E8%82%A1%E6%96%87/problems/weak_ptr%E6%98%AF%E5%A6%82%E4%BD%95%E8%A7%A3%E5%86%B3shared_ptr%E5%BE%AA%E7%8E%AF%E5%BC%95%E7%94%A8%E7%9A%84%EF%BC%9F.html","title":"","lang":"zh-CN","frontmatter":{"feed":false,"seo":false,"head":[]},"git":{"createdTime":1768196265000,"updatedTime":1768196265000,"contributors":[{"name":"xubenshan","username":"xubenshan","email":"1782622988@qq.com","commits":1,"url":"https://github.com/xubenshan"}]},"readingTime":{"minutes":0.96,"words":288},"filePathRelative":"八股文/problems/weak_ptr是如何解决shared_ptr循环引用的？.md"}');export{r as comp,u as data};
