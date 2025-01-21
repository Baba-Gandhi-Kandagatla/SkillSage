# # Stage 1: Build the application
# FROM node:20 AS builder

# # Set the working directory
# WORKDIR /app

# # Copy package.json and package-lock.json
# COPY package.json package-lock.json ./

# # Set NODE_ENV to production before installing dependencies
# ENV NODE_ENV=production

# # Install dependencies without running scripts
# RUN npm ci --ignore-scripts

# # Copy the rest of the source code
# COPY . .

# # Build the application
# RUN npm run build

# # Stage 2: Create production-ready image
# FROM node:20-slim AS runner

# # Set the working directory
# WORKDIR /app

# # Set NODE_ENV to production
# ENV NODE_ENV=production

# # Copy package.json and package-lock.json
# COPY package.json package-lock.json ./

# # Install production dependencies
# RUN npm ci --omit=dev

# # Copy the built application from the builder stage
# COPY --from=builder /app/dist ./dist

# # Expose the application port
# EXPOSE 5000

# # Start the application
# CMD ["node", "dist/index.js"]

# Stage 1: Build
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Run
FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
RUN npm install --only=production
EXPOSE 5000
CMD ["node", "dist/index.js"]
