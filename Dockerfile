FROM node:20-slim

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN rm -rf dist
RUN npm run build

EXPOSE 8787
CMD ["npm", "run", "start:container"]
