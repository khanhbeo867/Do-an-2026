export module 'axios' {
  export interface InternalAxiosRequestConfig {
    retry: boolean
  }
  export interface AxiosErrorFilter {
    resolve: (value: unknown) => void
    reject: (reason?: any) => void
  }
}
