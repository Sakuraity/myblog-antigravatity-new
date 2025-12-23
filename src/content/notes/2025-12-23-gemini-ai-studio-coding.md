---
date: 2025-12-23T15:47:39+08:00
tags: ["Jike", "随想"]
---

和 coding 对话不能太具体，比如我把模块拆的很细，明确了技术栈，出来的效果很一般，甚至我很难找到一个主线去优化。

这是我昨晚的进度。我选择了停下来。

今天我重新让gemini 把任务进行处理，去除了具体的 API 名称 and 特定技术栈，重点保留了各模块的功能逻辑与核心能力描述。

然后发给了 AI studio，而不是 antigravity。

速度快，效果出奇的好，autofix 几个 bug后，整个产品就处在可用状态，我可以专注去调整 prompt，以及优化一些基础能力的设计，测试效果，而不是陷在各种影响mvp使用的细节bug里。

当 AI studio 搞定后，生成一个Docstring，再让 coding 去做，效果应该会更好

<a href="https://web.okjike.com/u/815916E7-5BD5-4EC6-9EB1-14458F0E11CE/post/694a00ecf9f724324f3221a7" target="_blank" class="inline-flex items-center gap-1.5 px-3 py-1.5 mt-1 text-xs font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-zinc-800 rounded-full hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors no-underline group-hover:bg-gray-200 dark:group-hover:bg-zinc-700">
  <span>查看原文</span>
  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-external-link"><path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg>
</a>
