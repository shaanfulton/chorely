# Dockerfile in frontend repo
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

EXPOSE 3000
CMD ["npx", "expo", "start", "--tunnel", "--dev-client", "--no-interactive", "--host", "0.0.0.0"]
