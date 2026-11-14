FROM node:24-alpine

WORKDIR /app

COPY package.json package-lock.json* ./

RUN npm ci

COPY . .

ARG VITE_API_URL=
ENV VITE_API_URL=$VITE_API_URL


RUN npm run build \
    && chown -R node:node /app

USER node

EXPOSE 3000

CMD ["npx", "serve", "-s", "build", "-l", "3000"]
