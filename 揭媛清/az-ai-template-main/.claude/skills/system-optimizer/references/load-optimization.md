# Load Optimization Strategy

## Trigger

System load (1-minute average) >10

## Diagnosis

**Symptoms**:
- System slow to respond
- Commands take long to execute
- High CPU usage for extended periods
- Load average >10

**Impact**: High
- Performance: System unusable
- Stability: Risk of system freeze
- SSH: Frequent disconnections

## Analysis Commands

```bash
# Check load average
uptime

# Find CPU hogs
ps aux --sort=-%cpu | head -10

# Check I/O wait
iostat -x 1 5

# Check system interrupts
vmstat 1 5
```

## Optimization Steps

### Step 1: Identify High-Load Processes

```bash
# Get detailed CPU usage
top -bn1 | head -20

# Find processes using >100% CPU
ps aux | awk '$3 > 100' | grep -v grep

# Check for runaway processes
ps aux | awk '{print $2, $3, $11}' | sort -k2 -rn | head -10
```

### Step 2: Categorize High-CPU Processes

**System processes** (be careful):
- kswapd (memory management)
- kworker (kernel workers)
- migration (CPU load balancing)

**User processes** (safe to kill):
- Next.js dev servers
- Build processes (webpack, turbopack)
- Test runners (playwright, jest)
- Node scripts

### Step 3: Stop Stale Development Servers

```bash
# Find long-running next-server processes
ps aux | grep "next-server" | grep -v grep | \
  awk '{print "PID:", $2, "TIME:", $10}'

# Kill those running >2 hours
ps aux | grep "next-server" | grep -v grep | \
  awk '{split($10, a, ":"); if (a[1] > 2 || a[2] > 30) print $2}' | \
  xargs -I {} kill -TERM {}
```

### Step 4: Stop Build/Test Processes

```bash
# Stop webpack processes
pkill -f webpack

# Stop turbopack processes
pkill -f turbopack

# Stop test runners
pkill -f playwright
pkill -f jest

# Stop npm scripts
pkill -f "npm.*run"
```

### Step 5: Kill Stuck Processes

```bash
# Find processes in D state (uninterruptible sleep)
ps aux | awk '$8 ~ /D/ {print $2, $11}'

# Find zombie processes
ps aux | awk '$8 ~ /Z/ {print $2, $11}'

# Note: D state processes usually can't be killed safely
# Z state processes are already dead, waiting for parent
```

### Step 6: Restart Services (if needed)

```bash
# Identify stuck services
systemctl list-units --state=failed

# Ask user before restarting
# "Service [NAME] has failed. Restart it?"
```

## Expected Results

- **Load**: ~30-50% reduction
- **CPU**: ~20-40% reduction
- **Responsiveness**: Significantly improved
- **SSH stability**: Fewer disconnections

## Validation

```bash
# Check load after optimization
sys-check

# Compare:
# Before: Load 18.3 (Critical)
# After:  Load 10.2 (Warning)
# Improvement: ~44% reduction
```

## Safety Notes

- ✅ Stopping user processes is safe
- ✅ Stopping development servers is safe
- ⚠️ Be careful with system processes (kswapd, kworker, etc.)
- ⚠️ D state processes usually can't be killed
- ⚠️ Always ask user before restarting services

## Best Practices

### 1. Monitor Load Trends

```bash
# Continuous monitoring
watch -n 10 'uptime'

# Log load averages
uptime >> ~/load-log.txt
```

### 2. Set Load Alerts

```bash
# Alert if load >15
if [ $(uptime | awk -F'load average:' '{print $2}' | awk '{print $1}' | cut -d. -f1) -gt 15 ]; then
  echo "Warning: System load >15"
  # Send notification or trigger cleanup
fi
```

### 3. Process Limits

Configure user limits:

```bash
# Add to ~/.bashrc
ulimit -u 4096  # Max processes
ulimit -n 4096  # Max file descriptors
```

## Common Issues

### Issue: Load remains high after cleanup

**Cause**: I/O bottleneck (disk or network)

**Diagnosis**:
```bash
# Check I/O wait
iostat -x 1 5

# Look for %iowait >20%
```

**Fix**:
- If disk I/O: Check for failing disk, optimize queries
- If network I/O: Check for network issues, reduce remote operations

### Issue: kswapd using high CPU

**Cause**: Memory pressure causing swapping

**Diagnosis**:
```bash
# Check swap usage
free -h | grep Swap

# Check if swap is being used
swapon --show
```

**Fix**: See memory-optimization.md

### Issue: All CPUs at 100%

**Cause**: Fork bomb or infinite loop

**Fix**:
```bash
# Check for rapidly spawning processes
ps aux | awk '{print $11}' | sort | uniq -c | sort -rn

# Kill parent process of fork bomb
kill -9 [parent-PID]
```

## Advanced: Load Balancing

If load is consistently high:

```bash
# Reduce CPU-intensive process priority
renice +5 [PID]

# Or use ionice for I/O
ionice -c 3 -p 7 [PID]
```

## Emergency: System Recovery

If system is unresponsive:

```bash
# Emergency: Kill all user processes
pkill -9 -u $USER

# Last resort: Reboot (requires sudo)
sudo reboot
```

**Warning**: Only use if system is completely frozen.

## User Preferences

Ask user: "What is your acceptable load threshold? (Recommended: <10)"

Set this as trigger for optimization.

## Monitoring Scripts

### Simple Load Monitor

```bash
#!/bin/bash
while true; do
  load=$(uptime | awk -F'load average:' '{print $2}' | awk '{print $1}')
  echo "Load: $load"

  if [ $(echo "$load > 15" | bc) -eq 1 ]; then
    echo "Warning: High load detected!"
    # Trigger optimization
  fi

  sleep 60
done
```

### Detailed System Monitor

```bash
#!/bin/bash
while true; do
  clear
  echo "=== System Monitor ==="
  echo ""
  echo "Load Average:"
  uptime
  echo ""
  echo "CPU Usage:"
  grep 'cpu ' /proc/stat | awk '{usage=($2+$4)*100/($2+$4+$5)} END {printf "%.1f%%\n", usage}'
  echo ""
  echo "Top 5 CPU Processes:"
  ps aux --sort=-%cpu | head -6 | awk '{printf "%-10s %6s %6s %s\n", $1, $3"%", $4"%", $11}'
  echo ""
  date
  sleep 10
done
```

## Load Thresholds

| Load Level | Value | Action |
|------------|-------|--------|
| Normal | <10 | Monitor only |
| Warning | 10-15 | Analyze and recommend |
| Critical | 15-20 | Immediate optimization |
| Emergency | >20 | Kill processes, consider reboot |
