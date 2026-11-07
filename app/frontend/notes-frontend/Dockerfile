FROM node:18-alpine

WORKDIR /app

COPY package.json package-lock.json* ./

RUN npm ci

COPY . .

ARG REACT_APP_API_URL=
ENV REACT_APP_API_URL=$REACT_APP_API_URL

ENV DISABLE_ESLINT_PLUGIN=true

RUN npm run build \
    && chown -R node:node /app

USER node

EXPOSE 3000

CMD ["npx", "serve", "-s", "build", "-l", "3000"]
