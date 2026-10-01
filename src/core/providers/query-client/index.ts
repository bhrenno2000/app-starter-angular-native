import { provideTanStackQuery, QueryClient } from '@tanstack/angular-query-experimental';
export function provideNativeQueries() {
  return provideTanStackQuery(
    new QueryClient({ defaultOptions: { queries: { retry: 1, staleTime: 60_000 } } }),
  );
}
