export interface HttpMethodTunnelInput {
  method?: string;
  url?: string;
}

export interface HttpMethodTunnelResult {
  method?: string;
  url?: string;
  tunneled: boolean;
  originalMethod: string;
}

function appendPathSegment(url: string | undefined, segment: string): string | undefined {
  if (!url) return url;
  const [path, query] = url.split('?');
  const suffix = `/${segment}`;
  const nextPath = path.toLowerCase().endsWith(suffix)
    ? path
    : `${path.replace(/\/$/, '')}${suffix}`;
  return query ? `${nextPath}?${query}` : nextPath;
}

function isPutActionAlreadyInPath(url: string | undefined): boolean {
  if (!url) return false;
  const path = url.split('?')[0].toLowerCase();
  if (/\/bulk-(quotation|order|demand)\/\d+/.test(path)) return true;
  if (/\/(quotationline|orderline|demandline)\/update-multiple$/.test(path)) return true;
  if (path.includes('exchangerate/update-exchange-rate-in-')) return true;
  return path.endsWith('/notes-list');
}

/**
 * Converts browser-facing PUT/DELETE requests to IIS-safe POST routes.
 * The API restores the native verb before endpoint routing.
 */
export function resolveIisSafeHttpMethod(input: HttpMethodTunnelInput): HttpMethodTunnelResult {
  const originalMethod = (input.method ?? 'get').toLowerCase();
  if (originalMethod === 'put') {
    return {
      method: 'post',
      url: isPutActionAlreadyInPath(input.url) ? input.url : appendPathSegment(input.url, 'update'),
      tunneled: true,
      originalMethod,
    };
  }

  if (originalMethod === 'delete') {
    return {
      method: 'post',
      url: appendPathSegment(input.url, 'delete'),
      tunneled: true,
      originalMethod,
    };
  }

  return { method: input.method, url: input.url, tunneled: false, originalMethod };
}
