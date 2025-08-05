FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .

# 👇 Metro listens on these TCP ports
EXPOSE 8081 19000 19001 19002
ENV EXPO_DEVTOOLS_LISTEN_ADDRESS=0.0.0.0

CMD ["npx", "expo", "start", "--tunnel", "--clear"]
