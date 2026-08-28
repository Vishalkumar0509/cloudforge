FROM node:18-alpine

WORKDIR /app

COPY package.json /app/
RUN npm install

COPY . /app/

ENV DISABLE_ESLINT_PLUGIN=true
RUN npm run build

EXPOSE 3000

CMD ["npx", "serve", "-s", "build", "-l", "3000"]