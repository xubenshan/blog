import{_ as n}from"./plugin-vue_export-helper-DlAUqK2U.js";import{c as a,b as l,o as i}from"./app-GSthvjD8.js";const e={};function p(c,s){return i(),a("div",null,[...s[0]||(s[0]=[l(`<p>内存池是一种内存分配方式，它预先在内存中分配一定数量的块或对象，形成一个 “池”。当程序需要分配内存时，它从这个池中分配一个块；当内存被释放时，这个块返回到池中以供再次使用。内存池可以显著减少频繁分配和释放内存所带来的开销，并且有助于避免内存碎片化，提高内存使用效率。</p><p>下面展示了如何设计一个简单的内存池，这个简单的内存池设计包括以下几个关键特性：</p><ul><li><strong>预分配</strong>：在构造函数中预先分配了一定数量的固定大小内存块。</li><li><strong>分配与释放</strong>： <code>allocate</code> 方法从池中分配一个内存块，而 <code>deallocate</code> 方法则将不再使用的内存块返还给池。</li><li><strong>管理策略</strong>：本例中使用 <code>std::list</code> 来管理空闲内存块，但实际应用中可能需考虑更高效的数据结构。</li></ul><div class="language- line-numbers-mode" data-highlighter="shiki" data-ext="" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34;"><pre class="shiki shiki-themes one-light one-dark-pro vp-code"><code class="language-"><span class="line"><span>#include &lt;iostream&gt;</span></span>
<span class="line"><span>#include &lt;list&gt;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>class MemoryPool {</span></span>
<span class="line"><span>public:</span></span>
<span class="line"><span>    MemoryPool(size_t size, unsigned int count) {</span></span>
<span class="line"><span>        for (unsigned int i = 0; i &lt; count; ++i) {</span></span>
<span class="line"><span>            freeBlocks.push_back(new char[size]);</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>        blockSize = size;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    ~MemoryPool() {</span></span>
<span class="line"><span>        for (auto block : freeBlocks) {</span></span>
<span class="line"><span>            delete[] block;</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    void* allocate() {</span></span>
<span class="line"><span>        if (freeBlocks.empty()) {</span></span>
<span class="line"><span>            throw std::bad_alloc();</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>        char* block = freeBlocks.front();</span></span>
<span class="line"><span>        freeBlocks.pop_front();</span></span>
<span class="line"><span>        return block;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    void deallocate(void* block) {</span></span>
<span class="line"><span>        freeBlocks.push_back(static_cast&lt;char*&gt;(block));</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>private:</span></span>
<span class="line"><span>    std::list&lt;char*&gt; freeBlocks;</span></span>
<span class="line"><span>    size_t blockSize;</span></span>
<span class="line"><span>};</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 使用示例</span></span>
<span class="line"><span>int main() {</span></span>
<span class="line"><span>    const int blockSize = 32; // 块大小</span></span>
<span class="line"><span>    const int blockCount = 10; // 块数量</span></span>
<span class="line"><span>    MemoryPool pool(blockSize, blockCount);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    // 分配内存</span></span>
<span class="line"><span>    void* ptr1 = pool.allocate();</span></span>
<span class="line"><span>    void* ptr2 = pool.allocate();</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    // 使用ptr1和ptr2...</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    // 释放内存</span></span>
<span class="line"><span>    pool.deallocate(ptr1);</span></span>
<span class="line"><span>    pool.deallocate(ptr2);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    return 0;</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div>`,4)])])}const v=n(e,[["render",p]]),o=JSON.parse('{"path":"/%E5%85%AB%E8%82%A1%E6%96%87/problems/%E5%86%85%E5%AD%98%E6%B1%A0%E6%98%AF%E4%BB%80%E4%B9%88%EF%BC%9F%E5%9C%A8C__%E4%B8%AD%E5%A6%82%E4%BD%95%E8%AE%BE%E8%AE%A1%E4%B8%80%E4%B8%AA%E7%AE%80%E5%8D%95%E7%9A%84%E5%86%85%E5%AD%98%E6%B1%A0%EF%BC%9F.html","title":"","lang":"zh-CN","frontmatter":{"feed":false,"seo":false,"head":[]},"git":{"createdTime":1768196265000,"updatedTime":1768196265000,"contributors":[{"name":"xubenshan","username":"xubenshan","email":"1782622988@qq.com","commits":1,"url":"https://github.com/xubenshan"}]},"readingTime":{"minutes":1.25,"words":375},"filePathRelative":"八股文/problems/内存池是什么？在C++中如何设计一个简单的内存池？.md"}');export{v as comp,o as data};
