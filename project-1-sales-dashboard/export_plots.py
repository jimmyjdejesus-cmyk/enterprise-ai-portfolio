import os
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import seaborn as sns
import pandas as pd
import numpy as np
import analysis

# Create images folder
os.makedirs("images", exist_ok=True)

# Load data
df = analysis.load_data("mock_sales_data.csv")

# 1. Export SARIMAX Forecast Plot
print("Generating SARIMAX Forecast Plot...")
weekly_sales = df.set_index("OrderDate").resample("W")["TotalSales"].sum()
fc_dict = analysis.forecast_sales(df, periods_weeks=8)
fc_data = pd.DataFrame(fc_dict["data"])

plt.figure(figsize=(10, 5))
# Plot historical (last 16 weeks)
hist_data = weekly_sales.tail(16)
plt.plot(hist_data.index, hist_data.values, label="Historical Weekly Sales", color="blue", marker="o", linewidth=2)

# Plot forecast
fc_only = fc_data[fc_data["Type"] == "Forecast"]
plt.plot(fc_only["Date"], fc_only["Sales"], label="SARIMAX Forecast", color="red", linestyle="--", marker="s", linewidth=2)

# Plot CI
plt.fill_between(fc_only["Date"], fc_only["Lower_CI"], fc_only["Upper_CI"], color="red", alpha=0.15, label="95% Confidence Interval")

plt.title("Weekly Sales Projections & Out-of-Sample Forecast (SARIMAX)", fontsize=13, fontweight='bold')
plt.xlabel("Date", fontsize=11)
plt.ylabel("Sales ($)", fontsize=11)
plt.legend(loc="upper left")
plt.grid(True, linestyle="--", alpha=0.5)
plt.tight_layout()
plt.savefig("images/sarimax_forecast.png", dpi=150)
plt.close()

# 2. Export Cohort Retention Heatmap Plot
print("Generating Cohort Retention Heatmap...")
cohort_sizes, retention_matrix, churn_rates = analysis.get_cohort_matrix(df)

# Take first 10 cohorts, first 10 months for cleaner visual rendering
heatmap_data = retention_matrix.iloc[:10, :10] * 100

plt.figure(figsize=(10, 6))
sns.heatmap(heatmap_data, annot=True, fmt=".1f", cmap="YlGnBu", cbar=True,
            cbar_kws={'label': 'Retention Rate (%)'}, linewidths=0.5)

plt.title("Monthly Customer Retention Cohort Survival Heatmap", fontsize=13, fontweight='bold')
plt.xlabel("Cohort Period (Months Elapsed)", fontsize=11)
plt.ylabel("Cohort Start Month", fontsize=11)
plt.tight_layout()
plt.savefig("images/cohort_retention.png", dpi=150)
plt.close()

print("All Project 1 plots successfully saved to 'images/' directory.")
