FROM node:20-alpine AS construcao
WORKDIR /app
RUN npm install
COPY src/ ./src/

FROM node:20-alpine
WORKDIR /app
COPY --from=construcao /app .
EXPOSE 3001
CMD ["node", "src/app.js"]
