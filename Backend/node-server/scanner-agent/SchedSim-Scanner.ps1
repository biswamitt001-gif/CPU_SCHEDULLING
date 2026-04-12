# SchedSim PC Scanner Agent v1.0
# Downloads from: http://localhost:3000
# Scans running Windows processes and sends them to SchedSim for analysis
# Usage: Right-click -> Run with PowerShell

$serverUrl = "http://localhost:5000/api/pc-scan"
$maxProcesses = 15

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "  SchedSim PC Scanner Agent v1.0" -ForegroundColor Cyan
Write-Host "  Scanning running processes..." -ForegroundColor Gray
Write-Host "==================================================" -ForegroundColor Cyan

# Get top processes by CPU time, excluding system idle
$rawProcesses = Get-Process |
    Where-Object { $_.CPU -gt 0 -and $_.Name -notmatch "^(Idle|System)$" } |
    Sort-Object CPU -Descending |
    Select-Object -First $maxProcesses

if ($rawProcesses.Count -eq 0) {
    Write-Host "[ERROR] No CPU-active processes found." -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "`nTop $($rawProcesses.Count) processes detected:" -ForegroundColor Yellow
$rawProcesses | Format-Table Name, Id, @{Label="CPU(s)"; Expression={[math]::Round($_.CPU, 2)}}, WorkingSet64 -AutoSize

# Normalize burst times (CPU seconds) to 1-30 range for the scheduler
$maxCpu = ($rawProcesses | Measure-Object CPU -Maximum).Maximum
if ($maxCpu -le 0) { $maxCpu = 1 }

$processes = @()
for ($i = 0; $i -lt $rawProcesses.Count; $i++) {
    $proc = $rawProcesses[$i]
    
    # Normalize burst time: map [0, maxCpu] -> [1, 30]
    $burstTime = [math]::Max(1, [math]::Round(($proc.CPU / $maxCpu) * 30))
    
    # Arrival time: stagger by index (simulates sequential arrival)
    $arrivalTime = $i
    
    # Priority: based on rank (lower CPU rank = lower priority number = higher priority)
    $priority = $i + 1
    
    $processes += @{
        id          = "P$($i + 1)"
        realName    = $proc.Name
        pid         = $proc.Id
        arrivalTime = $arrivalTime
        burstTime   = $burstTime
        priority    = $priority
        memoryMB    = [math]::Round($proc.WorkingSet64 / 1MB, 1)
        rawCpuSec   = [math]::Round($proc.CPU, 2)
    }
}

Write-Host "`nSending data to SchedSim at $serverUrl ..." -ForegroundColor Cyan

$body = @{
    processes  = $processes
    scannedAt  = (Get-Date -Format "yyyy-MM-ddTHH:mm:ss")
    machineName = $env:COMPUTERNAME
} | ConvertTo-Json -Depth 5

try {
    $response = Invoke-RestMethod -Uri $serverUrl -Method POST -Body $body -ContentType "application/json" -TimeoutSec 30
    Write-Host "`n[SUCCESS] Scan data sent! Open http://localhost:3000 and click the 'Live PC Scan' tab." -ForegroundColor Green
    Write-Host "Processes analyzed: $($processes.Count)" -ForegroundColor Green
    Write-Host "Algorithms run: FCFS, SJF, SRTF, Round Robin, Priority" -ForegroundColor Green
} catch {
    Write-Host "`n[ERROR] Could not connect to SchedSim backend." -ForegroundColor Red
    Write-Host "Make sure SchedSim is running (node-server on port 5000)." -ForegroundColor Yellow
    Write-Host "Error: $_" -ForegroundColor DarkRed
}

Write-Host "`n==================================================" -ForegroundColor Cyan
Read-Host "Press Enter to exit"
