# syntax=docker/dockerfile:1.7

# -----------------------------------------------------------------------------
# Stage 1: deps — install seluruh dependency (termasuk devDependencies,
# dibutuhkan untuk proses build di stage berikutnya).
# -----------------------------------------------------------------------------
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
# --ignore-scripts: lewati "postinstall" (prisma generate) di sini karena
# prisma/schema.prisma belum ada di stage ini. Generate dijalankan manual
# di stage "builder" setelah seluruh source code disalin.
RUN npm ci --ignore-scripts

# -----------------------------------------------------------------------------
# Stage 2: builder — generate Prisma Client, lalu build aplikasi Next.js.
# -----------------------------------------------------------------------------
FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# `next build` mengevaluasi src/lib/db.ts (termasuk validasi DATABASE_URL),
# tapi tidak pernah benar-benar membuka koneksi database saat build.
# Nilai di bawah ini HANYA placeholder untuk fase build; nilai sungguhan
# datang dari environment yang dikirim podman-compose.yml saat container
# dijalankan (env runtime menimpa ENV bawaan image).
ENV DATABASE_URL="postgresql://build:build@localhost:5432/build?schema=public"
ENV AUTH_SECRET="build-time-placeholder-secret-please-ignore"
ENV NEXT_TELEMETRY_DISABLED=1

RUN npx prisma generate
RUN npm run build

# -----------------------------------------------------------------------------
# Stage 3: runner — image produksi, hanya membawa hasil build "standalone".
# -----------------------------------------------------------------------------
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Safety net: penjejakan dependency otomatis Next.js (output: "standalone")
# kadang tidak menangkap seluruh aset runtime Prisma 7 (mis. query engine
# WASM & kode hasil `prisma generate`). Disalin ulang secara eksplisit
# agar container tetap bisa terhubung ke database walau tracer melewatkannya.
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder --chown=nextjs:nodejs /app/src/generated ./src/generated

USER nextjs
EXPOSE 3000

CMD ["node", "server.js"]
