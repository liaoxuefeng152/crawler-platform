# Memory Optimization Strategy

## Trigger

Memory usage >60%

## Diagnosis

**Symptoms**:
- System swapping to disk
- Applications slow to respond
- OOM (Out of Memory) warnings in logs

**Impact**: High
- Performance: Severe degradation
- Stability: Risk of OOM killer
- User experience: Unusable system

## Analysis Commands

```bash
# Check memory usage
free -h

# Find memory hogs
ps aux --sort=-%mem | head -10

# Check swap usage
swapon --show

# Check for memory leaks (repeated patterns)
ps aux | awk '{print $1}' | sort | uniq -c | sort -rn | head -10
```

## Optimization Steps

### Step 1: Clean Temporary Files

```bash
# Clean Claude temp files
find /tmp -name "claude-*" -mtime +1 -delete

# Clean system temp files
find /tmp -type f -mtime +7 -delete

# Clean user temp files
find ~/.cache -type f -mtime +30 -delete
```

### Step 2: Clear Package Manager Caches

```bash
# Clean npm cache
npm cache clean --force

# Clean yarn cache
yarn cache clean

# Clean pnpm cache
pnpm store prune
```

### Step 3: Clear Build Caches

```bash
# Next.js cache
rm -rf .next/cache
rm -rf .next/turbo

# Webpack/Vite caches
find . -name "node_modules/.cache" -type d -exec rm -rf {} +

# TypeScript build cache
rm -rf node_modules/.typescript
rm -rf node_modules/.vite
```

### Step 4: Clear Docker Resources (if applicable)

```bash
# Remove stopped containers
docker container prune -f

# Remove unused images
docker image prune -a -f

# Remove build cache
docker builder prune -a -f
```

### Step 5: Clear Application Caches

```bash
# Browser cache (if applicable)
rm -rf ~/.cache/google-chrome
rm -rf ~/.cache/mozilla

# VSCode cache
rm -rf ~/.vscode-server/*/CachedData
rm -rf ~/.vscode-server/*/logs/*
```

### Step 6: Restart Memory-Intensive Services

```bash
# Identify high-memory processes
ps aux --sort=-%mem | head -5

# Ask user before restarting
# "Process [NAME] is using [X]MB. Restart it?"
```

## Expected Results

- **Memory**: ~2-5GB freed
- **Swap**: Reduced or eliminated
- **Performance**: Significantly improved
- **Stability**: OOM risk eliminated

## Validation

```bash
# Check memory after cleanup
free -h

# Compare:
# Before: 145GB used / 251GB total (58%)
# After:  120GB used / 251GB total (48%)
# Improvement: ~25GB freed
```

## Safety Notes

- ✅ Deleting temp files is safe (they're temporary)
- ✅ Clearing caches is safe (rebuilds automatically)
- ✅ Pruning Docker resources is safe
- ⚠️ Restarting services may interrupt active work
- ⚠️ Always ask user before restarting services

## Best Practices

### 1. Regular Cleanup Schedule

**Daily**: Clean temp files
```bash
# Add to crontab
0 0 * * * find /tmp -name "claude-*" -mtime +1 -delete
```

**Weekly**: Clear caches
```bash
# Add to crontab
0 0 * * 0 npm cache clean --force && rm -rf .next/cache
```

**Monthly**: Deep clean
```bash
# Full cleanup including Docker
docker system prune -a -f --volumes
```

### 2. Cache Configuration

Configure reasonable cache limits:

**Next.js** (`next.config.js`):
```javascript
module.exports = {
  experimental: {
    turbo: {
      memoryLimit: 512,
      cache: {
        // Limit cache size
        max: 100 * 1024 * 1024, // 100MB
      }
    }
  }
}
```

**npm** (`.npmrc`):
```
cache-max=104857600
cache-min=604800
```

### 3. Monitor Memory Trends

```bash
# Memory usage over time
watch -n 60 'free -h | grep Mem'
```

Set up alerts:
```bash
# Alert if memory >80%
if [ $(free | awk '/Mem/{printf("%.0f"), $3/$2*100}') -gt 80 ]; then
  echo "Warning: Memory usage over 80%"
fi
```

## Advanced: Swap Management

If swap is heavily used:

```bash
# Check swap usage
swapon --show
free -h | grep Swap

# Reduce swap tendency (requires sudo)
sudo sysctl vm.swappiness=10

# Make permanent
echo 'vm.swappiness=10' | sudo tee -a /etc/sysctl.conf
```

## Common Issues

### Issue: Memory still high after cleanup

**Cause**: Memory leak in application

**Diagnosis**:
```bash
# Check for growing processes
ps aux --sort=-%mem | head -10 > /tmp/mem-before.txt
sleep 60
ps aux --sort=-%mem | head -10 > /tmp/mem-after.txt
diff /tmp/mem-before.txt /tmp/mem-after.txt
```

**Fix**: Restart leaking application

### Issue: Swap still used after cleanup

**Cause**: Swap not released

**Fix**:
```bash
# Force swap release (requires sudo)
sudo swapoff -a && sudo swapon -a

# Or reduce swappiness
sudo sysctl vm.swappiness=10
```

### Issue: Cache refills quickly

**Cause**: Cache size too large

**Fix**: Configure smaller cache limits (see above)

## User Preferences

Ask user: "What is your acceptable memory usage threshold? (Recommended: <70%)"

Set this as trigger for future optimizations.

## Monitoring Dashboard

Create a simple monitor:
```bash
#!/bin/bash
while true; do
  clear
  echo "=== Memory Monitor ==="
  free -h
  echo ""
  echo "=== Top 5 Memory Consumers ==="
  ps aux --sort=-%mem | head -6 | awk '{printf "%-10s %6s %6s %s\n", $1, $3"%", $4"%", $11}'
  sleep 60
done
```

## Emergency: OOM Prevention

If near OOM:

```bash
# Check available memory
free -h | grep Mem | awk '{print $7}'

# If <2GB available, trigger emergency cleanup
if [ $(free | awk '/Mem/{printf("%d", $7})') -lt 2097152 ]; then
  echo "Emergency: Low memory!"
  # Kill stale Next.js servers
  pkill -9 -f "next-server"
  # Clear all caches
  rm -rf .next/cache node_modules/.cache
fi
```
