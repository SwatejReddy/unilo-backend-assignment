import { Hono } from 'hono'
import { adminRouter } from './routes/admin.routes'
import { participantRouter } from './routes/participant.routes'
import { authRouter } from './routes/auth.routes'
import { eventRouter } from './routes/event.routes'

const app = new Hono()
const BASE_API = '/api/v1'

app.route(`${BASE_API}/admin`, adminRouter)
app.route(`${BASE_API}/participant`, participantRouter)
app.route(`${BASE_API}/auth`, authRouter)
app.route(`${BASE_API}/event`, eventRouter)

export default app