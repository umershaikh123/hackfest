// src/scripts/miroSimpleAuth.ts - Simple Miro OAuth without redirect server
import dotenv from 'dotenv'

dotenv.config()

export function generateMiroAuthUrl() {
  const clientId = process.env.MIRO_CLIENT_ID || '3458764634419205150'
  
  // Use a more generic redirect URL that might work
  const redirectOptions = [
    'urn:ietf:wg:oauth:2.0:oob', // Standard "out of band" redirect
    'https://developers.miro.com/redirect', // Miro's own redirect
    'http://localhost:8080', // Alternative port
    'http://127.0.0.1:3000', // IP instead of localhost
  ]

  console.log('🎨 **MIRO OAUTH MANUAL SETUP**')
  console.log('=' .repeat(50))
  
  console.log('\n🔧 **Issue Found**: Your app needs a redirect URL configured')
  console.log('\n📋 **Solution Options:**')
  
  console.log('\n**Option 1: Configure Redirect URL (Recommended)**')
  console.log('1. Visit: https://miro.com/app/settings/user-profile/apps')
  console.log('2. Find your app (Client ID: 3458764634419205150)')
  console.log('3. Add redirect URI: http://localhost:3000')
  console.log('4. Save changes')
  console.log('5. Run: npm run miro:auto')

  console.log('\n**Option 2: Try Alternative URLs**')
  redirectOptions.forEach((redirect, index) => {
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: clientId,
      redirect_uri: redirect,
      scope: 'boards:read boards:write',
      state: 'product-maestro-auth'
    })
    
    const authUrl = `https://miro.com/oauth/authorize?${params.toString()}`
    console.log(`\n${index + 1}. Try this URL with redirect: ${redirect}`)
    console.log(`   ${authUrl}`)
  })

  console.log('\n**Option 3: Manual Process**')
  console.log('If none of the above work:')
  console.log('1. Visit your app settings and note the configured redirect URI')
  console.log('2. Use that URI in the authorization URL')
  console.log('3. After authorization, copy the code from the redirect URL')
  console.log('4. Run: npm run miro:token YOUR_CODE_HERE')

  return redirectOptions.map(redirect => {
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: clientId,
      redirect_uri: redirect,
      scope: 'boards:read boards:write'
    })
    return `https://miro.com/oauth/authorize?${params.toString()}`
  })
}

export async function exchangeMiroCode(authCode: string) {
  const clientId = process.env.MIRO_CLIENT_ID || '3458764634419205150'
  const clientSecret = process.env.MIRO_CLIENT_SECRET || 'AWnbjahJoafEzMnPZoGJdSzxMWDRUqoc'

  try {
    console.log('🔄 Exchanging authorization code for access token...')

    const response = await fetch('https://api.miro.com/v1/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: clientId,
        client_secret: clientSecret,
        code: authCode,
        // Try without redirect_uri first
      }),
    })

    if (!response.ok) {
      // Try with different redirect URIs
      const redirectOptions = [
        'urn:ietf:wg:oauth:2.0:oob',
        'https://developers.miro.com/redirect',
        'http://localhost:3000',
      ]

      for (const redirectUri of redirectOptions) {
        console.log(`🔄 Trying with redirect URI: ${redirectUri}`)
        
        const retryResponse = await fetch('https://api.miro.com/v1/oauth/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json',
          },
          body: new URLSearchParams({
            grant_type: 'authorization_code',
            client_id: clientId,
            client_secret: clientSecret,
            code: authCode,
            redirect_uri: redirectUri,
          }),
        })

        if (retryResponse.ok) {
          const tokenData = await retryResponse.json()
          console.log('✅ Success with redirect URI:', redirectUri)
          console.log('🔑 Access Token:', tokenData.access_token)
          console.log('\n📝 Add this to your .env file:')
          console.log(`MIRO_API_KEY=${tokenData.access_token}`)
          return tokenData
        }
      }

      const errorText = await response.text()
      throw new Error(`All redirect URIs failed. Last error: ${response.status} ${response.statusText}\n${errorText}`)
    }

    const tokenData = await response.json()
    console.log('✅ Success!')
    console.log('🔑 Access Token:', tokenData.access_token)
    console.log('\n📝 Add this to your .env file:')
    console.log(`MIRO_API_KEY=${tokenData.access_token}`)
    
    return tokenData

  } catch (error) {
    console.error('❌ Token exchange failed:', error.message)
    console.log('\n💡 **Troubleshooting:**')
    console.log('1. Check that your authorization code is correct')
    console.log('2. Make sure the redirect URI matches your app configuration')
    console.log('3. Verify your Client ID and Secret are correct')
    throw error
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2)
  
  if (args.length > 0) {
    // If authorization code provided, exchange it
    exchangeMiroCode(args[0]).catch(console.error)
  } else {
    // Otherwise, show setup instructions
    generateMiroAuthUrl()
  }
}