import { NextApiRequest, NextApiResponse } from 'next';

export default async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        // const images = await db.collection('images').get();
        // const imagesData = shuffle(images.docs).map(entry => ({
        //     id: entry.id,
        //     ...entry.data()
        // }));
        res.status(200).json({ imagesData: [] });
    } catch (e) {
        res.status(400).end();
    }
}

const shuffle = (array: Array<any>) => {
    return array.sort((a, b) => 0.5 - Math.random());
}