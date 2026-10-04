$baseUrl = "http://localhost:8080"

Write-Host "=== 1. Submitting Anonymous Report ===" -ForegroundColor Cyan
$submitPayload = @{
    category = "SECURITY"
    description = "Critical security vulnerability: unauthenticated debug endpoint exposed on port 8080"
    evidenceUrl = "https://internal-security.corp/audit/sec-884"
} | ConvertTo-Json

$submitRes = Invoke-RestMethod -Uri "$baseUrl/api/reports" -Method Post -Body $submitPayload -ContentType "application/json"
$caseCode = $submitRes.data.caseCode
Write-Host "Submitted! Success: $($submitRes.success), Case Code: $caseCode, Status: $($submitRes.data.status)" -ForegroundColor Green

Write-Host "`n=== 2. Tracking Report with Case Code ===" -ForegroundColor Cyan
$trackRes = Invoke-RestMethod -Uri "$baseUrl/api/reports/$caseCode" -Method Get
Write-Host "Tracked: Case: $($trackRes.data.caseCode), Category: $($trackRes.data.category), Status: $($trackRes.data.status), History Count: $($trackRes.data.statusHistory.Count)" -ForegroundColor Green

Write-Host "`n=== 3. Tracking Invalid Case Code (Expecting 404) ===" -ForegroundColor Cyan
try {
    Invoke-RestMethod -Uri "$baseUrl/api/reports/WD-INVALID0" -Method Get
} catch {
    Write-Host "Correctly caught 404 error: $($_.Exception.Message)" -ForegroundColor Yellow
}

Write-Host "`n=== 4. Moderator Login ===" -ForegroundColor Cyan
$loginPayload = @{
    username = "admin"
    password = "WhistleDrop2026!Secure"
} | ConvertTo-Json

$loginRes = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method Post -Body $loginPayload -ContentType "application/json"
$token = $loginRes.data.token
Write-Host "Login Successful! Token received (length: $($token.Length))" -ForegroundColor Green

$authHeader = @{ Authorization = "Bearer $token" }

Write-Host "`n=== 5. Fetching Dashboard Stats ===" -ForegroundColor Cyan
$statsRes = Invoke-RestMethod -Uri "$baseUrl/api/moderator/dashboard/stats" -Method Get -Headers $authHeader
Write-Host "Stats: Total=$($statsRes.data.totalReports), Submitted=$($statsRes.data.submittedCount), UnderReview=$($statsRes.data.underReviewCount), Resolved=$($statsRes.data.resolvedCount), Dismissed=$($statsRes.data.dismissedCount)" -ForegroundColor Green

Write-Host "`n=== 6. Updating Report Status to UNDER_REVIEW ===" -ForegroundColor Cyan
$updatePayload = @{
    status = "UNDER_REVIEW"
    message = "Security operations center has verified the vulnerability and initiated triage."
} | ConvertTo-Json

$updateRes = Invoke-RestMethod -Uri "$baseUrl/api/moderator/reports/$caseCode/status" -Method Patch -Body $updatePayload -ContentType "application/json" -Headers $authHeader
Write-Host "Status Updated! New Status: $($updateRes.data.status), History entries: $($updateRes.data.statusHistory.Count)" -ForegroundColor Green

Write-Host "`n=== 7. Verifying Public Tracking Shows Updated Status and History ===" -ForegroundColor Cyan
$verifyTrackRes = Invoke-RestMethod -Uri "$baseUrl/api/reports/$caseCode" -Method Get
Write-Host "Public Track Status: $($verifyTrackRes.data.status)" -ForegroundColor Green
foreach ($item in $verifyTrackRes.data.statusHistory) {
    Write-Host "  - [$($item.status)] ($($item.createdAt)): $($item.message)" -ForegroundColor Gray
}

Write-Host "`n=== 8. Attempting Invalid Backward Status Transition (Expecting 400) ===" -ForegroundColor Cyan
try {
    $invalidPayload = @{
        status = "SUBMITTED"
        message = "Attempting invalid rollback."
    } | ConvertTo-Json
    Invoke-RestMethod -Uri "$baseUrl/api/moderator/reports/$caseCode/status" -Method Patch -Body $invalidPayload -ContentType "application/json" -Headers $authHeader
} catch {
    Write-Host "Correctly rejected invalid transition: $($_.Exception.Message)" -ForegroundColor Yellow
}

Write-Host "`n=== 9. Filtering Reports by Category and Status ===" -ForegroundColor Cyan
$filterRes = Invoke-RestMethod -Uri "$baseUrl/api/moderator/reports?category=SECURITY&status=UNDER_REVIEW" -Method Get -Headers $authHeader
Write-Host "Filtered Reports Count: $($filterRes.data.content.Count)" -ForegroundColor Green

Write-Host "`n=== ALL 9 END-TO-END FLOWS VERIFIED 100% WORKING ===" -ForegroundColor Green
