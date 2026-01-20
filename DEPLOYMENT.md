# Dual Deployment Setup Guide

This guide explains the automated dual deployment strategy:
- **GitHub Pages** - Preview/staging environment (https://joren-biq.github.io/AYS-AI-Website/)
- **OVHCloud** - Production environment (https://at-yourservice.ai)

## Deployment Flow

When you push to the `main` branch, the CI/CD pipeline automatically:

### 1. Run Tests
- ✅ **Unit Tests** (112 tests) - Fast feedback on code logic
- ✅ **Build Validation** (25 tests) - Verify build integrity

### 2. Build Artifacts
- 🔨 **GitHub Pages Build** - Built with base path `/AYS-AI-Website/`
- 🔨 **OVHCloud Build** - Built with base path `/`

### 3. Run E2E Tests
- 🧪 **E2E Tests** (30 tests) - Cross-browser integration tests
  - Chromium: cookies, language switching
  - Firefox: navigation
  - Mobile Chrome: header scroll, mobile menu

### 4. Deploy
- 📦 **GitHub Pages** - Deploys if Unit Tests & Build Validation pass
- 🚀 **OVHCloud** - Deploys if Unit Tests, Build Validation & E2E Tests pass

This means GitHub Pages will always have the latest passing build, while OVHCloud only deploys fully tested releases.

## Prerequisites for OVHCloud

You need the following information from your OVHCloud hosting:
1. FTP server hostname (e.g., `ftp.cluster0XX.hosting.ovh.net`)
2. FTP username
3. FTP password
4. Remote directory path (usually `/www/` or `/public_html/`)

## Step 1: Add GitHub Secrets

Go to your GitHub repository:
1. Navigate to **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Add the following secrets:

### Required Secrets:

#### `FTP_SERVER`
- **Name:** `FTP_SERVER`
- **Value:** Your OVH FTP hostname
- **Example:** `ftp.cluster042.hosting.ovh.net`

#### `FTP_USERNAME`
- **Name:** `FTP_USERNAME`
- **Value:** Your FTP username
- **Example:** `yoursite` or `yoursite@at-yourservice.ai`

#### `FTP_PASSWORD`
- **Name:** `FTP_PASSWORD`
- **Value:** Your FTP password
- **Security:** Never commit this to git, only store in GitHub Secrets

#### `FTP_SERVER_DIR`
- **Name:** `FTP_SERVER_DIR`
- **Value:** Remote directory path (must end with `/`)
- **Example:** `/www/` or `/public_html/` or `/`

## Step 2: Find Your OVHCloud FTP Details

### Via OVHCloud Control Panel:
1. Log in to https://www.ovh.com/manager/
2. Go to **Web Cloud** → **Hosting**
3. Select your hosting plan
4. Click **FTP-SSH** tab
5. You'll find:
   - FTP server address
   - FTP login (username)
   - You can reset the password here if needed

### Typical OVH FTP Server Format:
- **Hostname:** `ftp.clusterXXX.hosting.ovh.net` (where XXX is your cluster number)
- **Port:** 21 (default, not needed in workflow)
- **Protocol:** FTP or SFTP

## Step 3: Test Your FTP Connection (Optional)

Before setting up CI/CD, test your FTP credentials using an FTP client like FileZilla:

1. Download FileZilla: https://filezilla-project.org/
2. Connect with your credentials
3. Navigate to the correct directory (e.g., `/www/`)
4. Verify you can upload files

## Step 4: Verify Workflow Configuration

The workflow is already configured in `.github/workflows/test-and-deploy.yml`:

```yaml
- name: Deploy to OVHCloud via FTP
  uses: SamKirkland/FTP-Deploy-Action@v4.3.5
  with:
    server: ${{ secrets.FTP_SERVER }}
    username: ${{ secrets.FTP_USERNAME }}
    password: ${{ secrets.FTP_PASSWORD }}
    local-dir: ./dist/
    server-dir: ${{ secrets.FTP_SERVER_DIR }}
```

## Step 5: Deploy

Once secrets are configured:

1. Push to main branch:
   ```bash
   git push origin main
   ```

2. The workflow will:
   - ✅ Run unit tests (112 tests)
   - ✅ Build for GitHub Pages (base: `/AYS-AI-Website/`)
   - ✅ Build for OVHCloud (base: `/`)
   - ✅ Run build validation (25 tests)
   - ✅ Run E2E tests (30 tests)
   - 📦 Deploy to GitHub Pages (if unit tests + build validation pass)
   - 🚀 Deploy to OVHCloud via FTP (if all tests pass)

3. Monitor deployment:
   - Go to **Actions** tab in GitHub
   - Click on the latest workflow run
   - Watch the "Deploy to OVHCloud" job

## Deployment Behavior

### GitHub Pages Deployment:
- ✅ Only on `main` branch
- ✅ Only on direct pushes (not PRs)
- ✅ Requires: Unit Tests ✅ + Build Validation ✅
- ⚠️ E2E tests do NOT block GitHub Pages deployment
- 🌐 URL: https://joren-biq.github.io/AYS-AI-Website/

### OVHCloud Deployment:
- ✅ Only on `main` branch
- ✅ Only on direct pushes (not PRs)
- ✅ Requires: Unit Tests ✅ + Build Validation ✅ + E2E Tests ✅
- ⚠️ E2E test failures WILL block OVHCloud deployment
- 🌐 URL: https://at-yourservice.ai

### What Gets Deployed:
- Contents of `dist/` folder (built files)
- HTML, CSS, JS, images, fonts
- Does NOT deploy: source files, node_modules, tests

### Deployment Strategy:
- **Incremental:** Only changed files are uploaded
- **Safe:** Does not delete existing files on server
- **Fast:** Uses delta sync for efficiency

## Troubleshooting

### Connection Issues
If deployment fails with connection errors:

1. **Check FTP credentials:**
   - Verify server hostname is correct
   - Ensure username/password are correct
   - Try connecting with FileZilla first

2. **Check server directory:**
   - Ensure path exists: `/www/` or `/public_html/`
   - Path must end with `/`
   - Some OVH servers use `/` as root

3. **Firewall/Port issues:**
   - OVH uses standard FTP port 21
   - GitHub Actions should have no issues reaching OVH

### Deployment Successful but Site Not Updated
1. **Browser cache:** Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
2. **CDN cache:** If using Cloudflare, purge cache
3. **Wrong directory:** Check `FTP_SERVER_DIR` points to web root

### Files Missing After Deployment
- Check `dist/` folder contains all built files
- Verify build step completed successfully
- Check FTP logs in GitHub Actions output

## Security Best Practices

1. ✅ **Never commit FTP credentials** to git
2. ✅ **Use strong FTP password** (min 16 characters)
3. ✅ **Rotate passwords regularly** (every 3-6 months)
4. ✅ **Use SFTP if available** (more secure than FTP)
5. ✅ **Limit FTP access** to specific IPs if possible in OVH

## Advanced Configuration

### Use SFTP Instead of FTP
If your OVH hosting supports SFTP (more secure):

Update the workflow to use `protocol: ftps` or `protocol: ftps-legacy`:

```yaml
- name: Deploy to OVHCloud via SFTP
  uses: SamKirkland/FTP-Deploy-Action@v4.3.5
  with:
    server: ${{ secrets.FTP_SERVER }}
    username: ${{ secrets.FTP_USERNAME }}
    password: ${{ secrets.FTP_PASSWORD }}
    protocol: ftps
    local-dir: ./dist/
    server-dir: ${{ secrets.FTP_SERVER_DIR }}
```

### Dry Run (Test Without Uploading)
To test deployment without actually uploading:

```yaml
dry-run: true
```

### Clean Deployment (Delete Old Files)
**WARNING: This deletes everything in server-dir first!**

```yaml
dangerous-clean-slate: true
```

Only use this if you're sure!

## GitHub Pages Setup

GitHub Pages deployment is automatic once the workflow is configured. No additional secrets needed!

### Enable GitHub Pages:

1. **Repository Settings:**
   - Go to: https://github.com/joren-biq/AYS-AI-Website/settings/pages
   - Source: **GitHub Actions** (not "Deploy from a branch")
   - Click Save

2. **First Deployment:**
   - Push to main branch
   - Workflow will automatically deploy to GitHub Pages
   - URL: https://joren-biq.github.io/AYS-AI-Website/

3. **Verify Deployment:**
   - Go to: https://github.com/joren-biq/AYS-AI-Website/actions
   - Check "deploy-github-pages" job succeeded
   - Visit https://joren-biq.github.io/AYS-AI-Website/

### Troubleshooting GitHub Pages:

**If deployment fails with permission errors:**
1. Go to Settings → Actions → General
2. Scroll to "Workflow permissions"
3. Select "Read and write permissions"
4. Enable "Allow GitHub Actions to create and approve pull requests"
5. Click Save

**If site doesn't load:**
- Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
- Check that source is set to "GitHub Actions" not "Deploy from a branch"
- Verify workflow completed successfully in Actions tab

## Support

- OVHCloud FTP Guide: https://docs.ovh.com/gb/en/hosting/log-in-to-storage-ftp-web-hosting/
- GitHub Actions: https://github.com/joren-biq/AYS-AI-Website/actions
- FTP Deploy Action: https://github.com/SamKirkland/FTP-Deploy-Action

## Example Secret Values

Here's what your GitHub secrets might look like (DO NOT use these exact values):

```
FTP_SERVER=ftp.cluster042.hosting.ovh.net
FTP_USERNAME=atyourservice
FTP_PASSWORD=YourSecurePassword123!@#
FTP_SERVER_DIR=/www/
```

---

After setting up these secrets, your deployment pipeline is ready! Every push to main will automatically deploy to OVHCloud after all tests pass. 🚀
