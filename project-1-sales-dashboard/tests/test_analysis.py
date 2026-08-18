"""
================================================================================
Unit & Integration Tests for Enterprise Sales Analytics Module
================================================================================
"""

import os
import pytest
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import sys

# Append parent dir to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
import analysis


@pytest.fixture
def sample_sales_df():
    """Generates a controlled synthetic DataFrame for test verification."""
    np.random.seed(123)
    start_date = datetime(2024, 1, 1)
    
    records = []
    customers = ["CUST-001", "CUST-002", "CUST-003", "CUST-004", "CUST-005"]
    categories = ["Electronics", "Apparel", "Books & Media"]
    
    for i in range(120):
        c_date = start_date + timedelta(days=i * 2)
        records.append({
            "OrderID": f"ORD-{1000 + i}",
            "OrderDate": c_date.strftime("%Y-%m-%d"),
            "CustomerID": np.random.choice(customers),
            "Category": np.random.choice(categories),
            "Quantity": np.random.randint(1, 4),
            "UnitPrice": 50.0,
            "DiscountRate": 0.0,
            "TotalSales": round(np.random.uniform(30, 250), 2),
            "GrossProfit": round(np.random.uniform(10, 80), 2)
        })
        
    df = pd.DataFrame(records)
    df["OrderDate"] = pd.to_datetime(df["OrderDate"])
    return df


def test_data_generation(tmp_path):
    """Verifies mock data generation creates expected schema and non-empty rows."""
    test_file = str(tmp_path / "temp_sales.csv")
    df = analysis.generate_mock_data(test_file, num_days=60, seed=42)
    
    assert os.path.exists(test_file)
    assert len(df) > 0
    
    expected_cols = ["OrderID", "OrderDate", "CustomerID", "Category", "Quantity", "UnitPrice", "TotalSales", "GrossProfit"]
    for col in expected_cols:
        assert col in df.columns
        
    assert df["TotalSales"].min() >= 0
    assert df["Quantity"].min() >= 1


def test_kpi_calculations(sample_sales_df):
    """Verifies mathematical validity of revenue, order counts, and AOV."""
    kpis = analysis.get_kpis(sample_sales_df)
    
    assert kpis["revenue"] == sample_sales_df["TotalSales"].sum()
    assert kpis["orders"] == sample_sales_df["OrderID"].nunique()
    assert kpis["customers"] == sample_sales_df["CustomerID"].nunique()
    assert kpis["aov"] == kpis["revenue"] / kpis["orders"]
    assert kpis["profit_margin"] > 0


def test_cohort_matrix(sample_sales_df):
    """Verifies cohort retention matrix dimensions and percentages."""
    cohort_sizes, retention_matrix, churn_rates = analysis.get_cohort_matrix(sample_sales_df)
    
    assert len(cohort_sizes) > 0
    assert retention_matrix.shape[0] == len(cohort_sizes)
    # Month 0 retention is always 100% (1.0)
    assert np.allclose(retention_matrix.iloc[:, 0].dropna(), 1.0)
    assert len(churn_rates) == retention_matrix.shape[1]


def test_customer_ltv(sample_sales_df):
    """Verifies customer lifetime value metrics calculation."""
    ltv = analysis.calculate_customer_ltv(sample_sales_df)
    
    assert ltv["historical_ltv"] > 0
    assert ltv["predictive_ltv"] > 0
    assert ltv["avg_lifespan_years"] > 0


def test_rfm_segmentation(sample_sales_df):
    """Verifies RFM quantile scoring and persona mapping."""
    rfm = analysis.get_rfm_data(sample_sales_df)
    
    assert len(rfm) == sample_sales_df["CustomerID"].nunique()
    assert "Segment" in rfm.columns
    assert "RFM_Index" in rfm.columns
    assert set(rfm["Segment"].dropna()).issubset({
        "VIP Champions", "Loyal High-Value", "New Promising Leads", 
        "Potential Loyals", "At Risk / Churning", "Hibernating Spenders", "Lost / Inactive"
    })


def test_sarimax_forecast(sample_sales_df):
    """Verifies SARIMAX model optimization, projections, and confidence intervals."""
    fc_results = analysis.forecast_sales(sample_sales_df, periods_weeks=4)
    
    assert "data" in fc_results
    assert "mape" in fc_results
    assert "rmse" in fc_results
    assert fc_results["mape"] >= 0
    
    df_fc = fc_results["data"]
    fore_subset = df_fc[df_fc["Type"] == "Forecast"]
    assert len(fore_subset) == 4
    assert fore_subset["Sales"].notnull().all()
    assert (fore_subset["Upper_CI"] >= fore_subset["Lower_CI"]).all()

def test_empty_dataframe_handling():
    """Verifies get_kpis, calculate_customer_ltv, and get_cohort_matrix with an empty DataFrame."""
    empty_df = pd.DataFrame()
    
    kpis = analysis.get_kpis(empty_df)
    assert kpis["revenue"] == 0.0
    assert kpis["revenue_mom_delta"] == 0.0
    assert kpis["profit"] == 0.0
    assert kpis["profit_margin"] == 0.0
    assert kpis["orders"] == 0
    assert kpis["orders_mom_delta"] == 0.0
    assert kpis["customers"] == 0
    assert kpis["aov"] == 0.0

    ltv = analysis.calculate_customer_ltv(empty_df)
    assert ltv["historical_ltv"] == 0.0
    assert ltv["predictive_ltv"] == 0.0
    assert ltv["avg_lifespan_years"] == 0.0
    assert ltv["gross_margin"] == 0.0
    assert ltv["purchase_frequency"] == 0.0
    assert ltv["avg_order_value"] == 0.0

    cohort_sizes, retention_matrix, churn_rates = analysis.get_cohort_matrix(empty_df)
    assert cohort_sizes.empty
    assert retention_matrix.empty
    assert churn_rates.empty

def test_predictive_ltv_distinctness(sample_sales_df):
    """Verifies that predictive LTV scales with lifespan vs historical LTV."""
    ltv = analysis.calculate_customer_ltv(sample_sales_df)
    assert ltv["predictive_ltv"] != ltv["historical_ltv"]

    df_extended = sample_sales_df.copy()
    max_date = df_extended["OrderDate"].max()
    df_extended.loc[df_extended.index[-1], "OrderDate"] = max_date + timedelta(days=730)
    
    ltv_extended = analysis.calculate_customer_ltv(df_extended)
    assert ltv_extended["predictive_ltv"] != ltv["predictive_ltv"]
