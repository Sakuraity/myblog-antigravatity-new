declare module 'astro:content' {
	interface RenderResult {
		Content: import('astro/runtime/server/index.js').AstroComponentFactory;
		headings: import('astro').MarkdownHeading[];
		remarkPluginFrontmatter: Record<string, any>;
	}
	interface Render {
		'.md': Promise<RenderResult>;
	}

	export interface RenderedContent {
		html: string;
		metadata?: {
			imagePaths: Array<string>;
			[key: string]: unknown;
		};
	}
}

declare module 'astro:content' {
	type Flatten<T> = T extends { [K: string]: infer U } ? U : never;

	export type CollectionKey = keyof AnyEntryMap;
	export type CollectionEntry<C extends CollectionKey> = Flatten<AnyEntryMap[C]>;

	export type ContentCollectionKey = keyof ContentEntryMap;
	export type DataCollectionKey = keyof DataEntryMap;

	type AllValuesOf<T> = T extends any ? T[keyof T] : never;
	type ValidContentEntrySlug<C extends keyof ContentEntryMap> = AllValuesOf<
		ContentEntryMap[C]
	>['slug'];

	/** @deprecated Use `getEntry` instead. */
	export function getEntryBySlug<
		C extends keyof ContentEntryMap,
		E extends ValidContentEntrySlug<C> | (string & {}),
	>(
		collection: C,
		// Note that this has to accept a regular string too, for SSR
		entrySlug: E,
	): E extends ValidContentEntrySlug<C>
		? Promise<CollectionEntry<C>>
		: Promise<CollectionEntry<C> | undefined>;

	/** @deprecated Use `getEntry` instead. */
	export function getDataEntryById<C extends keyof DataEntryMap, E extends keyof DataEntryMap[C]>(
		collection: C,
		entryId: E,
	): Promise<CollectionEntry<C>>;

	export function getCollection<C extends keyof AnyEntryMap, E extends CollectionEntry<C>>(
		collection: C,
		filter?: (entry: CollectionEntry<C>) => entry is E,
	): Promise<E[]>;
	export function getCollection<C extends keyof AnyEntryMap>(
		collection: C,
		filter?: (entry: CollectionEntry<C>) => unknown,
	): Promise<CollectionEntry<C>[]>;

	export function getEntry<
		C extends keyof ContentEntryMap,
		E extends ValidContentEntrySlug<C> | (string & {}),
	>(entry: {
		collection: C;
		slug: E;
	}): E extends ValidContentEntrySlug<C>
		? Promise<CollectionEntry<C>>
		: Promise<CollectionEntry<C> | undefined>;
	export function getEntry<
		C extends keyof DataEntryMap,
		E extends keyof DataEntryMap[C] | (string & {}),
	>(entry: {
		collection: C;
		id: E;
	}): E extends keyof DataEntryMap[C]
		? Promise<DataEntryMap[C][E]>
		: Promise<CollectionEntry<C> | undefined>;
	export function getEntry<
		C extends keyof ContentEntryMap,
		E extends ValidContentEntrySlug<C> | (string & {}),
	>(
		collection: C,
		slug: E,
	): E extends ValidContentEntrySlug<C>
		? Promise<CollectionEntry<C>>
		: Promise<CollectionEntry<C> | undefined>;
	export function getEntry<
		C extends keyof DataEntryMap,
		E extends keyof DataEntryMap[C] | (string & {}),
	>(
		collection: C,
		id: E,
	): E extends keyof DataEntryMap[C]
		? Promise<DataEntryMap[C][E]>
		: Promise<CollectionEntry<C> | undefined>;

	/** Resolve an array of entry references from the same collection */
	export function getEntries<C extends keyof ContentEntryMap>(
		entries: {
			collection: C;
			slug: ValidContentEntrySlug<C>;
		}[],
	): Promise<CollectionEntry<C>[]>;
	export function getEntries<C extends keyof DataEntryMap>(
		entries: {
			collection: C;
			id: keyof DataEntryMap[C];
		}[],
	): Promise<CollectionEntry<C>[]>;

	export function render<C extends keyof AnyEntryMap>(
		entry: AnyEntryMap[C][string],
	): Promise<RenderResult>;

	export function reference<C extends keyof AnyEntryMap>(
		collection: C,
	): import('astro/zod').ZodEffects<
		import('astro/zod').ZodString,
		C extends keyof ContentEntryMap
			? {
					collection: C;
					slug: ValidContentEntrySlug<C>;
				}
			: {
					collection: C;
					id: keyof DataEntryMap[C];
				}
	>;
	// Allow generic `string` to avoid excessive type errors in the config
	// if `dev` is not running to update as you edit.
	// Invalid collection names will be caught at build time.
	export function reference<C extends string>(
		collection: C,
	): import('astro/zod').ZodEffects<import('astro/zod').ZodString, never>;

	type ReturnTypeOrOriginal<T> = T extends (...args: any[]) => infer R ? R : T;
	type InferEntrySchema<C extends keyof AnyEntryMap> = import('astro/zod').infer<
		ReturnTypeOrOriginal<Required<ContentConfig['collections'][C]>['schema']>
	>;

	type ContentEntryMap = {
		"library": {
"book-a-brief-history-of-intelligence.md": {
	id: "book-a-brief-history-of-intelligence.md";
  slug: "book-a-brief-history-of-intelligence";
  body: string;
  collection: "library";
  data: InferEntrySchema<"library">
} & { render(): Render[".md"] };
"book-crossing-the-chasm.md": {
	id: "book-crossing-the-chasm.md";
  slug: "book-crossing-the-chasm";
  body: string;
  collection: "library";
  data: InferEntrySchema<"library">
} & { render(): Render[".md"] };
"book-grass-harp.md": {
	id: "book-grass-harp.md";
  slug: "book-grass-harp";
  body: string;
  collection: "library";
  data: InferEntrySchema<"library">
} & { render(): Render[".md"] };
"book-hillbilly-elegy.md": {
	id: "book-hillbilly-elegy.md";
  slug: "book-hillbilly-elegy";
  body: string;
  collection: "library";
  data: InferEntrySchema<"library">
} & { render(): Render[".md"] };
"book-kingdom-of-ice.md": {
	id: "book-kingdom-of-ice.md";
  slug: "book-kingdom-of-ice";
  body: string;
  collection: "library";
  data: InferEntrySchema<"library">
} & { render(): Render[".md"] };
"book-obviously-awesome.md": {
	id: "book-obviously-awesome.md";
  slug: "book-obviously-awesome";
  body: string;
  collection: "library";
  data: InferEntrySchema<"library">
} & { render(): Render[".md"] };
"book-self-as-method.md": {
	id: "book-self-as-method.md";
  slug: "book-self-as-method";
  body: string;
  collection: "library";
  data: InferEntrySchema<"library">
} & { render(): Render[".md"] };
"example-video.md": {
	id: "example-video.md";
  slug: "example-video";
  body: string;
  collection: "library";
  data: InferEntrySchema<"library">
} & { render(): Render[".md"] };
"hao-zao-gao-de-pai-dui.md": {
	id: "hao-zao-gao-de-pai-dui.md";
  slug: "hao-zao-gao-de-pai-dui";
  body: string;
  collection: "library";
  data: InferEntrySchema<"library">
} & { render(): Render[".md"] };
"seven-jungkook.md": {
	id: "seven-jungkook.md";
  slug: "seven-jungkook";
  body: string;
  collection: "library";
  data: InferEntrySchema<"library">
} & { render(): Render[".md"] };
};
"notes": {
"2025-12-19-jike-inspiration.md": {
	id: "2025-12-19-jike-inspiration.md";
  slug: "2025-12-19-jike-inspiration";
  body: string;
  collection: "notes";
  data: InferEntrySchema<"notes">
} & { render(): Render[".md"] };
"2025-12-19-jike-sharing.md": {
	id: "2025-12-19-jike-sharing.md";
  slug: "2025-12-19-jike-sharing";
  body: string;
  collection: "notes";
  data: InferEntrySchema<"notes">
} & { render(): Render[".md"] };
"2025-12-19-rolling-stone-40.md": {
	id: "2025-12-19-rolling-stone-40.md";
  slug: "2025-12-19-rolling-stone-40";
  body: string;
  collection: "notes";
  data: InferEntrySchema<"notes">
} & { render(): Render[".md"] };
"2025-12-19-value-creator-vs-capturer.md": {
	id: "2025-12-19-value-creator-vs-capturer.md";
  slug: "2025-12-19-value-creator-vs-capturer";
  body: string;
  collection: "notes";
  data: InferEntrySchema<"notes">
} & { render(): Render[".md"] };
"2025-12-22-wechat-reading-ai.md": {
	id: "2025-12-22-wechat-reading-ai.md";
  slug: "2025-12-22-wechat-reading-ai";
  body: string;
  collection: "notes";
  data: InferEntrySchema<"notes">
} & { render(): Render[".md"] };
"2025-12-23-gemini-ai-studio-coding.md": {
	id: "2025-12-23-gemini-ai-studio-coding.md";
  slug: "2025-12-23-gemini-ai-studio-coding";
  body: string;
  collection: "notes";
  data: InferEntrySchema<"notes">
} & { render(): Render[".md"] };
"2025-12-25-claude-christmas.md": {
	id: "2025-12-25-claude-christmas.md";
  slug: "2025-12-25-claude-christmas";
  body: string;
  collection: "notes";
  data: InferEntrySchema<"notes">
} & { render(): Render[".md"] };
"2025-12-29-2026-reflection.md": {
	id: "2025-12-29-2026-reflection.md";
  slug: "2025-12-29-2026-reflection";
  body: string;
  collection: "notes";
  data: InferEntrySchema<"notes">
} & { render(): Render[".md"] };
"2025-12-30-youmind-records.md": {
	id: "2025-12-30-youmind-records.md";
  slug: "2025-12-30-youmind-records";
  body: string;
  collection: "notes";
  data: InferEntrySchema<"notes">
} & { render(): Render[".md"] };
"2026-01-03-cpap-experience.md": {
	id: "2026-01-03-cpap-experience.md";
  slug: "2026-01-03-cpap-experience";
  body: string;
  collection: "notes";
  data: InferEntrySchema<"notes">
} & { render(): Render[".md"] };
"2026-01-06-ai-value-creation.md": {
	id: "2026-01-06-ai-value-creation.md";
  slug: "2026-01-06-ai-value-creation";
  body: string;
  collection: "notes";
  data: InferEntrySchema<"notes">
} & { render(): Render[".md"] };
"2026-01-06-human-creation-authenticity.md": {
	id: "2026-01-06-human-creation-authenticity.md";
  slug: "2026-01-06-human-creation-authenticity";
  body: string;
  collection: "notes";
  data: InferEntrySchema<"notes">
} & { render(): Render[".md"] };
"2026-01-08-substack-paid-columns.md": {
	id: "2026-01-08-substack-paid-columns.md";
  slug: "2026-01-08-substack-paid-columns";
  body: string;
  collection: "notes";
  data: InferEntrySchema<"notes">
} & { render(): Render[".md"] };
"2026-01-13-palantir-research.md": {
	id: "2026-01-13-palantir-research.md";
  slug: "2026-01-13-palantir-research";
  body: string;
  collection: "notes";
  data: InferEntrySchema<"notes">
} & { render(): Render[".md"] };
"2026-01-13-system-experience.md": {
	id: "2026-01-13-system-experience.md";
  slug: "2026-01-13-system-experience";
  body: string;
  collection: "notes";
  data: InferEntrySchema<"notes">
} & { render(): Render[".md"] };
"2026-01-13-youmind-renewal.md": {
	id: "2026-01-13-youmind-renewal.md";
  slug: "2026-01-13-youmind-renewal";
  body: string;
  collection: "notes";
  data: InferEntrySchema<"notes">
} & { render(): Render[".md"] };
"2026-01-21-focus-and-wandering.md": {
	id: "2026-01-21-focus-and-wandering.md";
  slug: "2026-01-21-focus-and-wandering";
  body: string;
  collection: "notes";
  data: InferEntrySchema<"notes">
} & { render(): Render[".md"] };
"2026-01-21-taste-drivers-input-filter-discernment.md": {
	id: "2026-01-21-taste-drivers-input-filter-discernment.md";
  slug: "2026-01-21-taste-drivers-input-filter-discernment";
  body: string;
  collection: "notes";
  data: InferEntrySchema<"notes">
} & { render(): Render[".md"] };
};
"posts": {
"2025-year-end-review/index.md": {
	id: "2025-year-end-review/index.md";
  slug: "2025-year-end-review";
  body: string;
  collection: "posts";
  data: InferEntrySchema<"posts">
} & { render(): Render[".md"] };
"2026-推荐一个-ai-产品的选择方式/index.md": {
	id: "2026-推荐一个-ai-产品的选择方式/index.md";
  slug: "2026-推荐一个-ai-产品的选择方式";
  body: string;
  collection: "posts";
  data: InferEntrySchema<"posts">
} & { render(): Render[".md"] };
"Lovable增长负责人Elena Vega：为什么传统获客渠道正在失效，产品如何重新定义分发策略/index.md": {
	id: "Lovable增长负责人Elena Vega：为什么传统获客渠道正在失效，产品如何重新定义分发策略/index.md";
  slug: "lovable增长负责人elena-vega为什么传统获客渠道正在失效产品如何重新定义分发策略";
  body: string;
  collection: "posts";
  data: InferEntrySchema<"posts">
} & { render(): Render[".md"] };
"atlassian-的起点/index.md": {
	id: "atlassian-的起点/index.md";
  slug: "atlassian-的起点";
  body: string;
  collection: "posts";
  data: InferEntrySchema<"posts">
} & { render(): Render[".md"] };
"ventilator-usage-journal/index.md": {
	id: "ventilator-usage-journal/index.md";
  slug: "ventilator-usage-journal";
  body: string;
  collection: "posts";
  data: InferEntrySchema<"posts">
} & { render(): Render[".md"] };
"vibe-coding-后的一些思考/index.md": {
	id: "vibe-coding-后的一些思考/index.md";
  slug: "vibe-coding-后的一些思考";
  body: string;
  collection: "posts";
  data: InferEntrySchema<"posts">
} & { render(): Render[".md"] };
"为什么是诺基亚/index.md": {
	id: "为什么是诺基亚/index.md";
  slug: "为什么是诺基亚";
  body: string;
  collection: "posts";
  data: InferEntrySchema<"posts">
} & { render(): Render[".md"] };
"商业化策略的“五看”/index.md": {
	id: "商业化策略的“五看”/index.md";
  slug: "商业化策略的五看";
  body: string;
  collection: "posts";
  data: InferEntrySchema<"posts">
} & { render(): Render[".md"] };
"复杂的情绪，好奇与谦逊，门缝与屋子/index.md": {
	id: "复杂的情绪，好奇与谦逊，门缝与屋子/index.md";
  slug: "复杂的情绪好奇与谦逊门缝与屋子";
  body: string;
  collection: "posts";
  data: InferEntrySchema<"posts">
} & { render(): Render[".md"] };
"把-ai-的思考和改动可视化/index.md": {
	id: "把-ai-的思考和改动可视化/index.md";
  slug: "把-ai-的思考和改动可视化";
  body: string;
  collection: "posts";
  data: InferEntrySchema<"posts">
} & { render(): Render[".md"] };
"效率、转换、兴趣/index.md": {
	id: "效率、转换、兴趣/index.md";
  slug: "效率转换兴趣";
  body: string;
  collection: "posts";
  data: InferEntrySchema<"posts">
} & { render(): Render[".md"] };
"智能简史1：不要试图一开始就构建完美的系统/index.md": {
	id: "智能简史1：不要试图一开始就构建完美的系统/index.md";
  slug: "智能简史1不要试图一开始就构建完美的系统";
  body: string;
  collection: "posts";
  data: InferEntrySchema<"posts">
} & { render(): Render[".md"] };
"深度-ai-逼-出电网革命-以美国电网建设为例/index.md": {
	id: "深度-ai-逼-出电网革命-以美国电网建设为例/index.md";
  slug: "深度-ai-逼-出电网革命-以美国电网建设为例";
  body: string;
  collection: "posts";
  data: InferEntrySchema<"posts">
} & { render(): Render[".md"] };
"精英叙事的紧绷，而我只想松弛/index.md": {
	id: "精英叙事的紧绷，而我只想松弛/index.md";
  slug: "精英叙事的紧绷而我只想松弛";
  body: string;
  collection: "posts";
  data: InferEntrySchema<"posts">
} & { render(): Render[".md"] };
"网飞为什么收购华纳/index.md": {
	id: "网飞为什么收购华纳/index.md";
  slug: "网飞为什么收购华纳";
  body: string;
  collection: "posts";
  data: InferEntrySchema<"posts">
} & { render(): Render[".md"] };
};
"works": {
"example-project.md": {
	id: "example-project.md";
  slug: "example-project";
  body: string;
  collection: "works";
  data: InferEntrySchema<"works">
} & { render(): Render[".md"] };
};

	};

	type DataEntryMap = {
		
	};

	type AnyEntryMap = ContentEntryMap & DataEntryMap;

	export type ContentConfig = typeof import("../../src/content/config.js");
}
