FROM node:20-alpine

WORKDIR /app

# Install backend dependencies first for Docker caching
COPY backend/package*.json ./backend/
RUN cd backend && npm install --omit=dev

# Copy backend and database modules
COPY backend ./backend
COPY database ./database

WORKDIR /app/backend

EXPOSE 5000

ENV PORT=5000
ENV HOST=0.0.0.0
ENV NODE_ENV=production
ENV CORS_ORIGIN=*

CMD ["node", "src/server.js"]
