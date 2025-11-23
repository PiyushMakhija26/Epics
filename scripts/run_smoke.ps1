$base = 'http://localhost:3001'
 $base = 'http://localhost:3001'
 $outFile = 'c:\Users\piyu4\OneDrive\Desktop\Epics\scripts\smoke_output.json'
 $log = @()

function safeInvoke([string]$method, [string]$url, $body=$null, $token=$null) {
  try {
    $headers = @{}
    if ($token) { $headers.Add('Authorization', "Bearer $token") }
    if ($body -ne $null) {
      $json = $body | ConvertTo-Json -Depth 10
      $resp = Invoke-RestMethod -Uri $url -Method $method -Headers $headers -Body $json -ContentType 'application/json' -UseBasicParsing
    } else {
      $resp = Invoke-RestMethod -Uri $url -Method $method -Headers $headers -UseBasicParsing
    }
    return @{ ok=$true; status=200; body=$resp }
  } catch {
    $err = $_.Exception.Response
    if ($err) {
      try {
        $text = (New-Object System.IO.StreamReader($err.GetResponseStream())).ReadToEnd();
        $parsed = $null
        try { $parsed = $text | ConvertFrom-Json -ErrorAction SilentlyContinue } catch { $parsed = $null }
        if ($parsed) { $bodyVal = $parsed } else { $bodyVal = $text }
        return @{ ok=$false; status = ($err.StatusCode.Value__); body=$bodyVal }
      } catch { return @{ ok=$false; status=0; body=$_.Exception.Message } }
    }
    return @{ ok=$false; status=0; body=$_.Exception.Message }
  }
}

Write-Host "=== HEARTBEAT ==="
$s = safeInvoke 'GET' "$base/health"
$log += @{ step='health'; result=$s }

Write-Host "=== SEED DEFAULTS (dev only) ==="
$seed = safeInvoke 'POST' "$base/api/auth/seed-defaults"
$log += @{ step='seed-defaults'; result=$seed }

Start-Sleep -Milliseconds 500

Write-Host "=== LOGIN user1@example.com ==="
$userLogin = safeInvoke 'POST' "$base/api/auth/login" @{ email='user1@example.com'; password='Password123!' }
$log += @{ step='user-login'; result=$userLogin }
$userToken = $null
if ($userLogin.ok -and $userLogin.body.token) { $userToken = $userLogin.body.token }

Write-Host "=== CREATE REQUEST as user1 ==="
$create = safeInvoke 'POST' "$base/api/requests" @{ title='Smoke Test Request'; description='Created by smoke script'; category='General'; department='Electricity'; priority='medium' } $userToken
$log += @{ step='create-request'; result=$create }
$requestId = $null
if ($create.ok -and $create.body.id) { $requestId = $create.body.id } elseif ($create.ok -and $create.body._id) { $requestId = $create.body._id } elseif ($create.ok -and $create.body.data -and $create.body.data.id) { $requestId = $create.body.data.id }

Write-Host "=== LOGIN admin1@example.com ==="
$adminLogin = safeInvoke 'POST' "$base/api/auth/login" @{ email='admin1@example.com'; password='Password123!' }
$log += @{ step='admin-login'; result=$adminLogin }
$adminToken = $null
if ($adminLogin.ok -and $adminLogin.body.token) { $adminToken = $adminLogin.body.token }

if (-not $requestId) { Write-Host "No request id created, aborting further admin actions."; exit 0 }

Write-Host "=== ADMIN set status in_progress ==="
$status1 = safeInvoke 'PUT' "$base/api/requests/$requestId/status" @{ status='in_progress'; message='Starting work' } $adminToken
$log += @{ step='admin-set-in_progress'; result=$status1 }

Start-Sleep -Milliseconds 300

Write-Host "=== ADMIN set status completed ==="
$status2 = safeInvoke 'PUT' "$base/api/requests/$requestId/status" @{ status='completed'; message='Work completed' } $adminToken
$log += @{ step='admin-set-completed'; result=$status2 }

Start-Sleep -Milliseconds 300

Write-Host "=== USER rate request ==="
$rate = safeInvoke 'POST' "$base/api/requests/$requestId/rate" @{ rating='excellent'; comments='Great work' } $userToken
$log += @{ step='user-rate'; result=$rate }

Start-Sleep -Milliseconds 300

Write-Host "=== USER request change ==="
$change = safeInvoke 'POST' "$base/api/requests/$requestId/request-change" @{ message='Please update the details to include location specifics.' } $userToken
$log += @{ step='user-request-change'; result=$change }
$changeId = $null
if ($change.ok -and $change.body.data -and $change.body.data.id) { $changeId = $change.body.data.id } elseif ($change.ok -and $change.body.id) { $changeId = $change.body.id }

if ($changeId -ne $null) {
  Write-Host "=== ADMIN approve change ==="
  $approve = safeInvoke 'POST' "$base/api/requests/$requestId/change/$changeId/approve" @{ approve=$true; adminResponse='Approved for edit' } $adminToken
    $log += @{ step='admin-approve-change'; result=$approve }
} else {
  Write-Host "No changeId available, skipping approval step."
}

Write-Host "=== SMOKE COMPLETE ==="

# write log to file
try {
  $log | ConvertTo-Json -Depth 10 | Out-File -FilePath $outFile -Encoding utf8
  Write-Host "WROTE_LOG:$outFile"
} catch {
  Write-Host "FAILED_WRITE_LOG:" $_.Exception.Message
}

