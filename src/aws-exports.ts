const awsconfig = {
  aws_project_region: process.env.NEXT_PUBLIC_AWS_REGION || 'ap-southeast-1',
  aws_cognito_identity_pool_id: process.env.NEXT_PUBLIC_COGNITO_POOL_ID || '',
  aws_cognito_region: process.env.NEXT_PUBLIC_AWS_REGION || 'ap-southeast-1',
  aws_user_pools_id: process.env.NEXT_PUBLIC_USER_POOL_ID || '',
  aws_user_pools_web_client_id: process.env.NEXT_PUBLIC_WEB_CLIENT_ID || '',
  oauth: {},
  aws_appsync_graphqlEndpoint: process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT || '',
  aws_appsync_region: process.env.NEXT_PUBLIC_AWS_REGION || 'ap-southeast-1',
  aws_appsync_authenticationType: 'API_KEY',
  aws_appsync_apiKey: process.env.NEXT_PUBLIC_APPSYNC_API_KEY || '',
  Storage: {
    AWSS3: {
      bucket: process.env.NEXT_PUBLIC_STORAGE_BUCKET_NAME || '',
      region: process.env.NEXT_PUBLIC_STORAGE_REGION || 'ap-southeast-1',
    }
  }
};

export default awsconfig;
