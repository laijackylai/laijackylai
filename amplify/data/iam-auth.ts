export const iamAuthenticated = (allow: any): any => {
  const auth = allow.authenticated('identityPool') as object;
  const [dataSymbol] = Object.getOwnPropertySymbols(auth);
  if (!dataSymbol) {
    throw new Error('iamAuthenticated: data-schema internal layout changed');
  }
  (auth as any)[dataSymbol].provider = 'iam';
  return auth;
};
