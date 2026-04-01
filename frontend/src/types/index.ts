// ============================================================
// Core domain types for BlackScanner
// ============================================================

export type ScanStatus =
    | 'pending'
    | 'crawling'
    | 'parsing'
    | 'analyzing'
    | 'verifying'
    | 'generating_report'
    | 'completed'
    | 'failed'
    | 'cancelled';

export type ScanMode = 'passive' | 'active' | 'authenticated';

export type Severity = 'critical' | 'high' | 'medium' | 'low' | 'info';

export type FindingStatus = 'hypothesis' | 'suspicious' | 'verified' | 'false_positive';

export type ConfidenceLevel = 'high' | 'medium' | 'low';

export interface Target {
    id: string;
    url: string;
    domain: string;
    created_at: string;
}

export interface ScanJob {
    id: string;
    target_id: string;
    target_url: string;
    mode: ScanMode;
    status: ScanStatus;
    progress: number;
    current_phase: string;
    routes_found: number;
    forms_found: number;
    params_found: number;
    js_files_found: number;
    api_calls_found: number;
    hypotheses_count: number;
    findings_count: number;
    created_at: string;
    started_at?: string;
    completed_at?: string;
    error_message?: string;
}

export interface DiscoveredRoute {
    id: string;
    scan_id: string;
    url: string;
    method: string;
    status_code: number;
    content_type: string;
    response_size: number;
    auth_required: boolean;
    functional_group: string;
    risk_level: Severity;
    has_forms: boolean;
    has_params: boolean;
    discovered_at: string;
}

export interface DiscoveredForm {
    id: string;
    route_id: string;
    action: string;
    method: string;
    fields: FormField[];
    is_state_changing: boolean;
    has_csrf_token: boolean;
}

export interface FormField {
    name: string;
    type: string;
    required: boolean;
    validation: string | null;
}

export interface DiscoveredParameter {
    id: string;
    route_id: string;
    name: string;
    location: 'query' | 'body' | 'header' | 'cookie' | 'path';
    param_type: string;
    sample_value: string;
    is_sensitive: boolean;
}

export interface DiscoveredJSFile {
    id: string;
    scan_id: string;
    url: string;
    size: number;
    has_api_endpoints: boolean;
    has_sensitive_data: boolean;
    endpoints_found: string[];
}

export interface APICall {
    id: string;
    scan_id: string;
    url: string;
    method: string;
    source: string;
    auth_header: boolean;
    request_body_schema?: string;
}

export interface SurfaceResponse {
    routes: DiscoveredRoute[];
    forms: DiscoveredForm[];
    parameters: DiscoveredParameter[];
    js_files: DiscoveredJSFile[];
    api_calls: APICall[];
    stats: SurfaceStats;
}

export interface Hypothesis {
    id: string;
    scan_id: string;
    category: string;
    title: string;
    description: string;
    affected_routes: string[];
    severity: Severity;
    confidence: ConfidenceLevel;
    ai_reasoning: string;
    status: FindingStatus;
    created_at: string;
}

export interface Finding {
    id: string;
    scan_id: string;
    hypothesis_id: string;
    title: string;
    category: string;
    severity: Severity;
    confidence: ConfidenceLevel;
    status: FindingStatus;
    affected_route: string;
    description: string;
    ai_reasoning: string;
    remediation: string;
    evidence_count: number;
    created_at: string;
}

export interface Evidence {
    id: string;
    finding_id: string;
    type: 'request' | 'response' | 'diff' | 'screenshot' | 'log';
    title: string;
    description: string;
    request_data?: RequestData;
    response_data?: ResponseData;
    diff_content?: string;
    raw_content?: string;
    created_at: string;
}

export interface RequestData {
    method: string;
    url: string;
    headers: Record<string, string>;
    body?: string;
}

export interface ResponseData {
    status_code: number;
    headers: Record<string, string>;
    body: string;
    response_time_ms: number;
}

export interface Report {
    id: string;
    scan_id: string;
    title: string;
    target_url: string;
    summary: string;
    total_findings: number;
    critical_count: number;
    high_count: number;
    medium_count: number;
    low_count: number;
    info_count: number;
    generated_at: string;
    format: 'json' | 'html' | 'pdf';
}

export interface ScanEvent {
    id: string;
    timestamp: string;
    phase: string;
    type: 'info' | 'warning' | 'error' | 'success' | 'ai';
    message: string;
}

export interface SurfaceStats {
    total_routes: number;
    total_forms: number;
    total_params: number;
    total_js_files: number;
    total_api_calls: number;
    auth_routes: number;
    state_changing_routes: number;
    high_risk_routes: number;
}

export interface DashboardStats {
    total_scans: number;
    active_scans: number;
    total_findings: number;
    critical_findings: number;
    scans_today: number;
}

export interface AttackSurfaceNode {
    id: string;
    label: string;
    type: 'domain' | 'route' | 'form' | 'param' | 'api' | 'js';
    risk: Severity;
    data?: Record<string, unknown>;
}

export interface AttackSurfaceEdge {
    id: string;
    source: string;
    target: string;
    label?: string;
}
