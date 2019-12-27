FROM gcr.io/google_appengine/nodejs

COPY . /app/

RUN yarn
RUN yarn build

CMD yarn start
