import { NextApiRequest, NextApiResponse } from 'next';
import db from '../../utils/db';

export default async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        const images = await db.collection('images').orderBy('created').get();
        const imagesData = images.docs.map(entry => ({
            id: entry.id,
            ...entry.data()
        }));
        res.status(200).json({ imagesData });
    } catch (e) {
        res.status(400).end();
    }
}