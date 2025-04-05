
FROM node:18-alpine

WORKDIR /app
COPY . /app

RUN npm install && npm run build

# Serve with a static file server
RUN npm install -g serve
CMD ["serve", "-s", "dist", "-l", "3000"]
