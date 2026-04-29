import handler from '../pages/api/hello';

const createResponse = () => {
  const res: any = {};
  res.status = jest.fn(() => res);
  res.json = jest.fn(() => res);
  return res;
};

describe('hello API', () => {
  it('returns a 200 response with the expected JSON shape', () => {
    const res = createResponse();

    handler({} as any, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ name: 'John Doe' });
  });
});
