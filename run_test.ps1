# Test script: register + login + session + AI optimize
param([switch]$SkipAi)

$ErrorActionPreference = "Stop"
$hostname = "127.0.0.1"
$port = 8787
$outFile = "test_output.txt"
$resultFile = "test_result.txt"

function Invoke-Api {
    param($Method, $Path, $Body, $Token)
    $headers = @{ "Content-Type" = "application/json" }
    if ($Token) { $headers["Authorization"] = "Bearer $Token" }
    
    $params = @{
        Uri = "http://${hostname}:${port}${Path}"
        Method = $Method
        Headers = $headers
    }
    if ($Body) { $params["Body"] = ($Body | ConvertTo-Json -Compress) }
    
    try {
        $resp = Invoke-WebRequest @params -UseBasicParsing
        $json = $resp.Content | ConvertFrom-Json
        return @{ Status = [int]$resp.StatusCode; Body = $json }
    } catch {
        $code = 0
        if ($_.Exception.Response) { $code = [int]$_.Exception.Response.StatusCode }
        try { $body = $_ | ConvertFrom-Json } catch { $body = $_.Exception.Message }
        return @{ Status = $code; Body = $body }
    }
}

$log = @()

# Step 1: Register
$email = "u$([DateTimeOffset]::Now.ToUnixTimeMilliseconds())@x.com"
$log += "=== STEP 1: REGISTER ==="
$log += "Email: $email"
$result = Invoke-Api -Method POST -Path "/api/auth/register" -Body @{ email = $email; password = "test123"; name = "Dev" }
$log += "Status: $($result.Status)"
$log += ($result.Body | ConvertTo-Json -Depth 10)
$log += ""

if ($result.Status -ne 200) {
    $log | Out-File $outFile -Encoding UTF8
    Write-Host "REGISTER FAILED"
    exit 1
}

$token = $result.Body.session.token

# Step 2: Login
$log += "=== STEP 2: LOGIN ==="
$result = Invoke-Api -Method POST -Path "/api/auth/login" -Body @{ email = $email; password = "test123" }
$log += "Status: $($result.Status)"
$log += ($result.Body | ConvertTo-Json -Depth 10)
$log += ""

if ($result.Status -ne 200) {
    $log | Out-File $outFile -Encoding UTF8
    Write-Host "LOGIN FAILED"
    exit 1
}

# Step 3: Session
$log += "=== STEP 3: SESSION ==="
$result = Invoke-Api -Method GET -Path "/api/auth/session" -Token $token
$log += "Status: $($result.Status)"
$log += ($result.Body | ConvertTo-Json -Depth 10)
$log += ""

# Step 4: AI Optimize
if (-not $SkipAi) {
    $log += "=== STEP 4: AI OPTIMIZE ==="
    $testData = Get-Content "test-ai.json" -Raw | ConvertFrom-Json
    $body = @{
        resumeText = $testData.resume_text
        jobDescription = $testData.job_description
        model = "deepseek-chat"
    }
    $log += "Sending request..."
    $result = Invoke-Api -Method POST -Path "/api/ai/optimize" -Body $body -Token $token
    $log += "Status: $($result.Status)"
    
    if ($result.Status -eq 200) {
        $resultText = $result.Body.result
        $log += "Result length: $($resultText.Length) chars"
        $log += "Preview: $($resultText.Substring(0, [Math]::Min(500, $resultText.Length)))"
        $resultText | Out-File $resultFile -Encoding UTF8
        $log += "Full result saved to $resultFile"
    } else {
        $log += ($result.Body | ConvertTo-Json -Depth 10)
    }
}

$log | Out-File $outFile -Encoding UTF8
Write-Host "=== DONE ==="
Write-Host "Log saved to: $outFile"
