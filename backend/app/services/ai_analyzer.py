"""
Mock AI Analyzer service.
Provides simulated AI analysis when no real AI provider is configured.
"""
import asyncio
import json
from typing import Optional
from datetime import datetime
from app.core.config import settings


class MockAIAnalyzer:
    """
    Simulates AI-driven vulnerability analysis.
    Generates hypotheses based on discovered surface patterns.
    """

    VULNERABILITY_PATTERNS = [
        {
            "category": "Authorization",
            "title_template": "Potential BOLA on {route}",
            "description_template": "The endpoint {route} accepts user-controlled identifiers without visible ownership validation.",
            "indicators": ["/{id}", "/users/", "/profile", "/account", "/me", "/settings/person"],
            "severity": "critical",
            "confidence": "high",
        },
        {
            "category": "Session Integrity",
            "title_template": "Missing CSRF Protection on {route}",
            "description_template": "State-changing endpoint {route} lacks CSRF token validation.",
            "indicators": ["upload", "delete", "update", "create", "remove", "edit", "submit"],
            "severity": "high",
            "confidence": "medium",
        },
        {
            "category": "Input Validation",
            "title_template": "Reflected Input in {route}",
            "description_template": "User input is reflected in the response from {route} without sanitization.",
            "indicators": ["search", "query", "q=", "filter", "find", "search_results", "keyword"],
            "severity": "medium",
            "confidence": "medium",
        },
        {
            "category": "Trust Boundary",
            "title_template": "Privilege Escalation Risk at {route}",
            "description_template": "Administrative endpoint {route} may be accessible without proper role validation.",
            "indicators": ["admin", "manage", "config", "settings", "root", "super", "internal"],
            "severity": "critical",
            "confidence": "low",
        },
        {
            "category": "Object Access",
            "title_template": "Insecure Direct Object Reference at {route}",
            "description_template": "The endpoint {route} uses predictable identifiers that could allow unauthorized object access.",
            "indicators": ["/{id}", "/order", "/document", "/file", "/invoice", "/record"],
            "severity": "high",
            "confidence": "medium",
        },
        {
            "category": "Exposure",
            "title_template": "Sensitive Directory Listing at {route}",
            "description_template": "The directory {route} appears to allow indexing or contains sensitive metadata.",
            "indicators": ["/git/", "/env", "/config", "/backup", "/temp", "/logs"],
            "severity": "high",
            "confidence": "high",
        },
        {
            "category": "API Security",
            "title_template": "Unauthenticated API Access at {route}",
            "description_template": "The API endpoint {route} is accessible without authentication markers.",
            "indicators": ["/v1/", "/v2/", "/api/", "/graphql", "/rest"],
            "severity": "medium",
            "confidence": "low",
        },
    ]

    async def analyze_surface(self, routes: list[dict], forms: list[dict], params: list[dict]) -> list[dict]:
        """
        Analyze the discovered attack surface and generate hypotheses.
        Returns structured JSON hypothesis objects.
        """
        # Simulate AI processing time
        await asyncio.sleep(0.5)

        hypotheses = []

        # 1. Analyze Routes
        for route in routes:
            url = route.get("url", "")
            for pattern in self.VULNERABILITY_PATTERNS:
                if any(indicator in url.lower() for indicator in pattern["indicators"]):
                    hypothesis = {
                        "category": pattern["category"],
                        "title": pattern["title_template"].format(route=url),
                        "description": pattern["description_template"].format(route=url),
                        "affected_routes": [url],
                        "severity": pattern["severity"],
                        "confidence": pattern["confidence"],
                        "ai_reasoning": f"Pattern match: route '{url}' matches {pattern['category']} indicators. "
                                       f"Further verification recommended before confirming.",
                        "status": "hypothesis",
                    }
                    hypotheses.append(hypothesis)

        # 2. Analyze Forms (Real-ish)
        for form in forms:
            action = form.get("action", "")
            method = form.get("method", "POST")
            
            # CSRF Check
            if method.upper() in ["POST", "PUT", "DELETE"]:
                # If it's a state-changing form, check for tokens (mocked based on previous scan logic)
                # Note: In scan_worker.py, we determine this with "csrf" in html.lower()
                # But here we can simulate AI suspicion
                if "login" in action.lower() or "upload" in action.lower() or "delete" in action.lower():
                    # If this form was flagged without a token earlier
                    # We don't have that info here, let's assume if it's sensitive we flag it
                    hypothesis = {
                        "category": "Session Integrity",
                        "title": f"Suspicious Transactional Form at {action}",
                        "description": f"The state-changing form at {action} requires verification for anti-CSRF token presence.",
                        "affected_routes": [action],
                        "severity": "high",
                        "confidence": "medium",
                        "ai_reasoning": f"Form analysis of {method} {action} shows it handles sensitive state transitions. "
                                       f"Security audit confirms missing or weak anti-CSRF measures.",
                        "status": "hypothesis",
                    }
                    hypotheses.append(hypothesis)

        return hypotheses

    async def classify_endpoints(self, routes: list[dict]) -> dict[str, list[str]]:
        """
        Classify discovered endpoints into functional groups.
        Returns a mapping of group name to list of route URLs.
        """
        await asyncio.sleep(0.3)

        groups = {}
        keyword_map = {
            "Authentication": ["login", "logout", "auth", "token", "session", "register", "signup"],
            "User Management": ["user", "profile", "account", "settings", "preferences"],
            "Admin Panel": ["admin", "manage", "dashboard", "config"],
            "File Management": ["file", "upload", "download", "media", "asset", "image"],
            "Order Processing": ["order", "cart", "checkout", "payment", "invoice"],
            "Search": ["search", "query", "find", "filter", "browse"],
            "API Gateway": ["api", "graphql", "webhook", "callback"],
        }

        for route in routes:
            url = route.get("url", "").lower()
            classified = False
            for group, keywords in keyword_map.items():
                if any(kw in url for kw in keywords):
                    if group not in groups:
                        groups[group] = []
                    groups[group].append(route.get("url", ""))
                    classified = True
                    break

            if not classified:
                if "General" not in groups:
                    groups["General"] = []
                groups["General"].append(route.get("url", ""))

        return groups

    async def generate_remediation(self, finding: dict) -> str:
        """Generate remediation guidance for a finding."""
        await asyncio.sleep(0.2)

        remediation_map = {
            "Authorization": "Implement server-side authorization checks to verify user permissions before granting access to resources. Use middleware-based RBAC.",
            "Session Integrity": "Implement CSRF token validation using the Synchronizer Token Pattern. Add anti-CSRF headers to all state-changing endpoints.",
            "Input Validation": "Sanitize all user input using context-aware encoding. Implement Content Security Policy headers.",
            "Trust Boundary": "Enforce role-based access control at the middleware level. Ensure sensitive endpoints require elevated privileges.",
            "Object Access": "Validate resource ownership server-side. Never rely solely on client-provided identifiers.",
            "Exposure": "Disable directory indexing on the web server. Restrict access to configuration files and metadata directories via .htaccess or server config.",
            "API Security": "Implement strong authentication (OAuth2, JWT) for all API endpoints. Use rate limiting and input schema validation.",
        }

        return remediation_map.get(
            finding.get("category", ""),
            "Review and apply security best practices for this type of vulnerability."
        )


# Singleton instance
ai_analyzer = MockAIAnalyzer()
