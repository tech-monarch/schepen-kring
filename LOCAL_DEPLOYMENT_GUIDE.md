# Local Build and Deployment Guide for Answer24 Frontend

This guide explains how to build the Answer24 frontend application locally and deploy it to your server.

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Access to your web server (cPanel, FTP, etc.)

## Build Process

### Option 1: Using the Build Script (Recommended)

```bash
# Make the script executable (if not already done)
chmod +x build-local.sh

# Run the build script
./build-local.sh
```

### Option 2: Manual Build

```bash
# Clean previous builds
rm -rf .next out

# Install dependencies
npm ci --legacy-peer-deps

# Build the application
npm run build
```

## Build Configuration

The application is configured for static export with the following settings:

- **Output**: Static export (`output: "export"`)
- **Trailing Slash**: Enabled (`trailingSlash: true`)
- **Build Directory**: `out/` (`distDir: "out"`)
- **Image Optimization**: Disabled for static export (`unoptimized: true`)

## Deployment

### 1. Upload to Server

After a successful build, upload the contents of the `out/` directory to your web server's public directory (e.g., `public_html` for cPanel).

### 2. Server Configuration

#### For Apache (.htaccess)

Create a `.htaccess` file in your public directory with the following content:

```apache
RewriteEngine On

# Handle Angular and React Router
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]

# Enable compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/xml
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE application/xml
    AddOutputFilterByType DEFLATE application/xhtml+xml
    AddOutputFilterByType DEFLATE application/rss+xml
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/x-javascript
</IfModule>

# Cache static assets
<IfModule mod_expires.c>
    ExpiresActive on
    ExpiresByType text/css "access plus 1 year"
    ExpiresByType application/javascript "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/gif "access plus 1 year"
    ExpiresByType image/svg+xml "access plus 1 year"
</IfModule>
```

#### For Nginx

Add the following to your nginx configuration:

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/your/out/directory;
    index index.html;

    # Handle client-side routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

## Environment Variables

Make sure the following environment variables are set for production:

- `NEXT_PUBLIC_API_BASE_URL=https://api.answer24.nl/api/v1`
- `NEXT_PUBLIC_AI_API_KEY=your_openai_api_key_here`
- `NEXT_PUBLIC_CHATBOT_ENABLED=true`

## Troubleshooting

### Build Issues

1. **TypeScript Errors**: Run `npx tsc --noEmit` to check for type errors
2. **Dependency Issues**: Use `npm ci --legacy-peer-deps` to install dependencies
3. **Static Export Issues**: Ensure all dynamic routes have `generateStaticParams()` functions

### Deployment Issues

1. **404 Errors**: Make sure your server is configured for client-side routing
2. **API Calls Failing**: Check that the API URL is correctly set
3. **Images Not Loading**: Verify that image optimization is disabled for static export

## File Structure After Build

```
out/
├── static/          # Static assets (CSS, JS, images)
├── server/          # Server-side files
├── _next/           # Next.js internal files
├── index.html       # Main HTML file
└── ...              # Other generated files
```

## Performance Optimization

- Enable gzip compression on your server
- Set appropriate cache headers for static assets
- Use a CDN for better performance
- Monitor Core Web Vitals

## Security Considerations

- Set up HTTPS
- Configure security headers
- Regularly update dependencies
- Monitor for vulnerabilities

## Support

If you encounter any issues:

1. Check the build logs for errors
2. Verify your server configuration
3. Test the application locally first
4. Check the browser console for client-side errors

## API Integration

The frontend is configured to work with the following API endpoints:

- Base URL: `https://api.answer24.nl/api/v1`
- Authentication: Bearer token based
- CORS: Configured for your domain

Make sure your backend API is properly configured and accessible from your frontend domain.
