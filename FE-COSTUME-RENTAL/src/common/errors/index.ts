export class RetriableError extends Error {}
export class FatalError extends Error {}
export class UnauthorizedError extends Error {
  constructor(message: string) {
    super(message)
    Object.setPrototypeOf(this, UnauthorizedError.prototype)
    this.name = 'UnauthorizedError'
  }
}
export class FetchError extends Error {
  constructor(
    public readonly status: number,
    public readonly body: unknown
  ) {
    super(`HTTP ${status}`)
    this.name = 'FetchError'
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      status: this.status,
      body: this.body,
    }
  }
}
