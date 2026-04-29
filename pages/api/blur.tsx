/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-shadow */
import { Amplify, DataStore } from 'aws-amplify';
import fs from 'fs/promises';
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
  const expectedToken = process.env.BLUR_API_TOKEN;
  const apiKeyHeader = req.headers['x-api-key'];
  const providedToken = req.headers.authorization?.replace(/^Bearer\s+/i, '') || (Array.isArray(apiKeyHeader) ? apiKeyHeader[0] : apiKeyHeader);
  if (expectedToken && providedToken !== expectedToken) {
    return res.status(401).json({ result: 'Unauthorized' });
  }

  const folder = './assets/images';

  try {
    const files = await fs.readdir(folder);
    const results = await Promise.all(files.map(async (file) => {
      if (file.startsWith('.DS_Store')) return
      const filePath = `${folder}/${file}`;

      try {
        const stats = await fs.stat(filePath);
        if (!stats.isFile()) return;

        const fileType = file.startsWith('DSC') ? 'digital' : 'film';
        const s3Key = `photos/${fileType}/${file}`;

        const dimensions = sizeOf(filePath)
        if (!dimensions || !dimensions.width || !dimensions.height) return
        const aspectRatio = (dimensions.width / dimensions.height).toFixed(3)

        const buffer = await sharp(filePath)
          .resize({ width: 480, height: Math.round(480 / parseFloat(aspectRatio)) })
          .blur(0.75)
          .toBuffer();

        const base64 = buffer.toString('base64');
        const dataUrl = `data:image/png;base64,${base64}`;

        const photos = await DataStore.query(Photo, c => c.s3key.eq(s3Key));
        if (!photos) return
        if (photos.length > 0) {
          const photo = photos[0]
          if (photo.type != fileType || photo.aspectRatio != aspectRatio || photo.blurredBase64 != dataUrl) {
            await DataStore.save(
              Photo.copyOf(photo, u => {
                u.type = fileType;
                u.aspectRatio = aspectRatio;
                u.blurredBase64 = dataUrl
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
            aspectRatio: aspectRatio,
            blurredBase64: dataUrl
          })
        );
        return 'created';
      } catch (error) {
        console.error(`Error processing ${file}:`, error);
        return 'error';
      }
    }));

    res.status(200).json({
      result: 'Success',
      processed: results.filter(Boolean).length,
    })
  } catch (error) {
    console.error('Error reading image folder:', error);
    res.status(500).json({ result: 'Error' })
  }
}

export default handler
