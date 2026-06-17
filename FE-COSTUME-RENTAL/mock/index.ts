import type { Application } from 'express'
import express from 'express'
import fileUpload from 'express-fileupload'
import jsonServer, { type JsonServerRouter } from 'json-server'
import path from 'path'
import { bootstrap } from './lib'
import { registerAllRoutes } from './routes'

const app = jsonServer.create() as Application & { db: JsonServerRouter<object>['db'] }

export const router = jsonServer.router('mock/db.json')

// Initialize query helpers with the router instance
bootstrap(router)

// Bind the router db to the app (required for json-server-auth)
app.db = router.db

app.use(jsonServer.defaults())
app.use(jsonServer.bodyParser)

// File upload middleware
app.use(
  fileUpload({
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    abortOnLimit: true,

    responseOnLimit: 'File size exceeded the limit of 5MB',
    // parseNested: true,
  })
)

// Serve static files from public directory
app.use(express.static(path.join(process.cwd(), 'public')))

// Register all routes
registerAllRoutes(app)

const PORT = 8000
app.listen(PORT, () => {
  console.log(`JSON Server is running on http://localhost:${PORT}`)
})

export default app
