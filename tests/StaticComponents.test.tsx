import ocra, { doto, ibmPlexSans, michroma } from '../components/font';

describe('fonts', () => {
  it('exports every next/font family the stylesheet tokens use', () => {
    for (const font of [ocra, doto, ibmPlexSans, michroma]) {
      expect(font.style.fontFamily).toBeTruthy();
    }
  });
});
