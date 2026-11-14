FROM node:20-slim

WORKDIR /app

COPY package*.json ./
RUN npm install --legacy-peer-deps --omit=dev && npm install --no-save tsx

COPY server.ts tsconfig.json ./
COPY public ./public

ENV NODE_ENV=production
ENV PORT=8080

EXPOSE 8080
CMD ["npx", "tsx", "server.ts"]
