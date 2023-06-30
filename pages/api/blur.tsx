/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-shadow */
import { Amplify, DataStore } from 'aws-amplify';
import fs from 'fs';
import sharp from 'sharp';
import { Photo } from '../../src/models';
import type { NextApiRequest, NextApiResponse } from 'next'
import awsconfig from '../../src/aws-exports'
import sizeOf from 'image-size'

Amplify.configure(awsconfig)

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  const folder = './assets/images';

  await fs.readdir(folder, (_err, files) => {
    if (!files) return
    files.forEach(file => {
      if (file.startsWith('.DS_Store')) return
      const filePath = `${folder}/${file}`;

      fs.stat(filePath, (err, stats) => {
        if (err) {
          console.error('Error reading file stats:', err);
          return;
        }

        const fileType = file.startsWith('DSC') ? 'digital' : 'film';
        const s3Key = `photos/${fileType}/${file}`;

        const dimensions = sizeOf(filePath)
        if (!dimensions || !dimensions.width || !dimensions.height) return
        const aspectRatio = (dimensions.orientation == 1 ? dimensions.height / dimensions.width : dimensions.width / dimensions.height).toFixed(3)

        sharp(filePath)
          .resize({ width: 480, height: Math.round(480 * parseFloat(aspectRatio)) })
          .blur(0.75)
          .toBuffer(async (err, buffer) => {
            if (err) {
              console.error('Error processing image:', err);
              return;
            }

            const base64 = buffer.toString('base64');
            const dataUrl = `data:image/png;base64,${base64}`;

            try {
              const photos = await DataStore.query(Photo, c => c.s3key.eq(s3Key));
              if (!photos) return
              if (photos.length > 0) {
                const photo = photos[0]
                if (photo.type != fileType || photo.aspectRatio != aspectRatio || photo.blurredBase64 != dataUrl) {
                  console.log('Updating existing datastore...')
                  await DataStore.save(
                    Photo.copyOf(photo, u => {
                      u.type = fileType;
                      u.aspectRatio = aspectRatio;
                      u.blurredBase64 = dataUrl
                    })
                  );
                }
              }
              if (photos.length === 0) {
                console.log('Creating new datastore...')
                await DataStore.save(
                  new Photo({
                    s3key: s3Key,
                    type: fileType,
                    aspectRatio: aspectRatio,
                    blurredBase64: dataUrl
                  })
                );
              }
            } catch (error) {
              console.error('Error checking photo existence:', error);
            }

            console.log(`File: ${file}`);
            console.log('S3 Key:', s3Key);
            console.log('Type:', fileType);
            console.log('Aspect Ratio:', aspectRatio);
            console.log('Data URL:', dataUrl.length);
            console.log('\n-----------------------------------\n');
          });

      });
    });
  });

  res.status(200).json({ result: 'Success' })
}

export default handler