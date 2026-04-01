"""
Seed service: Populates the database with realistic mock data for demo purposes.
"""
import json
from datetime import datetime, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.models.models import (
    Target, ScanJob, DiscoveredRoute, DiscoveredForm, DiscoveredParameter,
    DiscoveredJSFile, APICall, Hypothesis, Finding, EvidenceItem, ScanEvent, Report
)


async def is_seeded(db: AsyncSession) -> bool:
    result = await db.execute(select(func.count()).select_from(ScanJob))
    count = result.scalar()
    return count > 0


async def seed_database(db: AsyncSession):
    if await is_seeded(db):
        return

    now = datetime.utcnow()
    hour_ago = now - timedelta(hours=1)
    day_ago = now - timedelta(days=1)
    two_days_ago = now - timedelta(days=2)

    # --- Targets ---
    t1 = Target(id="target-001", url="https://app.example.com", domain="app.example.com", created_at=hour_ago)
    t2 = Target(id="target-002", url="https://api.securecorp.io", domain="api.securecorp.io", created_at=day_ago)
    t3 = Target(id="target-003", url="https://portal.testshop.dev", domain="portal.testshop.dev", created_at=two_days_ago)
    db.add_all([t1, t2, t3])

    # --- Scan Jobs ---
    s1 = ScanJob(
        id="scan-001", target_id="target-001", mode="authenticated", status="completed",
        progress=100, current_phase="Complete", routes_found=142, forms_found=23,
        params_found=87, js_files_found=34, api_calls_found=56, hypotheses_count=18,
        findings_count=7, created_at=hour_ago, started_at=hour_ago,
        completed_at=now,
    )
    s2 = ScanJob(
        id="scan-002", target_id="target-002", mode="active", status="completed",
        progress=100, current_phase="Complete", routes_found=89, forms_found=12,
        params_found=45, js_files_found=18, api_calls_found=67, hypotheses_count=24,
        findings_count=11, created_at=day_ago, started_at=day_ago,
        completed_at=day_ago + timedelta(hours=1),
    )
    s3 = ScanJob(
        id="scan-003", target_id="target-003", mode="passive", status="completed",
        progress=100, current_phase="Complete", routes_found=56, forms_found=8,
        params_found=32, js_files_found=12, api_calls_found=28, hypotheses_count=9,
        findings_count=4, created_at=two_days_ago, started_at=two_days_ago,
        completed_at=two_days_ago + timedelta(hours=1),
    )
    db.add_all([s1, s2, s3])

    # --- Discovered Routes ---
    routes_data = [
        ("route-001", "scan-001", "/api/v1/users/{id}/profile", "GET", 200, "application/json", 2340, True, "User Management", "high"),
        ("route-002", "scan-001", "/api/v1/users/{id}/settings", "PUT", 200, "application/json", 1200, True, "User Management", "critical"),
        ("route-003", "scan-001", "/api/v1/orders", "GET", 200, "application/json", 8900, True, "Order Processing", "medium"),
        ("route-004", "scan-001", "/api/v1/orders/{id}", "GET", 200, "application/json", 3400, True, "Order Processing", "high"),
        ("route-005", "scan-001", "/login", "POST", 200, "text/html", 12000, False, "Authentication", "medium"),
        ("route-006", "scan-001", "/api/v1/admin/users", "GET", 200, "application/json", 15000, True, "Admin Panel", "critical"),
        ("route-007", "scan-001", "/api/v1/files/upload", "POST", 200, "application/json", 450, True, "File Management", "high"),
        ("route-008", "scan-001", "/api/v1/search", "GET", 200, "application/json", 6700, False, "Search", "medium"),
    ]
    for rd in routes_data:
        r = DiscoveredRoute(
            id=rd[0], scan_id=rd[1], url=rd[2], method=rd[3], status_code=rd[4],
            content_type=rd[5], response_size=rd[6], auth_required=rd[7],
            functional_group=rd[8], risk_level=rd[9],
            has_forms=rd[2] in ["/login", "/api/v1/files/upload"],
            has_params=True, discovered_at=now,
        )
        db.add(r)

    # --- Forms ---
    f1 = DiscoveredForm(
        id="form-001", route_id="route-005", action="/login", method="POST",
        fields=[{"name": "email", "type": "email", "required": True, "validation": None},
                {"name": "password", "type": "password", "required": True, "validation": None}],
        is_state_changing=True, has_csrf_token=True,
    )
    f2 = DiscoveredForm(
        id="form-002", route_id="route-007", action="/api/v1/files/upload", method="POST",
        fields=[{"name": "file", "type": "file", "required": True, "validation": None},
                {"name": "description", "type": "text", "required": False, "validation": None}],
        is_state_changing=True, has_csrf_token=False,
    )
    db.add_all([f1, f2])

    # --- Parameters ---
    params_data = [
        ("p-001", "route-001", "id", "path", "integer", "42", True),
        ("p-002", "route-003", "page", "query", "integer", "1", False),
        ("p-003", "route-003", "status", "query", "string", "active", False),
        ("p-004", "route-008", "q", "query", "string", "test", False),
        ("p-005", "route-002", "email", "body", "string", "user@test.com", True),
        ("p-006", "route-006", "role", "query", "string", "admin", True),
    ]
    for pd in params_data:
        db.add(DiscoveredParameter(
            id=pd[0], route_id=pd[1], name=pd[2], location=pd[3],
            param_type=pd[4], sample_value=pd[5], is_sensitive=pd[6],
        ))

    # --- JS Files ---
    db.add_all([
        DiscoveredJSFile(id="js-001", scan_id="scan-001", url="/static/js/app.bundle.js", size=245000, has_api_endpoints=True, has_sensitive_data=False, endpoints_found=["/api/v1/users", "/api/v1/orders"]),
        DiscoveredJSFile(id="js-002", scan_id="scan-001", url="/static/js/admin.chunk.js", size=89000, has_api_endpoints=True, has_sensitive_data=True, endpoints_found=["/api/v1/admin/users", "/api/v1/admin/config"]),
        DiscoveredJSFile(id="js-003", scan_id="scan-001", url="/static/js/vendor.js", size=560000, has_api_endpoints=False, has_sensitive_data=False, endpoints_found=[]),
    ])

    # --- API Calls ---
    db.add_all([
        APICall(id="api-001", scan_id="scan-001", url="/api/v1/users/me", method="GET", source="js-001", auth_header=True),
        APICall(id="api-002", scan_id="scan-001", url="/api/v1/orders", method="GET", source="js-001", auth_header=True),
        APICall(id="api-003", scan_id="scan-001", url="/api/v1/admin/config", method="GET", source="js-002", auth_header=True),
        APICall(id="api-004", scan_id="scan-001", url="/api/v1/admin/users", method="DELETE", source="js-002", auth_header=True),
    ])

    # --- Hypotheses ---
    hyp1 = Hypothesis(
        id="hyp-001", scan_id="scan-001", category="Authorization",
        title="Potential BOLA on User Profile Endpoint",
        description="The /api/v1/users/{id}/profile endpoint accepts arbitrary user IDs.",
        affected_routes=["/api/v1/users/{id}/profile"], severity="critical", confidence="high",
        ai_reasoning="Pattern analysis: directly accessible resource with user-controlled ID parameter.",
        status="verified", created_at=now,
    )
    hyp6 = Hypothesis(
        id="hyp-006", scan_id="scan-001", category="Trust Boundary",
        title="Sensitive Configuration Endpoint Exposed",
        description="The /api/v1/admin/config endpoint appears in client-side JavaScript bundle.",
        affected_routes=["/api/v1/admin/config"], severity="high", confidence="low",
        ai_reasoning="Endpoint discovered in admin.chunk.js bundle loaded by non-admin pages.",
        status="hypothesis", created_at=now,
    )
    hyp7 = Hypothesis(
        id="hyp-007", scan_id="scan-001", category="State Transition",
        title="Order Status Change Without Validation",
        description="PUT /api/v1/orders/{id}/status allows status transitions that may bypass business logic.",
        affected_routes=["/api/v1/orders/{id}/status"], severity="medium", confidence="medium",
        ai_reasoning="State-changing endpoint accepts arbitrary status values.",
        status="hypothesis", created_at=now,
    )
    db.add_all([hyp1, hyp6, hyp7])

    # --- Findings ---
    findings_data = [
        ("finding-001", "scan-001", "hyp-001", "Broken Object-Level Authorization on User Profiles", "Authorization", "critical", "high", "verified", "/api/v1/users/{id}/profile",
         "The user profile endpoint allows accessing any user's profile by changing the ID parameter.",
         "Requests to /api/v1/users/42/profile and /api/v1/users/43/profile both returned 200 OK with different user data using the same token.",
         "Implement server-side authorization checks to verify the authenticated user has permission to access the requested resource.", 3),
        ("finding-002", "scan-001", "hyp-001", "Missing CSRF Protection on File Upload", "Session Integrity", "high", "high", "verified", "/api/v1/files/upload",
         "The file upload endpoint accepts POST requests without CSRF token validation.",
         "Form analysis revealed the upload form lacks a CSRF token field.",
         "Implement CSRF token validation for all state-changing endpoints.", 2),
        ("finding-003", "scan-001", "hyp-001", "Reflected Input in Search Results", "Input Validation", "medium", "medium", "verified", "/api/v1/search?q=",
         "The search endpoint reflects user input directly in the response body without proper encoding.",
         "Special characters in the search query are reflected verbatim in the JSON response.",
         "Sanitize and encode all user input before including it in responses.", 2),
        ("finding-004", "scan-001", "hyp-001", "Admin Endpoint Accessible with Regular User Token", "Authorization", "critical", "high", "verified", "/api/v1/admin/users",
         "Administrative endpoints are accessible with a regular user authentication token.",
         "Requests to /api/v1/admin/users using a regular user token returned 200 OK with full user listing.",
         "Implement role-based access control (RBAC) middleware.", 4),
        ("finding-005", "scan-001", "hyp-001", "Order Data Accessible Across User Boundaries", "Object Access", "high", "medium", "suspicious", "/api/v1/orders/{id}",
         "The order detail endpoint may allow users to access order data belonging to other users.",
         "Sequential order ID enumeration revealed some IDs return data for other users.",
         "Ensure order detail endpoints validate ownership.", 2),
    ]
    for fd in findings_data:
        db.add(Finding(
            id=fd[0], scan_id=fd[1], hypothesis_id=fd[2], title=fd[3], category=fd[4],
            severity=fd[5], confidence=fd[6], status=fd[7], affected_route=fd[8],
            description=fd[9], ai_reasoning=fd[10], remediation=fd[11], evidence_count=fd[12],
            created_at=now,
        ))

    # --- Evidence ---
    ev1 = EvidenceItem(
        id="ev-001", finding_id="finding-001", type="request",
        title="Request as User A to User B Profile",
        description="Authenticated as User A (ID: 42), requesting User B (ID: 43) profile data.",
        request_data={
            "method": "GET", "url": "https://app.example.com/api/v1/users/43/profile",
            "headers": {"Authorization": "Bearer eyJhbG...user_42_token", "Content-Type": "application/json"},
        },
        response_data={
            "status_code": 200, "headers": {"Content-Type": "application/json"},
            "body": json.dumps({"id": 43, "name": "Jane Smith", "email": "jane.smith@example.com", "role": "user"}, indent=2),
            "response_time_ms": 45,
        },
        created_at=now,
    )
    ev2 = EvidenceItem(
        id="ev-002", finding_id="finding-001", type="response",
        title="Successful Unauthorized Data Access",
        description="Server returned User B's complete profile data to User A.",
        response_data={
            "status_code": 200, "headers": {"Content-Type": "application/json"},
            "body": json.dumps({"id": 43, "name": "Jane Smith", "email": "jane.smith@example.com", "phone": "+1-555-0123", "role": "user"}, indent=2),
            "response_time_ms": 45,
        },
        created_at=now,
    )
    ev3 = EvidenceItem(
        id="ev-003", finding_id="finding-001", type="diff",
        title="Response Comparison: Own Profile vs Other User",
        description="Diff between requesting own profile and another user's profile.",
        diff_content="""--- Own Profile (User 42)
+++ Other User Profile (User 43)
@@ -1,5 +1,5 @@
 {
-  "id": 42,
-  "name": "John Doe",
-  "email": "john.doe@example.com",
+  "id": 43,
+  "name": "Jane Smith",
+  "email": "jane.smith@example.com",
   "role": "user"
 }""",
        created_at=now,
    )
    db.add_all([ev1, ev2, ev3])

    # --- Scan Events ---
    event_messages = [
        (-3500, "init", "info", "Scan initialized for target: https://app.example.com"),
        (-3490, "init", "info", "Authentication configured — session cookie mode"),
        (-3400, "crawl", "info", "Starting crawler with depth=3, max_pages=500"),
        (-3300, "crawl", "success", "Discovered 23 routes in first pass"),
        (-3200, "crawl", "info", "Parsing JavaScript bundles for API endpoints..."),
        (-3100, "crawl", "success", "Extracted 12 API endpoints from app.bundle.js"),
        (-3000, "crawl", "warning", "Admin JavaScript bundle detected — admin.chunk.js loaded on public page"),
        (-2800, "parse", "info", "Parsing forms and input parameters..."),
        (-2700, "parse", "warning", "File upload form missing CSRF token at /api/v1/files/upload"),
        (-2500, "analyze", "ai", "[AI] Analyzing authorization patterns across 142 routes..."),
        (-2300, "analyze", "ai", "[AI] Hypothesis generated: Potential BOLA on /api/v1/users/{id}/profile"),
        (-2100, "analyze", "ai", "[AI] Hypothesis generated: Missing CSRF on state-changing endpoint"),
        (-1900, "analyze", "ai", "[AI] Classifying endpoints into functional groups..."),
        (-1700, "verify", "info", "Verification engine: testing 18 hypotheses..."),
        (-1500, "verify", "success", "VERIFIED: BOLA on user profile endpoint — evidence collected"),
        (-1300, "verify", "success", "VERIFIED: Admin endpoint accessible with regular token"),
        (-1100, "verify", "error", "CRITICAL: 2 critical findings confirmed"),
        (-900, "verify", "info", "Verification complete: 5 verified, 2 suspicious, 11 unconfirmed"),
    ]
    for i, (offset, phase, etype, msg) in enumerate(event_messages):
        db.add(ScanEvent(
            id=f"evt-{i+1:03d}", scan_id="scan-001",
            timestamp=now + timedelta(seconds=offset), phase=phase, type=etype, message=msg,
        ))

    # --- Reports ---
    db.add_all([
        Report(
            id="rpt-001", scan_id="scan-002", title="Security Assessment — api.securecorp.io",
            target_url="https://api.securecorp.io",
            summary="Comprehensive security assessment revealing 11 findings.",
            total_findings=11, critical_count=3, high_count=4, medium_count=3, low_count=1, info_count=0,
            generated_at=day_ago, format="json",
        ),
        Report(
            id="rpt-002", scan_id="scan-003", title="Security Assessment — portal.testshop.dev",
            target_url="https://portal.testshop.dev",
            summary="Assessment identified 4 findings with focus on auth and access control.",
            total_findings=4, critical_count=0, high_count=2, medium_count=1, low_count=1, info_count=0,
            generated_at=two_days_ago, format="json",
        ),
    ])

    await db.commit()
    print("[SEED] Database seeded with demo data.")
