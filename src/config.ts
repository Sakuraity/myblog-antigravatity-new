// 站点集中配置 —— 域名、作者、社交链接等统一在此维护
// 修改这里即可全站生效，避免占位符散落在各组件中

export const SITE = {
    // 站点标题与描述（用于 SEO 默认值）
    title: "Kangyuan's Blog",
    description: "安放思考，自由表达，分享创造。产品、技术、商业与生活的观察。",
    tagline: "安放思考，自由表达，分享创造",

    // 站点 URL —— 与 astro.config.mjs 的 site 保持一致
    url: "https://kangyuan-blog.vercel.app",

    // 作者信息
    author: "Kangyuan",
    email: "hello@example.com", // TODO: 替换为你的真实邮箱
    githubHandle: "Sakuraity",

    // 社交链接（footer 与 about 页引用）
    social: {
        github: "https://github.com/Sakuraity",
        twitter: "", // TODO: 填入你的 X/Twitter 主页，留空则不显示
    },
} as const;
