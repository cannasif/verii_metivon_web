export interface PagedTransportInput {
  method?: string;
  url?: string;
  params?: unknown;
}

export interface PagedTransportResult {
  method?: string;
  url?: string;
  params?: unknown;
  data?: Record<string, unknown>;
  tunneled: boolean;
}

function paramsToRecord(params: unknown): Record<string, unknown> {
  if (!params) return {};
  if (params instanceof URLSearchParams) {
    const result: Record<string, unknown> = {};
    for (const [key, value] of params.entries()) {
      const current = result[key];
      result[key] = current === undefined
        ? value
        : Array.isArray(current)
          ? [...current, value]
          : [current, value];
    }
    return result;
  }
  return typeof params === 'object' && !Array.isArray(params)
    ? { ...(params as Record<string, unknown>) }
    : {};
}

function splitUrl(url?: string): { path?: string; query: Record<string, unknown> } {
  if (!url) return { path: url, query: {} };
  const questionIndex = url.indexOf('?');
  if (questionIndex < 0) return { path: url, query: {} };
  return {
    path: url.slice(0, questionIndex),
    query: paramsToRecord(new URLSearchParams(url.slice(questionIndex + 1))),
  };
}

function isPagedPayload(payload: Record<string, unknown>): boolean {
  return Object.keys(payload).some((key) => {
    const normalized = key.toLowerCase();
    return normalized === 'pagenumber' || normalized === 'pagesize';
  });
}

function appendQueryRoute(path?: string): string | undefined {
  if (!path) return path;
  return path.toLowerCase().endsWith('/query')
    ? path
    : `${path.replace(/\/$/, '')}/query`;
}

function normalizePagedPayload(payload: Record<string, unknown>): Record<string, unknown> {
  const normalized = { ...payload };
  const filtersKey = Object.keys(normalized).find((key) => key.toLowerCase() === 'filters');
  const logicKey = Object.keys(normalized).find((key) => key.toLowerCase() === 'filterlogic');
  const rawFilters = filtersKey ? normalized[filtersKey] : undefined;

  if (typeof rawFilters === 'string') {
    try {
      const parsed = JSON.parse(rawFilters) as unknown;
      normalized.filters = Array.isArray(parsed) ? parsed : [];
    } catch {
      normalized.filters = [];
    }
    if (filtersKey !== 'filters') delete normalized[filtersKey!];
  } else if (Array.isArray(rawFilters)) {
    normalized.filters = rawFilters;
    if (filtersKey !== 'filters') delete normalized[filtersKey!];
  } else if (!filtersKey) {
    normalized.filters = [];
  }

  const rawLogic = logicKey ? normalized[logicKey] : undefined;
  normalized.filterLogic =
    typeof rawLogic === 'string' && rawLogic.toLowerCase() === 'or' ? 'or' : 'and';
  if (logicKey && logicKey !== 'filterLogic') delete normalized[logicKey];
  return normalized;
}

/** Converts only paged GET requests to POST /query with a JSON body. */
export function resolvePagedPostTransport(input: PagedTransportInput): PagedTransportResult {
  if ((input.method ?? 'get').toLowerCase() !== 'get') {
    return { method: input.method, url: input.url, params: input.params, tunneled: false };
  }

  const { path, query } = splitUrl(input.url);
  const data = { ...query, ...paramsToRecord(input.params) };
  if (!isPagedPayload(data)) {
    return { method: input.method, url: input.url, params: input.params, tunneled: false };
  }

  return {
    method: 'post',
    url: appendQueryRoute(path),
    params: undefined,
    data: normalizePagedPayload(data),
    tunneled: true,
  };
}
