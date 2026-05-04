import { iamAuthenticated } from '../amplify/data/iam-auth';

describe('Amplify data auth helpers', () => {
  it('rewrites the private auth provider symbol to raw IAM', () => {
    const dataSymbol = Symbol('auth-data');
    const authRule = {
      [dataSymbol]: { provider: 'identityPool' },
      to: jest.fn(),
    };
    const allow = {
      authenticated: jest.fn().mockReturnValue(authRule),
    };

    expect(iamAuthenticated(allow)).toBe(authRule);
    expect(allow.authenticated).toHaveBeenCalledWith('identityPool');
    expect((authRule as any)[dataSymbol].provider).toBe('iam');
  });
});
