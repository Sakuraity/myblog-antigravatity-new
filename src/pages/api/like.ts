// src/pages/api/like.ts
// 适配 Cloudflare Pages KV 的点赞接口 (支持 GET 查询和 POST 增加)

export const prerender = false;

import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ request, locals }) => {
    try {
        const url = new URL(request.url);
        const id = url.searchParams.get('id');

        if (!id) {
            return new Response(
                JSON.stringify({ error: 'Missing id' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        const runtime = (locals as any).runtime;
        const BLOG_LIKES = runtime?.env?.BLOG_LIKES;

        if (!BLOG_LIKES) {
            // 开发环境下或未配置 KV 时返回 0，不报错以防止 UI 崩溃
            return new Response(JSON.stringify({ count: 0 }), {
                status: 200, headers: { 'Content-Type': 'application/json' }
            });
        }

        const key = `post_likes:${id}`;
        const count = parseInt(await BLOG_LIKES.get(key) || "0");

        return new Response(
            JSON.stringify({ id, count }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
    } catch (error) {
        return new Response(
            JSON.stringify({ count: 0 }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
    }
};

export const POST: APIRoute = async ({ request, locals }) => {
    try {
        const body = await request.json();
        const { id, type } = body;

        if (!id || !type) {
            return new Response(
                JSON.stringify({ error: 'Missing id or type' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        const runtime = (locals as any).runtime;
        const BLOG_LIKES = runtime?.env?.BLOG_LIKES;

        if (!BLOG_LIKES) {
            return new Response(
                JSON.stringify({ success: true, count: 1, message: 'Local mode' }),
                { status: 200, headers: { 'Content-Type': 'application/json' } }
            );
        }

        const key = `post_likes:${id}`;
        const currentCount = parseInt(await BLOG_LIKES.get(key) || "0");
        const newCount = currentCount + 1;

        await BLOG_LIKES.put(key, newCount.toString());

        return new Response(
            JSON.stringify({ success: true, id, count: newCount }),
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
