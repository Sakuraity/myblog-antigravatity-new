# Cloudflare Pages 点赞功能绑定指南

你的博客现在支持在 Cloudflare Pages 上直接运行点赞后端。为了让它工作，你需要在 Cloudflare 控制面板进行一次性配置：

### 配置步骤

1. **创建 KV 命名空间**：
   - 登录 [Cloudflare Dashboard](![alt text](image.png))。
   - 点击 **Workers & Pages** -> **KV** -> **Create a namespace**。
   - 名字建议叫 `blog-likes-kv`。

2. **绑定到项目**：
   - 进入你的 **Pages 项目** 详情页。
   - 点击 **Settings (设置)** -> **Functions (函数)**。
   - 滚动到 **KV namespace bindings (KV 命名空间绑定)** 区域。
   - 点击 **Add binding (添加绑定)**。
   - **Variable name (变量名)**：必须填 `BLOG_LIKES`（大写，代码中调用的就是这个名）。
   - **KV namespace (KV 命名空间)**：选择你刚才创建的 `blog-likes-kv`。
   - **重要**：记得在 **Production (生产)** 和 **Preview (预览)** 环境都添加这个绑定。

3. **重新部署**：
   - 配置完成后，再次推送代码或手动触发一次部署。

### 验证
部署成功后，你可以访问你的博客，点击大拇指。如果配置正确，你的点赞将永久存储在 Cloudflare 边缘网络中。

你可以通过访问以下路径查看统计数据：
`https://your-domain.com/api/stats`
