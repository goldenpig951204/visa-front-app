export default {
  meEndpoint: '/crms/auth/me',
  loginEndpoint: '/crms/auth/login',
  registerEndpoint: '/jwt/register',
  storageTokenKeyName: 'accessToken',
  onTokenExpiration: 'refreshToken' // logout | refreshToken
}
