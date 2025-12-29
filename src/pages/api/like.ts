// Astro API Route: 记录点赞
// POST /api/like - 接收 { id, type } 记录一次点赞

// 注意：Astro 静态构建模式下 API 路由只在开发时工作
// 生产环境需要启用 SSR 或使用 Vercel/Netlify 适配器

// 简单的内存存储（重启后会清空，仅用于开发测试）
const likeStore: Record<string, number> = {};

export const prerender = false; // 禁用预渲染，使其成为动态端点

import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
    try {
        const body = await request.json();
        const { id, type } = body;

        if (!id || !type) {
            return new Response(
                JSON.stringify({ error: 'Missing id or type' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        const key = `${type}:${id}`;

        // 增加计数
        if (!likeStore[key]) {
            likeStore[key] = 0;
        }
        likeStore[key]++;

        console.log(`[Like] ${key} -> ${likeStore[key]}`);

        return new Response(
            JSON.stringify({ success: true, key, count: likeStore[key] }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
    } catch (error) {
        console.error('[Like Error]', error);
        return new Response(
            JSON.stringify({ error: 'Internal server error' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
};
