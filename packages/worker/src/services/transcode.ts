import { Storage } from '@google-cloud/storage';

import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import ffmpeg from 'fluent-ffmpeg';

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

interface File {
  name: string;
  bucket: string;
}

interface Resolution {
  suffix: string;
  size: string;
}

export default async function transcode(
  file: File,
  resolution: Resolution
): Promise<void> {
  return new Promise((resolve, reject) => {
    const storage = new Storage();

    const originBucket = storage.bucket(file.bucket);
    const destinationBucket = storage.bucket('europa.rocketseat.dev');

    const originFile = originBucket.file(file.name);
    const originStream = originFile.createReadStream();

    const destinationFile = file.name.replace(
      '.mp4',
      `_${resolution.suffix}.mp4`
    );
    const destinationStream = destinationBucket
      .file(destinationFile)
      .createWriteStream({
        metadata: {
          contentType: 'video/mp4',
        },
      });

    ffmpeg(originStream)
      .withOutputOption('-f mp4')
      .withOutputOption('-preset superfast')
      .withOutputOption('-movflags frag_keyframe+empty_moov')
      .withOutputOption('-max_muxing_queue_size 9999')
      .withVideoCodec('libx264')
      .withSize(resolution.size)
      .withAspectRatio('16:9')
      .on('start', cmdLine => {
        console.log(`[${resolution.suffix}] Started FFMpeg`, cmdLine);
      })
      .on('end', () => {
        console.log(`[${resolution.suffix}] Sucess!.`);

        resolve();
      })
      .on('error', (err: Error, stdout, stderr) => {
        console.log(`[${resolution.suffix}] Error:`, err.message);
        console.error('stdout:', stdout);
        console.error('stderr:', stderr);

        reject();
      })
      .pipe(destinationStream, { end: true });
  });
}
