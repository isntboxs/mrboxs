import 'dotenv/config'
import { createEnv } from '@t3-oss/env-core'
import { z } from 'zod'

export const env = createEnv({
  server: {
    LASTFM_USERNAME: z.string().trim().min(1).optional(),
    LASTFM_API_KEY: z.string().trim().min(1).optional(),
  },

  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
})
