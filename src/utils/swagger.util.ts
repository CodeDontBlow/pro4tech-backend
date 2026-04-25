import { SwaggerCustomOptions } from '@nestjs/swagger';

export function getSwaggerCustomOptions(): SwaggerCustomOptions {
  return {
    swaggerOptions: {
      persistAuthorization: true,
      responseInterceptor: (response: any) => {
        try {
          const url = String(response?.url ?? '');
          const isAuthLogin = /\/auth\/login(?:\?|$)/.test(url);

          if (!isAuthLogin) {
            return response;
          }

          let payload: any = response?.body ?? response?.obj;

          if (typeof payload === 'string') {
            payload = JSON.parse(payload);
          }

          const token =
            payload?.access_token ?? payload?.accessToken ?? payload?.token;

          if (!token) {
            return response;
          }

          const runtime = globalThis as any;
          runtime?.ui?.preauthorizeApiKey?.('bearer', token);
        } catch {
          // Keep Swagger response flow unchanged even if auto-auth parsing fails.
        }

        return response;
      },
    },
  };
}
