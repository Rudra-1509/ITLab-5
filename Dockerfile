FROM node:20-alpine

WORKDIR /app

# Install dependencies first for better caching
COPY package*.json ./
RUN npm install --omit=dev

# Copy application source code
COPY src ./src
COPY .env.example ./.env

EXPOSE 5000

ENV PORT=5000
ENV HOST=0.0.0.0
ENV NODE_ENV=production
ENV CORS_ORIGIN=*

CMD ["node", "src/server.js"]
