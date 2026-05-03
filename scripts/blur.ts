/* eslint-disable no-console */
/* eslint-disable no-shadow */
import { Amplify, DataStore } from 'aws-amplify';
import fs from 'fs/promises';
import sharp from 'sharp';
import { Photo } from '../src/models';
import awsconfig from '../src/aws-exports';
import sizeOf from 'image-size';

Amplify.configure(awsconfig);

const folder = './assets/images';

const processImage = async (file: string) => {
  if (file.startsWith('.DS_Store')) return undefined;

  const filePath = `${folder}/${file}`;

  try {
    const stats = await fs.stat(filePath);
    if (!stats.isFile()) return undefined;

    const fileType = file.startsWith('DSC') ? 'digital' : 'film';
    const s3Key = `photos/${fileType}/${file}`;

    const dimensions = sizeOf(filePath);
    if (!dimensions || !dimensions.width || !dimensions.height) return undefined;

    const aspectRatio = (dimensions.width / dimensions.height).toFixed(3);
    const buffer = await sharp(filePath)
      .resize({ width: 480, height: Math.round(480 / parseFloat(aspectRatio)) })
      .blur(0.75)
      .toBuffer();

    const base64 = buffer.toString('base64');
    const dataUrl = `data:image/png;base64,${base64}`;

    const photos = await DataStore.query(Photo, c => c.s3key.eq(s3Key));
    if (!photos) return undefined;

    if (photos.length > 0) {
      const photo = photos[0];
      if (photo.type !== fileType || photo.aspectRatio !== aspectRatio || photo.blurredBase64 !== dataUrl) {
        await DataStore.save(
          Photo.copyOf(photo, u => {
            u.type = fileType;
            u.aspectRatio = aspectRatio;
            u.blurredBase64 = dataUrl;
          })
        );
        return 'updated';
      }

      return 'unchanged';
    }

    await DataStore.save(
      new Photo({
        s3key: s3Key,
        type: fileType,
        aspectRatio,
        blurredBase64: dataUrl,
      })
    );
    return 'created';
  } catch (error) {
    console.error(`Error processing ${file}:`, error);
    return 'error';
  }
};

const main = async () => {
  try {
    const files = await fs.readdir(folder);
    const results = await Promise.all(files.map(processImage));
    const processed = results.filter(Boolean).length;
    console.log(`Blur sync complete. Processed ${processed} file(s).`);
  } catch (error) {
    console.error('Error reading image folder:', error);
    process.exitCode = 1;
  }
};

void main();
