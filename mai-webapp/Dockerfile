FROM node:lts AS ui-build
WORKDIR /usr/src/app
COPY webapp/ ./webapp/
RUN cd webapp && npm install @angular/cli && npm install && npm run build

FROM node:lts AS server-build
WORKDIR /root/
COPY --from=ui-build /usr/src/app/webapp/dist ./webapp/dist
COPY package*.json ./
RUN npm install
COPY server.js .

EXPOSE 3080

CMD ["node", "server.js"]