FROM node:20-alpine

# Run as the unprivileged "node" user that the base image already ships.
WORKDIR /app

# Install deps first so the dependency layer can be cached.
COPY --chown=node:node package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --chown=node:node . .

ENV NODE_ENV=production
EXPOSE 5000
USER node

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget -qO- http://127.0.0.1:5000/health || exit 1

CMD ["node", "server.js"]
