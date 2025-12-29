// src/pages/api/stats.ts
// 适配 Cloudflare Pages KV 的点赞统计接口

export const prerender = false;

import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ locals }) => {
    try {
        const runtime = (locals as any).runtime;
        const BLOG_LIKES = runtime?.env?.BLOG_LIKES;

        if (!BLOG_LIKES) {
            return new Response(
                JSON.stringify({ error: 'Backend configuration missing' }),
                { status: 500, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // 列出所有以 post_likes: 开头的键
        const list = await BLOG_LIKES.list({ prefix: 'post_likes:' });
        const stats: Record<string, number> = {};

        for (const key of list.keys) {
            const value = await BLOG_LIKES.get(key.name);
            stats[key.name.replace('post_likes:', '')] = parseInt(value || "0");
        }

        return new Response(
            JSON.stringify({
                success: true,
                total_items: list.keys.length,
                stats
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
    } catch (error) {
        return new Response(
            JSON.stringify({ error: 'Internal server error' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
};
