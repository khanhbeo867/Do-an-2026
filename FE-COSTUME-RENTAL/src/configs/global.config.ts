import env from '@/lib/utils'

export class GlobalConfig {
  public static readonly QUERY_CLIENT_CACHE_STORAGE_KEY = 'queryClientOfflineCache'
  public static readonly TOAST_DURATION = 2000
  public static readonly BASE_API_URL = env<string>('VITE_EXTERNAL_API_URL')!
}
