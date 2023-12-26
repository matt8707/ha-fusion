FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json .
RUN npm install --verbose
COPY . .
RUN npm run build --no-cache
RUN npm prune --omit=dev

FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/build ./build
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/server.js .
COPY package.json .

RUN ln -s /app/build/client/themes ./themes

ENV PORT 5050
ENV NODE_ENV=production
EXPOSE 5050

CMD ["node", "server.js"]
