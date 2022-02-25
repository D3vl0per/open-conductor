FROM node:16.9.1-alpine3.14 as builder

RUN apk update --no-cache \
    && apk add --no-cache python3 make build-base gcc g++ \
    && ln -sf python3 /usr/bin/python \
    && python3 -m ensurepip \
    && pip3 install --no-cache --upgrade pip setuptools

RUN mkdir -p /usr/src/conductor
WORKDIR /usr/src/conductor

COPY package.json .
COPY yarn.lock .
RUN yarn --prod

FROM node:16.9.1-alpine3.14 as app

ENV TZ=Europe/Budapest
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

RUN wget -O /usr/local/bin/dumb-init https://github.com/Yelp/dumb-init/releases/download/v1.2.5/dumb-init_1.2.5_x86_64 \ 
  && chmod +x /usr/local/bin/dumb-init

RUN deluser --remove-home node \
  && addgroup -S node -g 1001 \
  && adduser -S -G node -u 1001 node \
  && chmod u+s /bin/ping \
  && rm -rf /lib/apk \
  && rm -rf /etc/apk \
  && rm -rf /usr/share/apk \
  && rm -rf /sbin/apk \
  && rm -rf /opt/yarn* \
  && find ./ -name "*.md" -type f -delete \
  && rm -rf /usr/local/lib/node_modules/npm \
  && rm -rf /usr/local/bin/LICENSE \
  && mkdir -p /usr/src/conductor

WORKDIR /usr/src/conductor

COPY . .
COPY --from=builder /usr/src/conductor/node_modules /usr/src/conductor/node_modules

USER node

CMD [  "/usr/local/bin/dumb-init", "node", "app.js" ]
