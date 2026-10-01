import { withInterceptors } from '@angular/common/http';
import { provideNativeHttpClient } from '@ng-native/platform/http';
import { authInterceptor } from '@/core/api/auth-interceptor';
export function provideAppHttp() {
  return provideNativeHttpClient(withInterceptors([authInterceptor]));
}
