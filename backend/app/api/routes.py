"""
API routes for BlackScanner.
"""
from datetime import datetime
from urllib.parse import urlparse
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from fastapi.responses import JSONResponse, HTMLResponse, Response
from fpdf import FPDF
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.models.models import (
    Target, ScanJob, DiscoveredRoute, DiscoveredForm, DiscoveredParameter,
    DiscoveredJSFile, APICall, Hypothesis, Finding, EvidenceItem, ScanEvent, Report,
    generate_id,
)
from app.workers.scan_worker import run_scan_pipeline
from app.schemas.schemas import (
    ScanCreateRequest, ReportGenerateRequest,
    ScanJobResponse, ScanListResponse, SurfaceResponse, SurfaceStatsResponse,
    RouteResponse, FormResponse, ParameterResponse, JSFileResponse, APICallResponse,
    HypothesisResponse, FindingResponse, FindingDetailResponse, EvidenceResponse,
    ScanEventResponse, ReportResponse, DashboardStatsResponse,
)

router = APIRouter(prefix="/api/v1")


def _dt(d) -> str:
    if d is None:
        return None
    if isinstance(d, datetime):
        return d.isoformat()
    return str(d)


# ============================================================
# Dashboard
# ============================================================

@router.get("/dashboard/stats", response_model=DashboardStatsResponse)
async def get_dashboard_stats(db: AsyncSession = Depends(get_db)):
    total_scans = (await db.execute(select(func.count()).select_from(ScanJob))).scalar() or 0
    active_scans = (await db.execute(
        select(func.count()).select_from(ScanJob).where(
            ScanJob.status.in_(["pending", "crawling", "parsing", "analyzing", "verifying"])
        )
    )).scalar() or 0
    total_findings = (await db.execute(select(func.count()).select_from(Finding))).scalar() or 0
    critical_findings = (await db.execute(
        select(func.count()).select_from(Finding).where(Finding.severity == "critical")
    )).scalar() or 0

    from datetime import date
    today_start = datetime.combine(date.today(), datetime.min.time())
    scans_today = (await db.execute(
        select(func.count()).select_from(ScanJob).where(ScanJob.created_at >= today_start)
    )).scalar() or 0

    return DashboardStatsResponse(
        total_scans=total_scans, active_scans=active_scans,
        total_findings=total_findings, critical_findings=critical_findings,
        scans_today=scans_today,
    )


# ============================================================
# Scans
# ============================================================

@router.post("/scans")
async def create_scan(req: ScanCreateRequest, background_tasks: BackgroundTasks, db: AsyncSession = Depends(get_db)):
    parsed = urlparse(req.target_url)
    domain = parsed.netloc or parsed.path

    # Find or create target
    result = await db.execute(select(Target).where(Target.url == req.target_url))
    target = result.scalar_one_or_none()
    if not target:
        target = Target(id=generate_id(), url=req.target_url, domain=domain)
        db.add(target)

    scan = ScanJob(
        id=generate_id(), target_id=target.id, mode=req.mode,
        status="pending", progress=0, current_phase="Initializing",
        auth_cookie=req.auth_config.get("cookie") if req.auth_config else None,
        auth_header=req.auth_config.get("header") if req.auth_config else None,
    )
    db.add(scan)
    await db.commit()

    # Trigger background scan
    background_tasks.add_task(run_scan_pipeline, scan.id)

    return {"id": scan.id, "status": scan.status}


@router.get("/scans", response_model=ScanListResponse)
async def list_scans(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(ScanJob).order_by(ScanJob.created_at.desc()).limit(50)
    )
    scans = result.scalars().all()

    scan_responses = []
    for s in scans:
        # Get target URL
        t_result = await db.execute(select(Target).where(Target.id == s.target_id))
        target = t_result.scalar_one_or_none()
        scan_responses.append(ScanJobResponse(
            id=s.id, target_id=s.target_id, target_url=target.url if target else "",
            mode=s.mode, status=s.status, progress=s.progress,
            current_phase=s.current_phase, routes_found=s.routes_found,
            forms_found=s.forms_found, params_found=s.params_found,
            js_files_found=s.js_files_found, api_calls_found=s.api_calls_found,
            hypotheses_count=s.hypotheses_count, findings_count=s.findings_count,
            created_at=_dt(s.created_at), started_at=_dt(s.started_at),
            completed_at=_dt(s.completed_at), error_message=s.error_message,
        ))

    return ScanListResponse(scans=scan_responses)


@router.get("/scans/{scan_id}")
async def get_scan(scan_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(ScanJob).where(ScanJob.id == scan_id))
    scan = result.scalar_one_or_none()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")

    t_result = await db.execute(select(Target).where(Target.id == scan.target_id))
    target = t_result.scalar_one_or_none()

    return ScanJobResponse(
        id=scan.id, target_id=scan.target_id, target_url=target.url if target else "",
        mode=scan.mode, status=scan.status, progress=scan.progress,
        current_phase=scan.current_phase, routes_found=scan.routes_found,
        forms_found=scan.forms_found, params_found=scan.params_found,
        js_files_found=scan.js_files_found, api_calls_found=scan.api_calls_found,
        hypotheses_count=scan.hypotheses_count, findings_count=scan.findings_count,
        created_at=_dt(scan.created_at), started_at=_dt(scan.started_at),
        completed_at=_dt(scan.completed_at), error_message=scan.error_message,
    )


@router.post("/scans/{scan_id}/cancel")
async def cancel_scan(scan_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(ScanJob).where(ScanJob.id == scan_id))
    scan = result.scalar_one_or_none()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")
    scan.status = "cancelled"
    await db.commit()
    return {"status": "cancelled"}


@router.get("/scans/{scan_id}/events")
async def get_scan_events(scan_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(ScanEvent).where(ScanEvent.scan_id == scan_id).order_by(ScanEvent.timestamp)
    )
    events = result.scalars().all()
    return {"events": [
        ScanEventResponse(
            id=e.id, timestamp=_dt(e.timestamp), phase=e.phase, type=e.type, message=e.message,
        ) for e in events
    ]}


# ============================================================
# Surface Intelligence
# ============================================================

@router.get("/scans/{scan_id}/surface")
async def get_surface(scan_id: str, db: AsyncSession = Depends(get_db)):
    # Routes
    r_result = await db.execute(select(DiscoveredRoute).where(DiscoveredRoute.scan_id == scan_id))
    routes = r_result.scalars().all()

    # Get all route IDs for sub-queries
    route_ids = [r.id for r in routes]

    # Forms
    f_result = await db.execute(select(DiscoveredForm).where(DiscoveredForm.route_id.in_(route_ids))) if route_ids else None
    forms = f_result.scalars().all() if f_result else []

    # Parameters
    p_result = await db.execute(select(DiscoveredParameter).where(DiscoveredParameter.route_id.in_(route_ids))) if route_ids else None
    params = p_result.scalars().all() if p_result else []

    # JS Files
    js_result = await db.execute(select(DiscoveredJSFile).where(DiscoveredJSFile.scan_id == scan_id))
    js_files = js_result.scalars().all()

    # API Calls
    api_result = await db.execute(select(APICall).where(APICall.scan_id == scan_id))
    api_calls = api_result.scalars().all()

    # Stats
    auth_routes = sum(1 for r in routes if r.auth_required)
    state_changing = len(forms)
    high_risk = sum(1 for r in routes if r.risk_level in ["critical", "high"])

    return SurfaceResponse(
        routes=[RouteResponse(
            id=r.id, scan_id=r.scan_id, url=r.url, method=r.method,
            status_code=r.status_code, content_type=r.content_type,
            response_size=r.response_size, auth_required=r.auth_required,
            functional_group=r.functional_group, risk_level=r.risk_level,
            has_forms=r.has_forms, has_params=r.has_params, discovered_at=_dt(r.discovered_at),
        ) for r in routes],
        forms=[FormResponse(
            id=f.id, route_id=f.route_id, action=f.action, method=f.method,
            fields=f.fields or [], is_state_changing=f.is_state_changing,
            has_csrf_token=f.has_csrf_token,
        ) for f in forms],
        parameters=[ParameterResponse(
            id=p.id, route_id=p.route_id, name=p.name, location=p.location,
            param_type=p.param_type, sample_value=p.sample_value, is_sensitive=p.is_sensitive,
        ) for p in params],
        js_files=[JSFileResponse(
            id=j.id, scan_id=j.scan_id, url=j.url, size=j.size,
            has_api_endpoints=j.has_api_endpoints, has_sensitive_data=j.has_sensitive_data,
            endpoints_found=j.endpoints_found or [],
        ) for j in js_files],
        api_calls=[APICallResponse(
            id=a.id, scan_id=a.scan_id, url=a.url, method=a.method,
            source=a.source, auth_header=a.auth_header,
            request_body_schema=a.request_body_schema,
        ) for a in api_calls],
        stats=SurfaceStatsResponse(
            total_routes=len(routes), total_forms=len(forms), total_params=len(params),
            total_js_files=len(js_files), total_api_calls=len(api_calls),
            auth_routes=auth_routes, state_changing_routes=state_changing,
            high_risk_routes=high_risk,
        ),
    )


# ============================================================
# Hypotheses
# ============================================================

@router.get("/scans/{scan_id}/hypotheses")
async def get_hypotheses(scan_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Hypothesis).where(Hypothesis.scan_id == scan_id).order_by(Hypothesis.created_at.desc())
    )
    hypotheses = result.scalars().all()
    return {"hypotheses": [
        HypothesisResponse(
            id=h.id, scan_id=h.scan_id, category=h.category, title=h.title,
            description=h.description, affected_routes=h.affected_routes or [],
            severity=h.severity, confidence=h.confidence, ai_reasoning=h.ai_reasoning,
            status=h.status, created_at=_dt(h.created_at),
        ) for h in hypotheses
    ]}


# ============================================================
# Findings
# ============================================================

@router.get("/scans/{scan_id}/findings")
async def get_findings(scan_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Finding).where(Finding.scan_id == scan_id).order_by(Finding.created_at.desc())
    )
    findings = result.scalars().all()
    return {"findings": [
        FindingResponse(
            id=f.id, scan_id=f.scan_id, hypothesis_id=f.hypothesis_id or "",
            title=f.title, category=f.category, severity=f.severity,
            confidence=f.confidence, status=f.status, affected_route=f.affected_route,
            description=f.description, ai_reasoning=f.ai_reasoning,
            remediation=f.remediation, evidence_count=f.evidence_count,
            created_at=_dt(f.created_at),
        ) for f in findings
    ]}


@router.get("/findings/{finding_id}")
async def get_finding_detail(finding_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Finding).where(Finding.id == finding_id))
    finding = result.scalar_one_or_none()
    if not finding:
        raise HTTPException(status_code=404, detail="Finding not found")

    ev_result = await db.execute(
        select(EvidenceItem).where(EvidenceItem.finding_id == finding_id)
    )
    evidence = ev_result.scalars().all()

    return FindingDetailResponse(
        id=finding.id, scan_id=finding.scan_id, hypothesis_id=finding.hypothesis_id or "",
        title=finding.title, category=finding.category, severity=finding.severity,
        confidence=finding.confidence, status=finding.status,
        affected_route=finding.affected_route, description=finding.description,
        ai_reasoning=finding.ai_reasoning, remediation=finding.remediation,
        evidence_count=finding.evidence_count, created_at=_dt(finding.created_at),
        evidence=[EvidenceResponse(
            id=e.id, finding_id=e.finding_id, type=e.type, title=e.title,
            description=e.description, request_data=e.request_data,
            response_data=e.response_data, diff_content=e.diff_content,
            raw_content=e.raw_content, created_at=_dt(e.created_at),
        ) for e in evidence],
    )


# ============================================================
# Reports
# ============================================================

@router.get("/reports")
async def list_reports(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Report).order_by(Report.generated_at.desc()))
    reports = result.scalars().all()
    return {"reports": [
        ReportResponse(
            id=r.id, scan_id=r.scan_id, title=r.title, target_url=r.target_url,
            summary=r.summary, total_findings=r.total_findings,
            critical_count=r.critical_count, high_count=r.high_count,
            medium_count=r.medium_count, low_count=r.low_count, info_count=r.info_count,
            generated_at=_dt(r.generated_at), format=r.format,
        ) for r in reports
    ]}


@router.get("/reports/{report_id}")
async def get_report(report_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Report).where(Report.id == report_id))
    report = result.scalar_one_or_none()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    return ReportResponse(
        id=report.id, scan_id=report.scan_id, title=report.title,
        target_url=report.target_url, summary=report.summary,
        total_findings=report.total_findings, critical_count=report.critical_count,
        high_count=report.high_count, medium_count=report.medium_count,
        low_count=report.low_count, info_count=report.info_count,
        generated_at=_dt(report.generated_at), format=report.format,
    )


@router.post("/scans/{scan_id}/report")
async def generate_report(scan_id: str, req: ReportGenerateRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(ScanJob).where(ScanJob.id == scan_id))
    scan = result.scalar_one_or_none()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")

    t_result = await db.execute(select(Target).where(Target.id == scan.target_id))
    target = t_result.scalar_one_or_none()

    # Count findings by severity
    f_result = await db.execute(select(Finding).where(Finding.scan_id == scan_id))
    findings = f_result.scalars().all()

    report = Report(
        id=generate_id(), scan_id=scan_id,
        title=f"Security Assessment — {target.domain if target else 'Unknown'}",
        target_url=target.url if target else "",
        summary=f"Security assessment with {len(findings)} findings identified.",
        total_findings=len(findings),
        critical_count=sum(1 for f in findings if f.severity == "critical"),
        high_count=sum(1 for f in findings if f.severity == "high"),
        medium_count=sum(1 for f in findings if f.severity == "medium"),
        low_count=sum(1 for f in findings if f.severity == "low"),
        info_count=sum(1 for f in findings if f.severity == "info"),
        format=req.format,
    )
    db.add(report)
    await db.commit()

    return {"id": report.id}


@router.get("/reports/{report_id}/export")
async def export_report(report_id: str, format: str = "json", db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Report).where(Report.id == report_id))
    report = result.scalar_one_or_none()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    # Fetch findings for the report
    f_result = await db.execute(select(Finding).where(Finding.scan_id == report.scan_id))
    findings = f_result.scalars().all()

    data = {
        "id": report.id,
        "title": report.title,
        "target_url": report.target_url,
        "generated_at": report.generated_at.isoformat(),
        "summary": report.summary,
        "stats": {
            "total": report.total_findings,
            "critical": report.critical_count,
            "high": report.high_count,
            "medium": report.medium_count,
            "low": report.low_count,
            "info": report.info_count,
        },
        "findings": [
            {
                "title": f.title,
                "severity": f.severity,
                "category": f.category,
                "route": f.affected_route,
                "description": f.description,
                "remediation": f.remediation,
                "ai_reasoning": f.ai_reasoning,
            } for f in findings
        ]
    }

    if format == "html":
        # Generate a stylish HTML report
        findings_html = "".join([
            f"""
            <div class="finding {f['severity']}">
                <h3>{f['title']}</h3>
                <div class="meta">
                    <span class="badge {f['severity']}">{f['severity'].upper()}</span>
                    <span class="category">{f['category']}</span>
                    <span class="route">{f['route']}</span>
                </div>
                <div class="content">
                    <h4>Description</h4>
                    <p>{f['description'] or 'No description provided.'}</p>
                    <h4>AI Reasoning</h4>
                    <p>{f['ai_reasoning'] or 'N/A'}</p>
                    <h4>Remediation</h4>
                    <p>{f['remediation'] or 'N/A'}</p>
                </div>
            </div>
            """ for f in data["findings"]
        ])

        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <title>{report.title}</title>
            <style>
                :root {{
                    --bg: #05090f;
                    --surface: #0a1020;
                    --text: #e6f1ff;
                    --dim: #4a6080;
                    --cyan: #00ffb2;
                    --red: #ff3d5a;
                    --yellow: #ffd600;
                    --orange: #ff9d00;
                }}
                body {{ font-family: 'Inter', sans-serif; background: var(--bg); color: var(--text); padding: 40px; line-height: 1.6; }}
                h1 {{ color: var(--cyan); text-transform: uppercase; letter-spacing: 2px; }}
                .summary {{ background: var(--surface); padding: 20px; border-left: 4px solid var(--cyan); margin-bottom: 30px; }}
                .stats {{ display: flex; gap: 20px; margin-bottom: 40px; }}
                .stat-box {{ background: var(--surface); padding: 15px 25px; border: 1px solid var(--dim); min-width: 100px; text-align: center; }}
                .stat-box .val {{ font-size: 24px; font-weight: bold; display: block; }}
                .stat-box .label {{ font-size: 10px; color: var(--dim); text-transform: uppercase; }}
                .finding {{ background: var(--surface); padding: 25px; margin-bottom: 20px; border: 1px solid var(--dim); }}
                .finding.critical {{ border-left: 4px solid var(--red); }}
                .finding.high {{ border-left: 4px solid var(--orange); }}
                .finding.medium {{ border-left: 4px solid var(--yellow); }}
                .badge {{ font-size: 10px; padding: 2px 6px; border-radius: 3px; font-weight: bold; background: var(--dim); }}
                .badge.critical {{ background: var(--red); }}
                .badge.high {{ background: var(--orange); }}
                .meta {{ font-size: 12px; margin-bottom: 15px; color: var(--dim); display: flex; gap: 10px; align-items: center; }}
                .meta .route {{ font-family: monospace; color: var(--cyan); }}
                h3 {{ margin-top: 0; }}
            </style>
        </head>
        <body>
            <h1>BlackScanner Report</h1>
            <div class="summary">
                <h2>{report.title}</h2>
                <p><strong>Target:</strong> {report.target_url}</p>
                <p><strong>Generated:</strong> {report.generated_at.strftime('%Y-%m-%d %H:%M:%S')}</p>
                <p>{report.summary}</p>
            </div>
            <div class="stats">
                <div class="stat-box"><span class="val">{report.total_findings}</span><span class="label">Total</span></div>
                <div class="stat-box"><span class="val" style="color:var(--red)">{report.critical_count}</span><span class="label">Critical</span></div>
                <div class="stat-box"><span class="val" style="color:var(--orange)">{report.high_count}</span><span class="label">High</span></div>
                <div class="stat-box"><span class="val" style="color:var(--yellow)">{report.medium_count}</span><span class="label">Medium</span></div>
            </div>
            <h2>Findings Details</h2>
            {findings_html}
        </body>
        </html>
        """
        from fastapi.responses import HTMLResponse
        return HTMLResponse(
            content=html_content,
            headers={"Content-Disposition": f"attachment; filename=blackscanner_report_{report_id}.html"}
        )
    elif format == "pdf":
        pdf = FPDF()
        pdf.add_page()
        pdf.set_font("Arial", "B", 24)
        pdf.cell(0, 10, "BlackScanner Report", ln=True, align="C")
        pdf.ln(10)

        pdf.set_font("Arial", "B", 16)
        pdf.cell(0, 10, report.title, ln=True)
        pdf.set_font("Arial", "", 12)
        pdf.cell(0, 7, f"Target: {report.target_url}", ln=True)
        pdf.cell(0, 7, f"Generated: {report.generated_at.strftime('%Y-%m-%d %H:%M:%S')}", ln=True)
        pdf.multi_cell(0, 7, f"Summary: {report.summary}")
        pdf.ln(10)

        # Stats
        pdf.set_font("Arial", "B", 14)
        pdf.cell(0, 10, "Summary Statistics", ln=True)
        pdf.set_font("Arial", "", 12)
        pdf.cell(40, 7, "Total Findings:", 0)
        pdf.cell(20, 7, str(report.total_findings), ln=True)
        pdf.cell(40, 7, "Critical:", 0)
        pdf.cell(20, 7, str(report.critical_count), ln=True)
        pdf.cell(40, 7, "High:", 0)
        pdf.cell(20, 7, str(report.high_count), ln=True)
        pdf.cell(40, 7, "Medium:", 0)
        pdf.cell(20, 7, str(report.medium_count), ln=True)
        pdf.cell(40, 7, "Low:", 0)
        pdf.cell(20, 7, str(report.low_count), ln=True)
        pdf.cell(40, 7, "Info:", 0)
        pdf.cell(20, 7, str(report.info_count), ln=True)
        pdf.ln(10)

        # Findings Details
        pdf.set_font("Arial", "B", 14)
        pdf.cell(0, 10, "Findings Details", ln=True)
        pdf.ln(5)

        for f in data["findings"]:
            pdf.set_font("Arial", "B", 12)
            pdf.multi_cell(0, 7, f"Title: {f['title']}")
            pdf.set_font("Arial", "", 10)
            pdf.cell(0, 5, f"Severity: {f['severity'].upper()} | Category: {f['category']} | Route: {f['route']}", ln=True)
            pdf.ln(2)
            pdf.set_font("Arial", "B", 10)
            pdf.cell(0, 5, "Description:", ln=True)
            pdf.set_font("Arial", "", 10)
            pdf.multi_cell(0, 5, f['description'] or 'No description provided.')
            pdf.ln(2)
            pdf.set_font("Arial", "B", 10)
            pdf.cell(0, 5, "AI Reasoning:", ln=True)
            pdf.set_font("Arial", "", 10)
            pdf.multi_cell(0, 5, f['ai_reasoning'] or 'N/A')
            pdf.ln(2)
            pdf.set_font("Arial", "B", 10)
            pdf.cell(0, 5, "Remediation:", ln=True)
            pdf.set_font("Arial", "", 10)
            pdf.multi_cell(0, 5, f['remediation'] or 'N/A')
            pdf.ln(5)

        pdf_output = pdf.output(dest='S').encode('latin-1') # Output as bytes
        return Response(
            content=pdf_output,
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename=blackscanner_report_{report_id}.pdf"}
        )

    return JSONResponse(
        content=data,
        headers={"Content-Disposition": f"attachment; filename=blackscanner_report_{report_id}.json"}
    )
