// src/scripts/getMiroToken.ts - Get Miro Access Token using OAuth
import dotenv from 'dotenv'

dotenv.config()

async function getMiroAccessToken() {
  console.log('🔑 Miro OAuth Token Generator')
  console.log('=' .repeat(50))

  const clientId = process.env.MIRO_CLIENT_ID || '3458764634419205150'
  const clientSecret = process.env.MIRO_CLIENT_SECRET || 'AWnbjahJoafEzMnPZoGJdSzxMWDRUqoc'

  if (!clientId || !clientSecret) {
    console.error('❌ Missing MIRO_CLIENT_ID or MIRO_CLIENT_SECRET')
    return
  }

  console.log('\n📋 Steps to get your access token:')
  console.log('\n1️⃣ **Authorization URL**')
  console.log('Visit this URL in your browser:')
  
  const authUrl = `https://miro.com/oauth/authorize?response_type=code&client_id=${clientId}&redirect_uri=http://localhost:3000&scope=boards:read%20boards:write`
  console.log(`🔗 ${authUrl}`)
  
  console.log('\n2️⃣ **After Authorization**')
  console.log('- Miro will redirect to: http://localhost:3000/?code=AUTHORIZATION_CODE')
  console.log('- Copy the "code" parameter from the URL')
  
  console.log('\n3️⃣ **Exchange for Access Token**')
  console.log('Run this command with your authorization code:')
  console.log('npx tsx -e "exchangeCodeForToken(\'YOUR_AUTHORIZATION_CODE_HERE\')"')

  return { authUrl, clientId, clientSecret }
}

// Function to exchange authorization code for access token
async function exchangeCodeForToken(authorizationCode: string) {
  const clientId = process.env.MIRO_CLIENT_ID || '3458764634419205150'
  const clientSecret = process.env.MIRO_CLIENT_SECRET || 'AWnbjahJoafEzMnPZoGJdSzxMWDRUqoc'

  try {
    console.log('🔄 Exchanging authorization code for access token...')

    const response = await fetch('https://api.miro.com/v1/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: authorizationCode,
        redirect_uri: 'http://localhost:3000',
      }),
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const tokenData = await response.json()
    
    console.log('✅ Success! Here\'s your access token:')
    console.log('🔑 Access Token:', tokenData.access_token)
    console.log('⏰ Expires in:', tokenData.expires_in, 'seconds')
    
    console.log('\n📝 Add this to your .env file:')
    console.log(`MIRO_API_KEY=${tokenData.access_token}`)

    return tokenData

  } catch (error) {
    console.error('❌ Token exchange failed:', error)
  }
}

// Export functions
export { getMiroAccessToken, exchangeCodeForToken }

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  getMiroAccessToken()
}