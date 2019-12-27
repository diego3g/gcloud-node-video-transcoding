FROM gcr.io/google_appengine/nodejs

RUN apt-get update && apt-get install -y ffmpeg

COPY . /app/

RUN yarn
RUN yarn build

CMD yarn start
