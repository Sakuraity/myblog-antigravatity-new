// src/pages/api/like.ts
// 适配 Cloudflare Pages KV 的点赞接口
// 支持 GET 查询、POST 点赞、DELETE 取消点赞

export const prerender = false;

import type { APIRoute } from 'astro';

// GET: 获取某篇文章的点赞数
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
            // 开发环境返回 0
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

// POST: 点赞 (+1)
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

// DELETE: 取消点赞 (-1)
export const DELETE: APIRoute = async ({ request, locals }) => {
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
                JSON.stringify({ success: true, count: 0, message: 'Local mode' }),
                { status: 200, headers: { 'Content-Type': 'application/json' } }
            );
        }

        const key = `post_likes:${id}`;
        const currentCount = parseInt(await BLOG_LIKES.get(key) || "0");
        // 确保不会变成负数
        const newCount = Math.max(0, currentCount - 1);

        await BLOG_LIKES.put(key, newCount.toString());

        return new Response(
            JSON.stringify({ success: true, id, count: newCount }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
    } catch (error) {
        console.error('[Unlike Error]', error);
        return new Response(
            JSON.stringify({ error: 'Internal server error' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
};
