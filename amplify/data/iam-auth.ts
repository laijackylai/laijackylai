export const iamAuthenticated = (allow: any): any => {
  const auth = allow.authenticated('identityPool') as object;
  const [dataSymbol] = Object.getOwnPropertySymbols(auth);
  (auth as any)[dataSymbol].provider = 'iam';
  return auth;
};
