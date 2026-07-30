# Stage 1: Install production dependencies
FROM node:20-alpine AS deps

WORKDIR /usr/src/app

COPY package*.json ./

# Install only production dependencies
RUN npm ci --omit=dev

# Stage 2: Production runtime image
FROM node:20-alpine AS runner

WORKDIR /usr/src/app

ENV NODE_ENV=production

# Copy package info and dependencies with correct non-root permissions
COPY package*.json ./
COPY --from=deps --chown=node:node /usr/src/app/node_modules ./node_modules

# Copy app source files with correct non-root permissions
COPY --chown=node:node index.js ./

# Run as non-privileged user
USER node

EXPOSE 3000

CMD ["node", "index.js"]