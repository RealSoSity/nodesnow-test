FROM node:22-alpine AS prebuild
WORKDIR /app
COPY ./package*.json .
RUN npm ci

FROM prebuild AS builder
WORKDIR /app
COPY ./src ./src
COPY ./tsconfig.json .
COPY ./tsconfig.build.json .
COPY ./nest-cli.json .
RUN npm run build

FROM node:22-alpine AS final
WORKDIR /app
COPY --chown=node:node --from=builder /app/dist/ ./dist
COPY --chown=node:node package.json .
COPY --chown=node:node package-lock.json .
RUN npm install --production
USER node
CMD ["node", "./dist/main.js"]