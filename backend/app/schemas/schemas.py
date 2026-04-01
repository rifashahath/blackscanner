from pydantic import BaseModel, HttpUrl
from typing import Optional
from datetime import datetime


# === Request schemas ===

class ScanCreateRequest(BaseModel):
    target_url: str
    mode: str = "passive"
    auth_config: Optional[dict] = None


class ReportGenerateRequest(BaseModel):
    format: str = "json"


# === Response schemas ===

class TargetResponse(BaseModel):
    id: str
    url: str
    domain: str
    created_at: str


class ScanJobResponse(BaseModel):
    id: str
    target_id: str
    target_url: str
    mode: str
    status: str
    progress: int
    current_phase: str
    routes_found: int
    forms_found: int
    params_found: int
    js_files_found: int
    api_calls_found: int
    hypotheses_count: int
    findings_count: int
    created_at: str
    started_at: Optional[str] = None
    completed_at: Optional[str] = None
    error_message: Optional[str] = None


class ScanListResponse(BaseModel):
    scans: list[ScanJobResponse]


class RouteResponse(BaseModel):
    id: str
    scan_id: str
    url: str
    method: str
    status_code: int
    content_type: str
    response_size: int
    auth_required: bool
    functional_group: str
    risk_level: str
    has_forms: bool
    has_params: bool
    discovered_at: str


class FormResponse(BaseModel):
    id: str
    route_id: str
    action: str
    method: str
    fields: list
    is_state_changing: bool
    has_csrf_token: bool


class ParameterResponse(BaseModel):
    id: str
    route_id: str
    name: str
    location: str
    param_type: str
    sample_value: str
    is_sensitive: bool


class JSFileResponse(BaseModel):
    id: str
    scan_id: str
    url: str
    size: int
    has_api_endpoints: bool
    has_sensitive_data: bool
    endpoints_found: list[str]


class APICallResponse(BaseModel):
    id: str
    scan_id: str
    url: str
    method: str
    source: str
    auth_header: bool
    request_body_schema: Optional[str] = None


class SurfaceStatsResponse(BaseModel):
    total_routes: int
    total_forms: int
    total_params: int
    total_js_files: int
    total_api_calls: int
    auth_routes: int
    state_changing_routes: int
    high_risk_routes: int


class SurfaceResponse(BaseModel):
    routes: list[RouteResponse]
    forms: list[FormResponse]
    parameters: list[ParameterResponse]
    js_files: list[JSFileResponse]
    api_calls: list[APICallResponse]
    stats: SurfaceStatsResponse


class HypothesisResponse(BaseModel):
    id: str
    scan_id: str
    category: str
    title: str
    description: str
    affected_routes: list[str]
    severity: str
    confidence: str
    ai_reasoning: str
    status: str
    created_at: str


class FindingResponse(BaseModel):
    id: str
    scan_id: str
    hypothesis_id: str
    title: str
    category: str
    severity: str
    confidence: str
    status: str
    affected_route: str
    description: str
    ai_reasoning: str
    remediation: str
    evidence_count: int
    created_at: str


class EvidenceResponse(BaseModel):
    id: str
    finding_id: str
    type: str
    title: str
    description: str
    request_data: Optional[dict] = None
    response_data: Optional[dict] = None
    diff_content: Optional[str] = None
    raw_content: Optional[str] = None
    created_at: str


class FindingDetailResponse(FindingResponse):
    evidence: list[EvidenceResponse]


class ScanEventResponse(BaseModel):
    id: str
    timestamp: str
    phase: str
    type: str
    message: str


class ReportResponse(BaseModel):
    id: str
    scan_id: str
    title: str
    target_url: str
    summary: str
    total_findings: int
    critical_count: int
    high_count: int
    medium_count: int
    low_count: int
    info_count: int
    generated_at: str
    format: str


class DashboardStatsResponse(BaseModel):
    total_scans: int
    active_scans: int
    total_findings: int
    critical_findings: int
    scans_today: int
