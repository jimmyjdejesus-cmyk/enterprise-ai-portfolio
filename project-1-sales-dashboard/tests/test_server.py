"""
================================================================================
Unit & Integration Tests for FastAPI Sales Intelligence Service
================================================================================
Author: AI & Data Science Engineer (rePoTaire)
Purpose: Validate all REST endpoints, query filtering, SARIMAX payloads,
         cohort calculations, and static file delivery.
================================================================================
"""

import os
import sys
import pytest
from fastapi.testclient import TestClient

# Ensure root directory of project is on path
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
PARENT_DIR = os.path.abspath(os.path.join(CURRENT_DIR, ".."))
if PARENT_DIR not in sys.path:
    sys.path.insert(0, PARENT_DIR)

from server import app, store


@pytest.fixture(scope="module")
def client():
    """Provides a reusable FastAPI TestClient with loaded dataset."""
    with TestClient(app) as test_client:
        yield test_client


def test_metadata_endpoint(client):
    """Verifies metadata response includes valid date bounds, categories, and record counts."""
    res = client.get("/api/meta")
    assert res.status_code == 200
    data = res.json()

    assert "min_date" in data
    assert "max_date" in data
    assert "categories" in data
    assert isinstance(data["categories"], list)
    assert len(data["categories"]) >= 3
    assert data["total_records"] > 0


def test_kpis_endpoint(client):
    """Verifies standard KPI calculations without filters."""
    res = client.get("/api/kpis")
    assert res.status_code == 200
    kpis = res.json()

    assert kpis["revenue"] > 0
    assert kpis["orders"] > 0
    assert kpis["customers"] > 0
    assert kpis["profit"] > 0
    assert kpis["profit_margin"] > 0
    assert "revenue_mom_delta" in kpis
    assert "orders_mom_delta" in kpis


def test_kpis_category_filter(client):
    """Verifies that filtering by category returns a strict numerical subset."""
    res_all = client.get("/api/kpis")
    all_rev = res_all.json()["revenue"]

    res_cat = client.get("/api/kpis?categories=Electronics")
    assert res_cat.status_code == 200
    elec_rev = res_cat.json()["revenue"]

    assert elec_rev > 0
    assert elec_rev < all_rev


def test_forecast_endpoint(client):
    """Verifies SARIMAX forecast endpoint execution, model metrics, and confidence intervals."""
    payload = {
        "periods_weeks": 4
    }
    res = client.post("/api/forecast", json=payload)
    assert res.status_code == 200
    data = res.json()

    assert "chart_points" in data
    assert len(data["chart_points"]) > 10
    assert "model_order" in data
    assert data["model_order"].startswith("SARIMAX")
    assert data["aic"] > 0
    assert data["rmse"] > 0
    assert "residuals" in data
    assert isinstance(data["residuals"], list)

    # Check forecast records structure
    forecast_points = [p for p in data["chart_points"] if p["type"] == "Forecast"]
    assert len(forecast_points) == 4
    for pt in forecast_points:
        assert pt["sales"] is not None
        assert pt["upper_ci"] >= pt["lower_ci"]


def test_forecast_invalid_horizon(client):
    """Verifies validation error on out-of-range forecast horizon."""
    payload = {"periods_weeks": 50}  # Exceeds max 24
    res = client.post("/api/forecast", json=payload)
    assert res.status_code == 422


def test_cohort_ltv_endpoint(client):
    """Verifies cohort retention matrix and Customer Lifetime Value computations."""
    res = client.get("/api/cohort-ltv")
    assert res.status_code == 200
    data = res.json()

    assert "ltv" in data
    ltv = data["ltv"]
    assert ltv["historical_ltv"] > 0
    assert ltv["predictive_ltv"] > 0
    assert ltv["avg_lifespan_years"] > 0

    assert "heatmap" in data
    heatmap = data["heatmap"]
    assert len(heatmap["x"]) > 0
    assert len(heatmap["y"]) > 0
    assert len(heatmap["z"]) > 0


def test_rfm_endpoint(client):
    """Verifies RFM segmentation, persona distributions, and strategy playbook."""
    res = client.get("/api/rfm")
    assert res.status_code == 200
    data = res.json()

    assert "segment_counts" in data
    assert len(data["segment_counts"]) > 0

    assert "scatter_sample" in data
    assert len(data["scatter_sample"]) > 0
    sample_item = data["scatter_sample"][0]
    for key in ["customer_id", "recency", "frequency", "monetary", "profit", "segment"]:
        assert key in sample_item

    assert "playbook" in data
    assert "VIP Champions" in data["playbook"]
    assert "At Risk / Churning" in data["playbook"]


def test_scenario_simulation_endpoint(client):
    """Verifies What-If sensitivity uplift calculations."""
    payload = {
        "conversion_lift": 10.0,
        "price_adj": 5.0,
        "retention_boost": 5.0
    }
    res = client.post("/api/scenario", json=payload)
    assert res.status_code == 200
    data = res.json()

    assert data["base_revenue"] > 0
    assert data["simulated_revenue"] > data["base_revenue"]
    assert data["revenue_uplift"] > 0
    assert data["uplift_percentage"] > 0


def test_transactions_ledger_pagination(client):
    """Verifies paginated transaction retrieval."""
    res = client.get("/api/transactions?page=1&page_size=10")
    assert res.status_code == 200
    data = res.json()

    assert data["page"] == 1
    assert data["page_size"] == 10
    assert data["total_records"] > 0
    assert len(data["records"]) == 10

    # Test search query
    first_cust = data["records"][0]["customer_id"]
    search_res = client.get(f"/api/transactions?search={first_cust}&page=1&page_size=10")
    assert search_res.status_code == 200
    search_data = search_res.json()
    assert search_data["total_records"] >= 1
    assert any(first_cust in r["customer_id"] for r in search_data["records"])


def test_export_csv_endpoint(client):
    """Verifies streaming CSV export."""
    res = client.get("/api/export")
    assert res.status_code == 200
    assert "text/csv" in res.headers.get("content-type", "")
    content = res.text
    assert "OrderID,OrderDate,CustomerID" in content
    assert len(content.splitlines()) > 50


def test_serve_index(client):
    """Verifies delivery of the consumer-readable HTML dashboard."""
    res = client.get("/")
    assert res.status_code == 200
    assert "text/html" in res.headers.get("content-type", "")
    assert "Sales Intelligence Console" in res.text
