// Astro API Route: 查看点赞统计
// GET /api/stats - 返回所有点赞统计（仅供管理员使用）

export const prerender = false;

import type { APIRoute } from 'astro';

export const GET: APIRoute = async () => {
    return new Response(
        JSON.stringify({
            message: '点赞统计功能需要配置持久化存储',
            hint: '请配置 Vercel KV 或 Upstash Redis 来持久化点赞数据',
            docs: 'https://vercel.com/docs/storage/vercel-kv'
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
};
