FROM node:20-alpine AS construcao
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY src/ ./src/

FROM node:20-alpine
WORKDIR /app
COPY --from=construcao /app .
EXPOSE 3001
CMD ["node", "src/app.js"]
