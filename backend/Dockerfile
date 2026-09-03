FROM node:20-alpine
WORKDIR /usr/src/app
COPY package*.json tsconfig.json ./
COPY prisma ./prisma/
RUN npm install
COPY src ./src
RUN npm run build
EXPOSE 5000
CMD ["npm", "start"]
