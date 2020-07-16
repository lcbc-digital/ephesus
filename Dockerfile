FROM node:10-alpine
COPY . /usr/src/
WORKDIR /usr/src/apollos-church-api
RUN yarn --ignore-scripts
RUN yarn build
EXPOSE 4000
CMD [ "yarn", "start:prod" ]