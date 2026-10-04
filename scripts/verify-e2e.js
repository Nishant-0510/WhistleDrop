const BASE_URL = 'http://localhost:8080';

async function runE2ETests() {
  console.log('=== WHISTLEDROP END-TO-END AUTOMATED VERIFICATION ===\n');

  // 1. Submit anonymous report
  console.log('1. Submitting Anonymous Report...');
  const submitRes = await fetch(`${BASE_URL}/api/reports`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      category: 'SECURITY',
      description: 'Critical security audit: discovered unprotected sensitive admin endpoint during internal vulnerability scan.',
      evidenceUrl: 'https://security.internal/audit/sec-2026-04'
    })
  });
  const submitJson = await submitRes.json();
  console.log(`   Response (${submitRes.status}):`, submitJson);
  if (!submitJson.success || !submitJson.data.caseCode) {
    throw new Error('Failed to submit report');
  }
  const caseCode = submitJson.data.caseCode;
  console.log(`   ✓ Report submitted successfully! Generated Case Code: ${caseCode}`);

  // 2. Track Report with Case Code
  console.log(`\n2. Tracking Report with Case Code [${caseCode}]...`);
  const trackRes = await fetch(`${BASE_URL}/api/reports/${caseCode}`);
  const trackJson = await trackRes.json();
  console.log(`   Response (${trackRes.status}):`, trackJson);
  if (!trackJson.success || trackJson.data.status !== 'SUBMITTED') {
    throw new Error('Tracking verification failed');
  }
  console.log(`   ✓ Report tracked! Status: ${trackJson.data.status}, Category: ${trackJson.data.category}`);

  // 3. Track Invalid Case Code
  console.log('\n3. Tracking Invalid Case Code [WD-INVALID0]...');
  const invalidTrackRes = await fetch(`${BASE_URL}/api/reports/WD-INVALID0`);
  const invalidTrackJson = await invalidTrackRes.json();
  console.log(`   Response (${invalidTrackRes.status}):`, invalidTrackJson);
  if (invalidTrackRes.status !== 404 || invalidTrackJson.success !== false) {
    throw new Error('Invalid case code should return 404');
  }
  console.log('   ✓ Correctly returned 404 Not Found for non-existent case code.');

  // 4. Moderator Login
  console.log('\n4. Authenticating Moderator (admin)...');
  const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: 'admin',
      password: 'WhistleDrop2026!Secure'
    })
  });
  const loginJson = await loginRes.json();
  console.log(`   Response (${loginRes.status}):`, {
    success: loginJson.success,
    tokenType: loginJson.data?.tokenType,
    username: loginJson.data?.username,
    tokenPrefix: loginJson.data?.token?.substring(0, 25) + '...'
  });
  if (!loginJson.success || !loginJson.data.token) {
    throw new Error('Moderator login failed');
  }
  const token = loginJson.data.token;
  const authHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
  console.log('   ✓ Moderator successfully authenticated and JWT Bearer token obtained.');

  // 5. Fetch Dashboard Stats
  console.log('\n5. Fetching Moderator Dashboard Stats...');
  const statsRes = await fetch(`${BASE_URL}/api/moderator/dashboard/stats`, {
    headers: authHeaders
  });
  const statsJson = await statsRes.json();
  console.log(`   Response (${statsRes.status}):`, statsJson.data);
  if (!statsJson.success || typeof statsJson.data.totalReports !== 'number') {
    throw new Error('Dashboard stats failed');
  }
  console.log(`   ✓ Total Reports: ${statsJson.data.totalReports}, Submitted: ${statsJson.data.submittedCount}, Under Review: ${statsJson.data.underReviewCount}, Resolved: ${statsJson.data.resolvedCount}`);

  // 6. Update Report Status to UNDER_REVIEW
  console.log(`\n6. Updating Report [${caseCode}] Status to UNDER_REVIEW...`);
  const updateRes = await fetch(`${BASE_URL}/api/moderator/reports/${caseCode}/status`, {
    method: 'PATCH',
    headers: authHeaders,
    body: JSON.stringify({
      status: 'UNDER_REVIEW',
      message: 'Security Operations Center has acknowledged the vulnerability report and assigned incident responder.'
    })
  });
  const updateJson = await updateRes.json();
  console.log(`   Response (${updateRes.status}):`, updateJson);
  if (!updateJson.success || updateJson.data.status !== 'UNDER_REVIEW') {
    throw new Error('Status update to UNDER_REVIEW failed');
  }
  console.log('   ✓ Status updated to UNDER_REVIEW with status history entry!');

  // 7. Verify Public Tracking Reflects the Update
  console.log(`\n7. Verifying Public Tracking reflects new status and history...`);
  const verifyTrackRes = await fetch(`${BASE_URL}/api/reports/${caseCode}`);
  const verifyTrackJson = await verifyTrackRes.json();
  console.log(`   Current Status: ${verifyTrackJson.data.status}`);
  console.log('   Status History Log:');
  verifyTrackJson.data.statusHistory.forEach((h, idx) => {
    console.log(`     [${idx + 1}] (${h.status}) ${h.createdAt}: "${h.message}"`);
  });
  if (verifyTrackJson.data.status !== 'UNDER_REVIEW' || verifyTrackJson.data.statusHistory.length < 2) {
    throw new Error('Public tracking does not show new status history');
  }
  console.log('   ✓ Public tracking verified: Status is UNDER_REVIEW and full history is present!');

  // 8. Update Report Status to RESOLVED
  console.log(`\n8. Updating Report [${caseCode}] Status to RESOLVED...`);
  const resolveRes = await fetch(`${BASE_URL}/api/moderator/reports/${caseCode}/status`, {
    method: 'PATCH',
    headers: authHeaders,
    body: JSON.stringify({
      status: 'RESOLVED',
      message: 'Firewall rules updated and legacy endpoint decommissioned. Issue completely resolved.'
    })
  });
  const resolveJson = await resolveRes.json();
  console.log(`   Response (${resolveRes.status}):`, resolveJson);
  if (!resolveJson.success || resolveJson.data.status !== 'RESOLVED') {
    throw new Error('Status update to RESOLVED failed');
  }
  console.log('   ✓ Status successfully updated to RESOLVED!');

  // 9. Verify Invalid Transition Rejection
  console.log('\n9. Testing Invalid Status Transition (RESOLVED -> SUBMITTED)...');
  const invalidTransitionRes = await fetch(`${BASE_URL}/api/moderator/reports/${caseCode}/status`, {
    method: 'PATCH',
    headers: authHeaders,
    body: JSON.stringify({
      status: 'SUBMITTED',
      message: 'Attempting invalid backward transition.'
    })
  });
  const invalidTransitionJson = await invalidTransitionRes.json();
  console.log(`   Response (${invalidTransitionRes.status}):`, invalidTransitionJson);
  if (invalidTransitionRes.status !== 400 || invalidTransitionJson.success !== false) {
    throw new Error('Invalid status transition should return 400 Bad Request');
  }
  console.log('   ✓ Correctly rejected invalid transition with HTTP 400 Bad Request.');

  // 10. Test Unauthorized Moderator Access (401)
  console.log('\n10. Testing Unauthorized Access without Token (Expecting 401)...');
  const unauthRes = await fetch(`${BASE_URL}/api/moderator/reports`);
  const unauthJson = await unauthRes.json();
  console.log(`   Response (${unauthRes.status}):`, unauthJson);
  if (unauthRes.status !== 401) {
    throw new Error('Missing token should return 401 Unauthorized');
  }
  console.log('   ✓ Correctly returned HTTP 401 Unauthorized for unauthenticated request.');

  // 11. Test Filter & Search Reports
  console.log('\n11. Testing Paginated & Filtered Reports API...');
  const filterRes = await fetch(`${BASE_URL}/api/moderator/reports?category=SECURITY&status=RESOLVED`, {
    headers: authHeaders
  });
  const filterJson = await filterRes.json();
  console.log(`   Response (${filterRes.status}): Total elements: ${filterJson.data.totalElements}, Page: ${filterJson.data.pageNumber}`);
  if (!filterJson.success) {
    throw new Error('Filtering reports failed');
  }
  console.log('   ✓ Filter API successfully retrieved matching reports.');

  console.log('\n🎉 ALL 11 END-TO-END TESTS PASSED WITH 100% SUCCESS!');
}

runE2ETests().catch(err => {
  console.error('\n❌ E2E TEST FAILED:', err);
  process.exit(1);
});
