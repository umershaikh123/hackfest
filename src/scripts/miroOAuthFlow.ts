// src/scripts/miroOAuthFlow.ts - Complete Miro OAuth Flow for Non-Expiring Tokens
import dotenv from 'dotenv'

dotenv.config()

export class MiroOAuthFlow {
  private clientId: string
  private clientSecret: string
  private redirectUri = 'http://localhost:3000' // Must match your app config
  private scopes = 'boards:read boards:write' // Required scopes

  constructor() {
    this.clientId = process.env.MIRO_CLIENT_ID || '3458764634419205150'
    this.clientSecret = process.env.MIRO_CLIENT_SECRET || 'AWnbjahJoafEzMnPZoGJdSzxMWDRUqoc'
  }

  // Step 1: Create authorization request link
  generateAuthorizationUrl(): string {
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      scope: this.scopes,
      state: 'product-maestro-auth' // Optional security parameter
    })

    return `https://miro.com/oauth/authorize?${params.toString()}`
  }

  // Step 3: Exchange authorization code with access token
  async exchangeCodeForToken(authorizationCode: string) {
    try {
      console.log('🔄 Exchanging authorization code for non-expiring access token...')

      const response = await fetch('https://api.miro.com/v1/oauth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json',
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          client_id: this.clientId,
          client_secret: this.clientSecret,
          code: authorizationCode,
          redirect_uri: this.redirectUri,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`HTTP ${response.status}: ${response.statusText}\n${errorText}`)
      }

      const tokenData = await response.json()
      
      console.log('✅ Success! Received non-expiring access token')
      console.log('🔑 Access Token:', tokenData.access_token)
      console.log('🔧 Token Type:', tokenData.token_type)
      console.log('🎯 Scope:', tokenData.scope)
      
      // Non-expiring tokens don't have expires_in field
      if (tokenData.expires_in) {
        console.log('⏰ Expires in:', tokenData.expires_in, 'seconds')
      } else {
        console.log('♾️  Token Type: Non-expiring (permanent)')
      }
      
      console.log('\n📝 Add this to your .env file:')
      console.log(`MIRO_API_KEY=${tokenData.access_token}`)

      return tokenData

    } catch (error) {
      console.error('❌ Token exchange failed:', error.message)
      throw error
    }
  }

  // Step 5: Get access token context (optional but useful)
  async getTokenContext(accessToken: string) {
    try {
      const response = await fetch('https://api.miro.com/v2/oauth-token', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const tokenInfo = await response.json()
      
      console.log('📋 Token Context:')
      console.log('  User ID:', tokenInfo.user?.id)
      console.log('  User Name:', tokenInfo.user?.name)
      console.log('  Team ID:', tokenInfo.team?.id)
      console.log('  Team Name:', tokenInfo.team?.name)
      console.log('  Scopes:', tokenInfo.scopes?.join(', '))

      return tokenInfo

    } catch (error) {
      console.error('⚠️ Could not get token context:', error.message)
    }
  }

  // Test the access token with a simple API call
  async testAccessToken(accessToken: string) {
    try {
      console.log('🧪 Testing access token...')

      const response = await fetch('https://api.miro.com/v2/boards', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const boards = await response.json()
      
      console.log('✅ Token test successful!')
      console.log(`📊 You have access to ${boards.data?.length || 0} boards`)
      
      if (boards.data && boards.data.length > 0) {
        console.log('📋 Recent boards:')
        boards.data.slice(0, 3).forEach((board: any) => {
          console.log(`  - ${board.name} (${board.id})`)
        })
      }

      return boards

    } catch (error) {
      console.error('❌ Token test failed:', error.message)
      throw error
    }
  }
}

// Interactive setup function
export async function setupMiroOAuth() {
  console.log('🎨 **MIRO OAUTH SETUP - NON-EXPIRING TOKENS**')
  console.log('=' .repeat(60))

  const oauth = new MiroOAuthFlow()

  console.log('\n📋 **STEP 1: Install Your App in Miro**')
  console.log('Before authorization, make sure your app is installed:')
  console.log('1. Go to your Miro workspace')
  console.log('2. Visit: Apps → Manage apps → Your apps')
  console.log('3. Find your app and click "Install" if not already installed')

  console.log('\n🔗 **STEP 2: Authorization**')
  console.log('Visit this URL in your browser:')
  
  const authUrl = oauth.generateAuthorizationUrl()
  console.log(`\n${authUrl}`)
  
  console.log('\n📝 **STEP 3: After Authorization**')
  console.log('1. Click "Allow" to grant permissions')
  console.log('2. You\'ll be redirected to: http://localhost:3000/?code=AUTHORIZATION_CODE')
  console.log('3. Copy the "code" parameter from the URL')
  console.log('4. Run: npm run miro:token YOUR_CODE_HERE')

  console.log('\n💡 **Note: This will generate a NON-EXPIRING access token**')
  console.log('Once generated, the token will work permanently until revoked.')

  return { authUrl, oauth }
}

// Function to complete the OAuth flow
export async function completeMiroOAuth(authorizationCode: string) {
  const oauth = new MiroOAuthFlow()
  
  try {
    // Exchange code for token
    const tokenData = await oauth.exchangeCodeForToken(authorizationCode)
    
    // Get token context
    await oauth.getTokenContext(tokenData.access_token)
    
    // Test the token
    await oauth.testAccessToken(tokenData.access_token)
    
    console.log('\n🎉 **MIRO OAUTH SETUP COMPLETE!**')
    console.log('Your Visual Design Agent is now ready to create Miro boards!')
    console.log('\n🚀 Test it: npm run test:visual')

    return tokenData

  } catch (error) {
    console.error('❌ OAuth setup failed:', error.message)
    throw error
  }
}

// Run setup if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2)
  
  if (args.length > 0) {
    // If authorization code provided, complete the flow
    completeMiroOAuth(args[0])
  } else {
    // Otherwise, start the setup process
    setupMiroOAuth()
  }
}