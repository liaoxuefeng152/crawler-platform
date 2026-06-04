# Next.js Optimization Strategy

## Trigger

Next.js server processes >3

## Diagnosis

**Symptoms**:

- Multiple dev servers running simultaneously
- High memory from Turbopack/Webpack processes
- Port conflicts or stale HMR connections

**Impact**: Medium

- Memory: ~500MB-1GB per redundant server
- Load: ~5-15% increase
- Port conflicts: Development issues

## Analysis Commands

```bash
# Count Next.js processes
ps aux | grep "next-server" | grep -v grep | wc -l

# List all with details
ps aux | grep "next-server" | grep -v grep | \
  awk '{print "PID:", $2, "CPU:", $3"%", "MEM:", $4"%", "TIME:", $10}'

# Check ports
lsof -i -P | grep LISTEN | grep -E ':3000|:3001|:3002'
```

## Optimization Steps

### Step 1: Identify Active Projects

```bash
# List all next-server processes with working directories
ps aux | grep "next-server" | grep -v grep | \
  awk '{print "PID:", $2, "CMD:", $11, $12, $13, $14, $15}'
```

Ask user: "Which projects are you actively developing?"

### Step 2: Stop Stale Servers

```bash
# Get list of PIDs
pids=$(ps aux | grep "next-server" | grep -v grep | awk '{print $2}')

# Get process ages
for pid in $pids; do
  echo "PID: $pid"
  ps -p $pid -o etime=
done

# Stop oldest servers (keep 2 most recent)
ps aux | grep "next-server" | grep -v grep | \
  awk '{print $2}' | head -n -2 | xargs -I {} kill -TERM {}
```

Wait 10 seconds, check if stopped:

```bash
ps aux | grep "next-server" | grep -v grep | wc -l
```

If still running, force kill:

```bash
ps aux | grep "next-server" | grep -v grep | \
  awk '{print $2}' | head -n -2 | xargs -I {} kill -9 {}
```

### Step 3: Clear Next.js Cache

```bash
# Clear build cache
rm -rf .next/cache

# Clear Turbopack cache
rm -rf .next/turbo

# Clear entire .next (more aggressive)
# rm -rf .next
```

### Step 4: Configure Memory Limits

In `next.config.js`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    turbo: {
      memoryLimit: 512, // Limit to 512MB per process
    },
  },
};

module.exports = nextConfig;
```

## Expected Results

- **Memory**: ~500MB-1GB freed per redundant server
- **Load**: ~5-15% reduction
- **Port conflicts**: Resolved
- **HMR performance**: Improved

## Validation

```bash
# Check Next.js processes
sys-check

# Should see:
# ✓ Next.js processes reduced to 1-2
# ✓ Memory usage decreased
# ✓ Load decreased
```

## User Preferences

Ask user: "How many Next.js dev servers do you need? (Recommended: 1-2)"

Set this as target for cleanup.

## Safety Notes

- ✅ Stopping dev servers is safe (code is preserved)
- ✅ Clearing cache is safe (rebuilds on next run)
- ✅ Memory limits prevent runaway processes
- ⚠️ Make sure to save unsaved changes before stopping
- ⚠️ Active HMR connections will be dropped

## Best Practices

### 1. Server Management

**Recommendation**: Only run dev servers for active projects

```bash
# Start dev server only when needed
npm run dev

# Stop when done developing
Ctrl+C or kill [PID]
```

### 2. Port Management

Use different ports for different projects:

```bash
# Project 1
npm run dev -- -p 3000

# Project 2
npm run dev -- -p 3001

# Project 3
npm run dev -- -p 3002
```

### 3. Cache Strategy

Regular cache cleanup (weekly):

```bash
# Add to package.json scripts
"scripts": {
  "clean": "rm -rf .next && rm -rf node_modules/.cache"
}
```

## Common Issues

### Issue: Port already in use

**Symptom**: "Error: listen EADDRINUSE: address already in use :::3000"

**Fix**:

```bash
# Find process using port
lsof -i :3000

# Kill it
kill -9 [PID]

# Or use different port
npm run dev -- -p 3001
```

### Issue: HMR not working

**Symptom**: Changes not reflecting, need manual refresh

**Fix**:

```bash
# Clear cache and restart
rm -rf .next/cache
npm run dev
```

### Issue: High memory after long runtime

**Symptom**: Next.js server consuming >2GB memory

**Fix**:

```bash
# Restart server
kill -TERM [PID]
npm run dev
```

## Monitoring

Monitor Next.js processes every hour:

```bash
watch -n 3600 'ps aux | grep "next-server" | grep -v grep | wc -l'
```

## Advanced: Process Manager

For frequent development, use a process manager:

```bash
# Install PM2
npm install -g pm2

# Start with PM2
pm2 start "npm run dev" --name "next-dev"

# Monitor
pm2 monit

# Stop
pm2 stop next-dev
```
