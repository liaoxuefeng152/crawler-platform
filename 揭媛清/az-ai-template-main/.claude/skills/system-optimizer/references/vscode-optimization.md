# VSCode Optimization Strategy

## Trigger

VSCode Server processes >15

## Diagnosis

**Symptoms**:
- High memory usage from multiple extension hosts
- File watchers consuming CPU
- TypeScript servers running for each instance

**Impact**: Medium
- Memory: ~1-2GB per redundant instance
- Load: ~10-20% increase
- File system: Excessive inotify watchers

## Analysis Commands

```bash
# Count VSCode processes
ps aux | grep -E "code-server|vscode-server" | grep -v grep | wc -l

# Identify extension hosts
ps aux | grep "extensionHost" | grep -v grep

# Check file watchers
lsof | grep VSCode | wc -l
```

## Optimization Steps

### Step 1: Identify Active Instances

```bash
# List all VSCode processes with details
ps aux | grep -E "code-server|vscode-server" | grep -v grep | \
  awk '{print "PID:", $2, "CPU:", $3"%", "MEM:", $4"%", "TIME:", $10}'
```

Ask user: "Which VSCode instances are you actively using?"

### Step 2: Stop Redundant Extension Hosts

```bash
# Stop non-essential extension hosts
ps aux | grep "extensionHost" | grep -v grep | \
  awk '{print $2}' | head -n -X | xargs -I {} kill -TERM {}
```

Wait 5 seconds, if still running:
```bash
ps aux | grep "extensionHost" | grep -v grep | \
  awk '{print $2}' | head -n -X | xargs -I {} kill -9 {}
```

### Step 3: Configure File Watcher Exclusions

Add to `.vscode/settings.json`:

```json
{
  "files.watcherExclude": {
    "**/node_modules/**": true,
    "**/.git/**": true,
    "**/dist/**": true,
    "**/build/**": true,
    "**/.next/**": true,
    "**/coverage/**": true,
    "**/.cache/**": true,
    "**/tmp/**": true,
    "**/temp/**": true
  },
  "search.exclude": {
    "**/node_modules": true,
    "**/bower_components": true,
    "**/dist": true,
    "**/build": true,
    "**/.next": true,
    "**/coverage": true
  },
  "typescript.tsserver.maxTsServerMemory": 4096,
  "typescript.tsserver.experimental.enableProjectDiagnostics": false
}
```

### Step 4: Limit TypeScript Server Memory

```bash
# Kill existing TypeScript servers
ps aux | grep "tsserver" | grep -v grep | awk '{print $2}' | \
  xargs -I {} kill -TERM {}

# They will restart with new limits automatically
```

## Expected Results

- **Memory**: ~1-2GB freed per redundant instance
- **Load**: ~10-20% reduction
- **File watchers**: Reduced by 50-70%
- **VSCode responsiveness**: Improved

## Validation

```bash
# Check VSCode processes again
sys-check

# Should see:
# ✓ VSCode processes reduced to expected count
# ✓ Memory usage decreased
# ✓ System load decreased
```

## User Preferences

Ask user for their preferred configuration:
```
How many VSCode instances do you typically use? (Recommended: 2-3)
```

Set this as target for cleanup operations.

## Safety Notes

- ✅ Extension hosts will auto-restart when needed
- ✅ File watcher exclusions are safe (no data loss)
- ✅ TypeScript server limits prevent memory bloat
- ⚠️ Killing processes may close unsaved files in some cases
- ⚠️ Always ask user which instances are active before terminating

## Common Issues

### Issue: Extension host restarts repeatedly

**Cause**: Extension conflict or corrupted cache

**Fix**:
```bash
# Clear VSCode server cache
rm -rf ~/.vscode-server/cli/*/server/logs/*
rm -rf ~/.vscode-server/data/User/workspaceStorage/*/ms-vscode.js-debug
```

### Issue: File watchers still high

**Cause**: Global exclusions not applied

**Fix**:
```bash
# Check system-wide limits
cat /proc/sys/fs/inotify/max_user_watches

# Increase if needed (requires sudo)
sudo sysctl fs.inotify.max_user_watches=524288
```

## Monitoring

After optimization, monitor every 6 hours:
```bash
watch -n 21600 'ps aux | grep -E "code-server|vscode-server" | grep -v grep | wc -l'
```
