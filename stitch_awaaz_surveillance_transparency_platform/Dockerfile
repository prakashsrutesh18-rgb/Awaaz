FROM node:18-alpine
WORKDIR /app

# Install deps
COPY package.json package-lock.json* ./
RUN npm ci --only=production || npm install --production

# Copy app
COPY . .

# Run migrations and start
RUN node migrate.js || true
EXPOSE 3000
CMD ["npm", "start"]
