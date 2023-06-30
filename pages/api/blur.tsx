/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-shadow */
import { Amplify, DataStore } from 'aws-amplify';
import fs from 'fs';
import sharp from 'sharp';
import { Photo } from '../../src/models';
import type { NextApiRequest, NextApiResponse } from 'next'
import awsconfig from '../../src/aws-exports'

Amplify.configure(awsconfig)

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  const folder = './assets/images';

  await fs.readdir(folder, (_err, files) => {
    if (!files) return
    files.forEach(file => {
      const filePath = `${folder}/${file}`;

      fs.stat(filePath, (err, stats) => {
        if (err) {
          console.error('Error reading file stats:', err);
          return;
        }

        const fileSizeInBytes = stats.size;
        const fileSizeInMB = fileSizeInBytes / (1024 * 1024);
        const fileType = file.startsWith('DSC') ? 'digital' : 'film';
        const s3Key = `photos/${fileType}/${file}`;

        sharp(filePath)
          .metadata()
          .then(metadata => {
            const { width, height } = metadata;
            if (width === undefined || height === undefined) return
            const aspectRatio = (width / height).toFixed(3);

            sharp(filePath)
              .resize({ width: 480 })
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
          })
          .catch(err => {
            // res.status(400).json({ error: err })
            console.error('Error getting metadata:', err, '\n');
          });
      });
    });
  });

  res.status(200).json({ result: 'Success' })
}

export default handler