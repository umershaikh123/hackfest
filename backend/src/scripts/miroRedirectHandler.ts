// src/scripts/miroRedirectHandler.ts - Simple HTTP server to handle OAuth redirect
import { createServer } from 'http'
import { parse } from 'url'

export function startRedirectServer(port: number = 3000): Promise<string> {
  return new Promise((resolve, reject) => {
    const server = createServer((req, res) => {
      const parsedUrl = parse(req.url || '', true)
      
      if (parsedUrl.pathname === '/') {
        const code = parsedUrl.query.code as string
        const error = parsedUrl.query.error as string
        
        if (error) {
          res.writeHead(400, { 'Content-Type': 'text/html' })
          res.end(`
            <html>
              <body>
                <h1>❌ Authorization Failed</h1>
                <p>Error: ${error}</p>
                <p>Description: ${parsedUrl.query.error_description || 'Unknown error'}</p>
                <p>You can close this window.</p>
              </body>
            </html>
          `)
          server.close()
          reject(new Error(`OAuth error: ${error}`))
          return
        }
        
        if (code) {
          res.writeHead(200, { 'Content-Type': 'text/html' })
          res.end(`
            <html>
              <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
                <h1>✅ Authorization Successful!</h1>
                <p>Authorization code received: <code>${code}</code></p>
                <p>Exchanging for access token...</p>
                <script>
                  setTimeout(() => {
                    document.body.innerHTML = '<h1>🎉 You can close this window</h1><p>Token exchange in progress...</p>';
                  }, 2000);
                </script>
              </body>
            </html>
          `)
          server.close()
          resolve(code)
          return
        }
        
        // Show waiting page
        res.writeHead(200, { 'Content-Type': 'text/html' })
        res.end(`
          <html>
            <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
              <h1>🔄 Waiting for Authorization</h1>
              <p>Please complete the authorization in Miro...</p>
              <p>This page will update automatically.</p>
            </body>
          </html>
        `)
      } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' })
        res.end('Not Found')
      }
    })

    server.listen(port, () => {
      console.log(`🌐 OAuth redirect server running on http://localhost:${port}`)
      console.log('👆 This will automatically capture the authorization code')
    })

    server.on('error', (err) => {
      reject(err)
    })
  })
}

// Complete OAuth flow with automatic redirect handling
export async function autoMiroOAuth() {
  console.log('🎨 **AUTOMATIC MIRO OAUTH FLOW**')
  console.log('=' .repeat(50))

  try {
    // Import OAuth flow
    const { MiroOAuthFlow } = await import('./miroOAuthFlow.js')
    const oauth = new MiroOAuthFlow()

    console.log('🌐 Starting redirect server...')
    
    // Start redirect server
    const authCodePromise = startRedirectServer(3000)
    
    // Generate and show authorization URL
    const authUrl = oauth.generateAuthorizationUrl()
    console.log('\n🔗 **Visit this URL to authorize:**')
    console.log(authUrl)
    console.log('\n⏳ Waiting for authorization...')
    
    // Wait for authorization code
    const authCode = await authCodePromise
    console.log('✅ Authorization code received!')
    
    // Exchange for token
    console.log('\n🔄 Exchanging code for access token...')
    const tokenData = await oauth.exchangeCodeForToken(authCode)
    
    // Test the token
    await oauth.testAccessToken(tokenData.access_token)
    
    console.log('\n🎉 **MIRO SETUP COMPLETE!**')
    console.log('🚀 Your Visual Design Agent is ready!')
    console.log('\n📝 Next steps:')
    console.log('1. The MIRO_API_KEY has been displayed above')
    console.log('2. Add it to your .env file')
    console.log('3. Run: npm run test:visual')
    
    return tokenData

  } catch (error) {
    console.error('❌ Automatic OAuth failed:', error.message)
    console.log('\n🔄 **Fallback: Manual Process**')
    console.log('Run: npm run miro:setup')
    console.log('Then follow the manual steps shown')
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  autoMiroOAuth().catch(console.error)
}