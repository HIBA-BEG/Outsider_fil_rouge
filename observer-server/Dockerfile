FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json tsconfig*.json ./

RUN npm install

COPY . .

RUN npm run build

FROM node:20-alpine

WORKDIR /app

RUN mkdir -p uploads-event uploads-profile

COPY package*.json ./

RUN npm ci --only=production

COPY --from=builder /app/dist ./dist

RUN echo "=== Contents of /app/dist in production ==="
RUN ls -la /app/dist/
RUN find /app/dist                  

RUN mkdir -p /app/uploads-event /app/uploads-profile

EXPOSE 3000

CMD ["node", "dist/src/main.js"]
