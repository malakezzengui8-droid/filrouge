# ---- Base image ----
FROM node:20-alpine

# ---- Working directory inside the container ----
WORKDIR /app

# ---- Install dependencies first ----
COPY package*.json ./

RUN npm install --omit=dev

# ---- Copy the rest of the source code ----
COPY . .

# ---- The port your Express app listens on ----
ENV PORT=8000
EXPOSE 8000

# ---- Healthcheck ----
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s \
  CMD wget -qO- http://localhost:8000/api/health || exit 1

# ---- Start the server ----
CMD ["node", "src/server.js"]