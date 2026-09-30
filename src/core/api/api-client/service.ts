import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom, timeout } from 'rxjs';
import { z } from 'zod';
import { env } from '@/core/constants/env';
@Injectable({ providedIn: 'root' })
export class ApiClient {
  private readonly http = inject(HttpClient);
  async request<T>(
    method: 'GET' | 'POST',
    path: string,
    schema: z.ZodType<T>,
    body?: unknown,
    accessToken?: string,
  ): Promise<T> {
    if (!env.apiUrl.startsWith('https://'))
      throw new Error('Configure an HTTPS API in EXPO_PUBLIC_API_URL.');
    const response = await firstValueFrom(
      this.http
        .request<unknown>(method, `${env.apiUrl.replace(/\/$/, '')}${path}`, {
          body,
          headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
        })
        .pipe(timeout(15000)),
    );
    const envelope = z.object({ data: schema }).safeParse(response);
    return envelope.success ? envelope.data.data : schema.parse(response);
  }
}
