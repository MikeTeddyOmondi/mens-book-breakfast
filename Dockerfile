FROM node:alpine
WORKDIR /src
COPY /src/package.json .
RUN npm install
COPY /src /src 
ENV PORT 3000
EXPOSE $PORT
CMD ["node", "app.js"]