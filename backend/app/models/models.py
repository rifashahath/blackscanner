import uuid
from datetime import datetime
from sqlalchemy import (
    Column, String, Integer, Float, Boolean, DateTime, Text, 
    ForeignKey, JSON, Enum as SAEnum
)
from sqlalchemy.orm import relationship
from app.core.database import Base


def generate_id():
    return str(uuid.uuid4())[:12]


class Target(Base):
    __tablename__ = "targets"

    id = Column(String, primary_key=True, default=generate_id)
    url = Column(String, nullable=False)
    domain = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    scan_jobs = relationship("ScanJob", back_populates="target", cascade="all, delete-orphan")


class ScanJob(Base):
    __tablename__ = "scan_jobs"

    id = Column(String, primary_key=True, default=generate_id)
    target_id = Column(String, ForeignKey("targets.id"), nullable=False)
    mode = Column(String, default="passive")  # passive | active | authenticated
    status = Column(String, default="pending")  # pending|crawling|parsing|analyzing|verifying|generating_report|completed|failed|cancelled
    progress = Column(Integer, default=0)
    current_phase = Column(String, default="Initializing")
    
    # Auth config
    auth_cookie = Column(Text, nullable=True)
    auth_header = Column(Text, nullable=True)

    # Counters
    routes_found = Column(Integer, default=0)
    forms_found = Column(Integer, default=0)
    params_found = Column(Integer, default=0)
    js_files_found = Column(Integer, default=0)
    api_calls_found = Column(Integer, default=0)
    hypotheses_count = Column(Integer, default=0)
    findings_count = Column(Integer, default=0)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    error_message = Column(Text, nullable=True)

    target = relationship("Target", back_populates="scan_jobs")
    discovered_routes = relationship("DiscoveredRoute", back_populates="scan_job", cascade="all, delete-orphan")
    js_files = relationship("DiscoveredJSFile", back_populates="scan_job", cascade="all, delete-orphan")
    api_calls = relationship("APICall", back_populates="scan_job", cascade="all, delete-orphan")
    hypotheses = relationship("Hypothesis", back_populates="scan_job", cascade="all, delete-orphan")
    findings = relationship("Finding", back_populates="scan_job", cascade="all, delete-orphan")
    events = relationship("ScanEvent", back_populates="scan_job", cascade="all, delete-orphan")
    reports = relationship("Report", back_populates="scan_job", cascade="all, delete-orphan")


class DiscoveredRoute(Base):
    __tablename__ = "discovered_routes"

    id = Column(String, primary_key=True, default=generate_id)
    scan_id = Column(String, ForeignKey("scan_jobs.id"), nullable=False)
    url = Column(String, nullable=False)
    method = Column(String, default="GET")
    status_code = Column(Integer, default=200)
    content_type = Column(String, default="text/html")
    response_size = Column(Integer, default=0)
    auth_required = Column(Boolean, default=False)
    functional_group = Column(String, default="General")
    risk_level = Column(String, default="info")  # critical|high|medium|low|info
    has_forms = Column(Boolean, default=False)
    has_params = Column(Boolean, default=False)
    discovered_at = Column(DateTime, default=datetime.utcnow)

    scan_job = relationship("ScanJob", back_populates="discovered_routes")
    forms = relationship("DiscoveredForm", back_populates="route", cascade="all, delete-orphan")
    parameters = relationship("DiscoveredParameter", back_populates="route", cascade="all, delete-orphan")


class DiscoveredForm(Base):
    __tablename__ = "discovered_forms"

    id = Column(String, primary_key=True, default=generate_id)
    route_id = Column(String, ForeignKey("discovered_routes.id"), nullable=False)
    action = Column(String, nullable=False)
    method = Column(String, default="POST")
    fields = Column(JSON, default=list)
    is_state_changing = Column(Boolean, default=False)
    has_csrf_token = Column(Boolean, default=True)

    route = relationship("DiscoveredRoute", back_populates="forms")


class DiscoveredParameter(Base):
    __tablename__ = "discovered_parameters"

    id = Column(String, primary_key=True, default=generate_id)
    route_id = Column(String, ForeignKey("discovered_routes.id"), nullable=False)
    name = Column(String, nullable=False)
    location = Column(String, default="query")  # query|body|header|cookie|path
    param_type = Column(String, default="string")
    sample_value = Column(String, default="")
    is_sensitive = Column(Boolean, default=False)

    route = relationship("DiscoveredRoute", back_populates="parameters")


class DiscoveredJSFile(Base):
    __tablename__ = "discovered_js_files"

    id = Column(String, primary_key=True, default=generate_id)
    scan_id = Column(String, ForeignKey("scan_jobs.id"), nullable=False)
    url = Column(String, nullable=False)
    size = Column(Integer, default=0)
    has_api_endpoints = Column(Boolean, default=False)
    has_sensitive_data = Column(Boolean, default=False)
    endpoints_found = Column(JSON, default=list)

    scan_job = relationship("ScanJob", back_populates="js_files")


class APICall(Base):
    __tablename__ = "api_calls"

    id = Column(String, primary_key=True, default=generate_id)
    scan_id = Column(String, ForeignKey("scan_jobs.id"), nullable=False)
    url = Column(String, nullable=False)
    method = Column(String, default="GET")
    source = Column(String, default="")
    auth_header = Column(Boolean, default=False)
    request_body_schema = Column(Text, nullable=True)

    scan_job = relationship("ScanJob", back_populates="api_calls")


class Hypothesis(Base):
    __tablename__ = "hypotheses"

    id = Column(String, primary_key=True, default=generate_id)
    scan_id = Column(String, ForeignKey("scan_jobs.id"), nullable=False)
    category = Column(String, nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, default="")
    affected_routes = Column(JSON, default=list)
    severity = Column(String, default="medium")
    confidence = Column(String, default="low")
    ai_reasoning = Column(Text, default="")
    status = Column(String, default="hypothesis")  # hypothesis|suspicious|verified|false_positive
    created_at = Column(DateTime, default=datetime.utcnow)

    scan_job = relationship("ScanJob", back_populates="hypotheses")
    findings = relationship("Finding", back_populates="hypothesis", cascade="all, delete-orphan")


class Finding(Base):
    __tablename__ = "findings"

    id = Column(String, primary_key=True, default=generate_id)
    scan_id = Column(String, ForeignKey("scan_jobs.id"), nullable=False)
    hypothesis_id = Column(String, ForeignKey("hypotheses.id"), nullable=True)
    title = Column(String, nullable=False)
    category = Column(String, nullable=False)
    severity = Column(String, default="medium")
    confidence = Column(String, default="medium")
    status = Column(String, default="hypothesis")
    affected_route = Column(String, default="")
    description = Column(Text, default="")
    ai_reasoning = Column(Text, default="")
    remediation = Column(Text, default="")
    evidence_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    scan_job = relationship("ScanJob", back_populates="findings")
    hypothesis = relationship("Hypothesis", back_populates="findings")
    evidence_items = relationship("EvidenceItem", back_populates="finding", cascade="all, delete-orphan")


class EvidenceItem(Base):
    __tablename__ = "evidence_items"

    id = Column(String, primary_key=True, default=generate_id)
    finding_id = Column(String, ForeignKey("findings.id"), nullable=False)
    type = Column(String, default="request")  # request|response|diff|screenshot|log
    title = Column(String, default="")
    description = Column(Text, default="")
    request_data = Column(JSON, nullable=True)
    response_data = Column(JSON, nullable=True)
    diff_content = Column(Text, nullable=True)
    raw_content = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    finding = relationship("Finding", back_populates="evidence_items")


class ScanEvent(Base):
    __tablename__ = "scan_events"

    id = Column(String, primary_key=True, default=generate_id)
    scan_id = Column(String, ForeignKey("scan_jobs.id"), nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
    phase = Column(String, default="init")
    type = Column(String, default="info")  # info|warning|error|success|ai
    message = Column(Text, default="")

    scan_job = relationship("ScanJob", back_populates="events")


class Report(Base):
    __tablename__ = "reports"

    id = Column(String, primary_key=True, default=generate_id)
    scan_id = Column(String, ForeignKey("scan_jobs.id"), nullable=False)
    title = Column(String, default="")
    target_url = Column(String, default="")
    summary = Column(Text, default="")
    total_findings = Column(Integer, default=0)
    critical_count = Column(Integer, default=0)
    high_count = Column(Integer, default=0)
    medium_count = Column(Integer, default=0)
    low_count = Column(Integer, default=0)
    info_count = Column(Integer, default=0)
    generated_at = Column(DateTime, default=datetime.utcnow)
    format = Column(String, default="json")
    content = Column(Text, nullable=True)

    scan_job = relationship("ScanJob", back_populates="reports")
