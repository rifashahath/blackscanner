import {
    ScanJob, DiscoveredRoute, Finding, Hypothesis, Evidence,
    ScanEvent, Report, DashboardStats, DiscoveredForm, DiscoveredParameter,
    DiscoveredJSFile, APICall, SurfaceStats
} from '@/types';

const now = new Date().toISOString();
const hourAgo = new Date(Date.now() - 3600000).toISOString();
const dayAgo = new Date(Date.now() - 86400000).toISOString();

export const mockDashboardStats: DashboardStats = {
    total_scans: 47,
    active_scans: 2,
    total_findings: 156,
    critical_findings: 12,
    scans_today: 5,
};

export const mockScans: ScanJob[] = [
    {
        id: 'scan-001',
        target_id: 'target-001',
        target_url: 'https://app.example.com',
        mode: 'authenticated',
        status: 'analyzing',
        progress: 68,
        current_phase: 'AI Analysis',
        routes_found: 142,
        forms_found: 23,
        params_found: 87,
        js_files_found: 34,
        api_calls_found: 56,
        hypotheses_count: 18,
        findings_count: 7,
        created_at: hourAgo,
        started_at: hourAgo,
    },
    {
        id: 'scan-002',
        target_id: 'target-002',
        target_url: 'https://api.securecorp.io',
        mode: 'active',
        status: 'completed',
        progress: 100,
        current_phase: 'Complete',
        routes_found: 89,
        forms_found: 12,
        params_found: 45,
        js_files_found: 18,
        api_calls_found: 67,
        hypotheses_count: 24,
        findings_count: 11,
        created_at: dayAgo,
        started_at: dayAgo,
        completed_at: new Date(Date.now() - 82800000).toISOString(),
    },
    {
        id: 'scan-003',
        target_id: 'target-003',
        target_url: 'https://portal.testshop.dev',
        mode: 'passive',
        status: 'completed',
        progress: 100,
        current_phase: 'Complete',
        routes_found: 56,
        forms_found: 8,
        params_found: 32,
        js_files_found: 12,
        api_calls_found: 28,
        hypotheses_count: 9,
        findings_count: 4,
        created_at: new Date(Date.now() - 172800000).toISOString(),
        started_at: new Date(Date.now() - 172800000).toISOString(),
        completed_at: new Date(Date.now() - 169200000).toISOString(),
    },
];

export const mockRoutes: DiscoveredRoute[] = [
    {
        id: 'route-001', scan_id: 'scan-001', url: '/api/v1/users/{id}/profile',
        method: 'GET', status_code: 200, content_type: 'application/json',
        response_size: 2340, auth_required: true, functional_group: 'User Management',
        risk_level: 'high', has_forms: false, has_params: true, discovered_at: now,
    },
    {
        id: 'route-002', scan_id: 'scan-001', url: '/api/v1/users/{id}/settings',
        method: 'PUT', status_code: 200, content_type: 'application/json',
        response_size: 1200, auth_required: true, functional_group: 'User Management',
        risk_level: 'critical', has_forms: false, has_params: true, discovered_at: now,
    },
    {
        id: 'route-003', scan_id: 'scan-001', url: '/api/v1/orders',
        method: 'GET', status_code: 200, content_type: 'application/json',
        response_size: 8900, auth_required: true, functional_group: 'Order Processing',
        risk_level: 'medium', has_forms: false, has_params: true, discovered_at: now,
    },
    {
        id: 'route-004', scan_id: 'scan-001', url: '/api/v1/orders/{id}',
        method: 'GET', status_code: 200, content_type: 'application/json',
        response_size: 3400, auth_required: true, functional_group: 'Order Processing',
        risk_level: 'high', has_forms: false, has_params: true, discovered_at: now,
    },
    {
        id: 'route-005', scan_id: 'scan-001', url: '/login',
        method: 'POST', status_code: 200, content_type: 'text/html',
        response_size: 12000, auth_required: false, functional_group: 'Authentication',
        risk_level: 'medium', has_forms: true, has_params: true, discovered_at: now,
    },
    {
        id: 'route-006', scan_id: 'scan-001', url: '/api/v1/admin/users',
        method: 'GET', status_code: 200, content_type: 'application/json',
        response_size: 15000, auth_required: true, functional_group: 'Admin Panel',
        risk_level: 'critical', has_forms: false, has_params: true, discovered_at: now,
    },
    {
        id: 'route-007', scan_id: 'scan-001', url: '/api/v1/files/upload',
        method: 'POST', status_code: 200, content_type: 'application/json',
        response_size: 450, auth_required: true, functional_group: 'File Management',
        risk_level: 'high', has_forms: true, has_params: true, discovered_at: now,
    },
    {
        id: 'route-008', scan_id: 'scan-001', url: '/api/v1/search',
        method: 'GET', status_code: 200, content_type: 'application/json',
        response_size: 6700, auth_required: false, functional_group: 'Search',
        risk_level: 'medium', has_forms: false, has_params: true, discovered_at: now,
    },
];

export const mockForms: DiscoveredForm[] = [
    {
        id: 'form-001', route_id: 'route-005', action: '/login', method: 'POST',
        is_state_changing: true, has_csrf_token: true,
        fields: [
            { name: 'email', type: 'email', required: true, validation: null },
            { name: 'password', type: 'password', required: true, validation: null },
        ],
    },
    {
        id: 'form-002', route_id: 'route-007', action: '/api/v1/files/upload', method: 'POST',
        is_state_changing: true, has_csrf_token: false,
        fields: [
            { name: 'file', type: 'file', required: true, validation: null },
            { name: 'description', type: 'text', required: false, validation: null },
        ],
    },
];

export const mockParameters: DiscoveredParameter[] = [
    { id: 'p-001', route_id: 'route-001', name: 'id', location: 'path', param_type: 'integer', sample_value: '42', is_sensitive: true },
    { id: 'p-002', route_id: 'route-003', name: 'page', location: 'query', param_type: 'integer', sample_value: '1', is_sensitive: false },
    { id: 'p-003', route_id: 'route-003', name: 'status', location: 'query', param_type: 'string', sample_value: 'active', is_sensitive: false },
    { id: 'p-004', route_id: 'route-008', name: 'q', location: 'query', param_type: 'string', sample_value: 'test', is_sensitive: false },
    { id: 'p-005', route_id: 'route-002', name: 'email', location: 'body', param_type: 'string', sample_value: 'user@test.com', is_sensitive: true },
    { id: 'p-006', route_id: 'route-006', name: 'role', location: 'query', param_type: 'string', sample_value: 'admin', is_sensitive: true },
];

export const mockJSFiles: DiscoveredJSFile[] = [
    { id: 'js-001', scan_id: 'scan-001', url: '/static/js/app.bundle.js', size: 245000, has_api_endpoints: true, has_sensitive_data: false, endpoints_found: ['/api/v1/users', '/api/v1/orders'] },
    { id: 'js-002', scan_id: 'scan-001', url: '/static/js/admin.chunk.js', size: 89000, has_api_endpoints: true, has_sensitive_data: true, endpoints_found: ['/api/v1/admin/users', '/api/v1/admin/config'] },
    { id: 'js-003', scan_id: 'scan-001', url: '/static/js/vendor.js', size: 560000, has_api_endpoints: false, has_sensitive_data: false, endpoints_found: [] },
];

export const mockAPICalls: APICall[] = [
    { id: 'api-001', scan_id: 'scan-001', url: '/api/v1/users/me', method: 'GET', source: 'js-001', auth_header: true },
    { id: 'api-002', scan_id: 'scan-001', url: '/api/v1/orders', method: 'GET', source: 'js-001', auth_header: true },
    { id: 'api-003', scan_id: 'scan-001', url: '/api/v1/admin/config', method: 'GET', source: 'js-002', auth_header: true },
    { id: 'api-004', scan_id: 'scan-001', url: '/api/v1/admin/users', method: 'DELETE', source: 'js-002', auth_header: true },
];

export const mockSurfaceStats: SurfaceStats = {
    total_routes: 142,
    total_forms: 23,
    total_params: 87,
    total_js_files: 34,
    total_api_calls: 56,
    auth_routes: 98,
    state_changing_routes: 34,
    high_risk_routes: 18,
};

export const mockFindings: Finding[] = [
    {
        id: 'finding-001', scan_id: 'scan-001', hypothesis_id: 'hyp-001',
        title: 'Broken Object-Level Authorization on User Profiles',
        category: 'Authorization', severity: 'critical', confidence: 'high',
        status: 'verified', affected_route: '/api/v1/users/{id}/profile',
        description: 'The user profile endpoint allows accessing any user\'s profile by changing the ID parameter. No server-side authorization check validates that the authenticated user owns the requested profile.',
        ai_reasoning: 'During analysis, requests to /api/v1/users/42/profile and /api/v1/users/43/profile both returned 200 OK with different user data while using the same authentication token. This indicates the endpoint relies solely on the path parameter for data retrieval without verifying resource ownership.',
        remediation: 'Implement server-side authorization checks to verify the authenticated user has permission to access the requested resource. Compare the authenticated user\'s ID with the requested resource owner before returning data.',
        evidence_count: 3, created_at: now,
    },
    {
        id: 'finding-002', scan_id: 'scan-001', hypothesis_id: 'hyp-002',
        title: 'Missing CSRF Protection on File Upload',
        category: 'Session Integrity', severity: 'high', confidence: 'high',
        status: 'verified', affected_route: '/api/v1/files/upload',
        description: 'The file upload endpoint accepts POST requests without CSRF token validation. A state-changing operation without CSRF protection can be exploited through cross-site request forgery.',
        ai_reasoning: 'Form analysis revealed the upload form at /api/v1/files/upload lacks a CSRF token field. Verification confirmed the endpoint accepts requests without any anti-CSRF header or cookie validation.',
        remediation: 'Implement CSRF token validation for all state-changing endpoints. Use the Synchronizer Token Pattern or Double Submit Cookie pattern.',
        evidence_count: 2, created_at: now,
    },
    {
        id: 'finding-003', scan_id: 'scan-001', hypothesis_id: 'hyp-003',
        title: 'Reflected Input in Search Results',
        category: 'Input Validation', severity: 'medium', confidence: 'medium',
        status: 'verified', affected_route: '/api/v1/search?q=',
        description: 'The search endpoint reflects user input directly in the response body without proper encoding. While the content type is application/json, downstream consumers may render this unsafely.',
        ai_reasoning: 'Submitting special characters in the search query parameter showed they were reflected verbatim in the JSON response. Although the JSON content type provides some protection, this could be exploited if the response is rendered in HTML context by client-side code.',
        remediation: 'Sanitize and encode all user input before including it in responses. Implement Content Security Policy headers and ensure client-side rendering properly escapes output.',
        evidence_count: 2, created_at: now,
    },
    {
        id: 'finding-004', scan_id: 'scan-001', hypothesis_id: 'hyp-004',
        title: 'Admin Endpoint Accessible with Regular User Token',
        category: 'Authorization', severity: 'critical', confidence: 'high',
        status: 'verified', affected_route: '/api/v1/admin/users',
        description: 'Administrative endpoints under /api/v1/admin/ are accessible with a regular user authentication token. The server does not enforce role-based access control.',
        ai_reasoning: 'Requests to /api/v1/admin/users using a regular user bearer token returned 200 OK with full user listing including admin accounts. This represents a complete failure of vertical authorization controls.',
        remediation: 'Implement role-based access control (RBAC) middleware that validates user roles before granting access to administrative endpoints. Ensure admin endpoints require elevated privileges.',
        evidence_count: 4, created_at: now,
    },
    {
        id: 'finding-005', scan_id: 'scan-001', hypothesis_id: 'hyp-005',
        title: 'Order Data Accessible Across User Boundaries',
        category: 'Object Access', severity: 'high', confidence: 'medium',
        status: 'suspicious', affected_route: '/api/v1/orders/{id}',
        description: 'The order detail endpoint may allow users to access order data belonging to other users by manipulating the order ID parameter.',
        ai_reasoning: 'Sequential order ID enumeration revealed that some IDs return data while the authenticated user only has a subset of orders. Further verification needed to confirm if returned orders belong to other users.',
        remediation: 'Ensure order detail endpoints validate that the authenticated user is the owner of the requested order before returning data.',
        evidence_count: 2, created_at: now,
    },
];

export const mockHypotheses: Hypothesis[] = [
    {
        id: 'hyp-001', scan_id: 'scan-001', category: 'Authorization',
        title: 'Potential BOLA on User Profile Endpoint',
        description: 'The /api/v1/users/{id}/profile endpoint accepts arbitrary user IDs. If no ownership check is enforced, it may expose horizontal privilege escalation.',
        affected_routes: ['/api/v1/users/{id}/profile'], severity: 'critical', confidence: 'high',
        ai_reasoning: 'Pattern analysis: directly accessible resource with user-controlled ID parameter, no visible ownership validation in response patterns.',
        status: 'verified', created_at: now,
    },
    {
        id: 'hyp-006', scan_id: 'scan-001', category: 'Trust Boundary',
        title: 'Sensitive Configuration Endpoint Exposed',
        description: 'The /api/v1/admin/config endpoint appears in client-side JavaScript bundle, suggesting it may be unintentionally exposed to non-admin users.',
        affected_routes: ['/api/v1/admin/config'], severity: 'high', confidence: 'low',
        ai_reasoning: 'Endpoint discovered in admin.chunk.js bundle which is loaded by non-admin pages. If RBAC is not enforced, this could leak server configuration.',
        status: 'hypothesis', created_at: now,
    },
    {
        id: 'hyp-007', scan_id: 'scan-001', category: 'State Transition',
        title: 'Order Status Change Without Validation',
        description: 'PUT /api/v1/orders/{id}/status allows status transitions that may bypass business logic constraints (e.g., cancelling a shipped order).',
        affected_routes: ['/api/v1/orders/{id}/status'], severity: 'medium', confidence: 'medium',
        ai_reasoning: 'State-changing endpoint accepts arbitrary status values. Business logic validation for valid state transitions may be missing.',
        status: 'hypothesis', created_at: now,
    },
];

export const mockEvidence: Evidence[] = [
    {
        id: 'ev-001', finding_id: 'finding-001', type: 'request',
        title: 'Request as User A to User B Profile',
        description: 'Authenticated as User A (ID: 42), requesting User B (ID: 43) profile data.',
        request_data: {
            method: 'GET',
            url: 'https://app.example.com/api/v1/users/43/profile',
            headers: {
                'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIs...user_42_token',
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
        },
        response_data: {
            status_code: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id: 43,
                name: "Jane Smith",
                email: "jane.smith@example.com",
                role: "user",
                created_at: "2024-01-15T10:30:00Z"
            }, null, 2),
            response_time_ms: 45,
        },
        created_at: now,
    },
    {
        id: 'ev-002', finding_id: 'finding-001', type: 'response',
        title: 'Successful Unauthorized Data Access',
        description: 'Server returned User B\'s complete profile data to User A without authorization check.',
        response_data: {
            status_code: 200,
            headers: { 'Content-Type': 'application/json', 'X-Request-Id': 'req_abc123' },
            body: JSON.stringify({
                id: 43,
                name: "Jane Smith",
                email: "jane.smith@example.com",
                phone: "+1-555-0123",
                address: "123 Main St, Springfield",
                role: "user",
                permissions: ["read", "write"],
                created_at: "2024-01-15T10:30:00Z"
            }, null, 2),
            response_time_ms: 45,
        },
        created_at: now,
    },
    {
        id: 'ev-003', finding_id: 'finding-001', type: 'diff',
        title: 'Response Comparison: Own Profile vs Other User',
        description: 'Diff between requesting own profile (authorized) and another user\'s profile (unauthorized). Both return identical response structures with different user data.',
        diff_content: `--- Own Profile (User 42)
+++ Other User Profile (User 43)
@@ -1,7 +1,7 @@
 {
-  "id": 42,
-  "name": "John Doe",
-  "email": "john.doe@example.com",
+  "id": 43,
+  "name": "Jane Smith",
+  "email": "jane.smith@example.com",
   "role": "user",
-  "created_at": "2024-01-10T08:00:00Z"
+  "created_at": "2024-01-15T10:30:00Z"
 }`,
        created_at: now,
    },
];

export const mockScanEvents: ScanEvent[] = [
    { id: 'evt-001', timestamp: new Date(Date.now() - 3500000).toISOString(), phase: 'init', type: 'info', message: 'Scan initialized for target: https://app.example.com' },
    { id: 'evt-002', timestamp: new Date(Date.now() - 3490000).toISOString(), phase: 'init', type: 'info', message: 'Authentication configured — session cookie mode' },
    { id: 'evt-003', timestamp: new Date(Date.now() - 3400000).toISOString(), phase: 'crawl', type: 'info', message: 'Starting crawler with depth=3, max_pages=500' },
    { id: 'evt-004', timestamp: new Date(Date.now() - 3300000).toISOString(), phase: 'crawl', type: 'success', message: 'Discovered 23 routes in first pass' },
    { id: 'evt-005', timestamp: new Date(Date.now() - 3200000).toISOString(), phase: 'crawl', type: 'info', message: 'Parsing JavaScript bundles for API endpoints...' },
    { id: 'evt-006', timestamp: new Date(Date.now() - 3100000).toISOString(), phase: 'crawl', type: 'success', message: 'Extracted 12 API endpoints from app.bundle.js' },
    { id: 'evt-007', timestamp: new Date(Date.now() - 3000000).toISOString(), phase: 'crawl', type: 'warning', message: 'Admin JavaScript bundle detected — admin.chunk.js loaded on public page' },
    { id: 'evt-008', timestamp: new Date(Date.now() - 2800000).toISOString(), phase: 'parse', type: 'info', message: 'Parsing forms and input parameters...' },
    { id: 'evt-009', timestamp: new Date(Date.now() - 2700000).toISOString(), phase: 'parse', type: 'warning', message: 'File upload form missing CSRF token at /api/v1/files/upload' },
    { id: 'evt-010', timestamp: new Date(Date.now() - 2500000).toISOString(), phase: 'analyze', type: 'ai', message: '[AI] Analyzing authorization patterns across 142 routes...' },
    { id: 'evt-011', timestamp: new Date(Date.now() - 2300000).toISOString(), phase: 'analyze', type: 'ai', message: '[AI] Hypothesis generated: Potential BOLA on /api/v1/users/{id}/profile' },
    { id: 'evt-012', timestamp: new Date(Date.now() - 2100000).toISOString(), phase: 'analyze', type: 'ai', message: '[AI] Hypothesis generated: Missing CSRF on state-changing endpoint' },
    { id: 'evt-013', timestamp: new Date(Date.now() - 1900000).toISOString(), phase: 'analyze', type: 'ai', message: '[AI] Classifying endpoints into functional groups...' },
    { id: 'evt-014', timestamp: new Date(Date.now() - 1700000).toISOString(), phase: 'verify', type: 'info', message: 'Verification engine: testing 18 hypotheses...' },
    { id: 'evt-015', timestamp: new Date(Date.now() - 1500000).toISOString(), phase: 'verify', type: 'success', message: 'VERIFIED: BOLA on user profile endpoint — evidence collected' },
    { id: 'evt-016', timestamp: new Date(Date.now() - 1300000).toISOString(), phase: 'verify', type: 'success', message: 'VERIFIED: Admin endpoint accessible with regular token' },
    { id: 'evt-017', timestamp: new Date(Date.now() - 1100000).toISOString(), phase: 'verify', type: 'error', message: 'CRITICAL: 2 critical findings confirmed' },
    { id: 'evt-018', timestamp: new Date(Date.now() - 900000).toISOString(), phase: 'verify', type: 'info', message: 'Verification complete: 5 verified, 2 suspicious, 11 unconfirmed' },
];

export const mockReports: Report[] = [
    {
        id: 'rpt-001', scan_id: 'scan-002', title: 'Security Assessment — api.securecorp.io',
        target_url: 'https://api.securecorp.io', summary: 'Comprehensive security assessment revealing 11 findings across authorization, input validation, and session management categories.',
        total_findings: 11, critical_count: 3, high_count: 4, medium_count: 3, low_count: 1, info_count: 0,
        generated_at: dayAgo, format: 'json',
    },
    {
        id: 'rpt-002', scan_id: 'scan-003', title: 'Security Assessment — portal.testshop.dev',
        target_url: 'https://portal.testshop.dev', summary: 'Assessment of the test shop portal identified 4 findings with focus on authentication and object access control.',
        total_findings: 4, critical_count: 0, high_count: 2, medium_count: 1, low_count: 1, info_count: 0,
        generated_at: new Date(Date.now() - 169200000).toISOString(), format: 'json',
    },
];
