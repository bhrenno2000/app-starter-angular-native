import { findShowcaseCategory } from '../../hooks/use-showcase';
export function appLinkTarget(path: string | null): string | null {
  if (path === '/home' || path === '/showcase') return path;
  const match = /^\/showcase\/([a-z][a-z0-9-]*)$/.exec(path ?? '');
  return match && findShowcaseCategory(match[1]) ? path : null;
}
export function parseAppLink(url: string | null): string | null {
  if (!url || !/^appstarterangular:\/\//i.test(url)) return null;
  return appLinkTarget(url.replace(/^appstarterangular:\/\/\/?/i, '/'));
}
export function appLinkParent(path: string): string | null {
  const target = appLinkTarget(path);
  if (target === '/showcase') return '/home';
  return target?.startsWith('/showcase/') ? '/showcase' : null;
}
