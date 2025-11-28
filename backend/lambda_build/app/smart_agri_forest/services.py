from .models import CropProfile, SensorReadingSummary

class IrrigationPlanner:
    def get_recommendation(self, crop: CropProfile, summary: SensorReadingSummary) -> str:
        if summary.avg_moisture is None:
            return "No moisture data available. Please check sensors."

        if summary.avg_moisture < crop.ideal_moisture_min:
            return "Soil is too dry. Irrigation recommended as soon as possible."
        elif summary.avg_moisture > crop.ideal_moisture_max:
            return "Soil moisture is high. No irrigation needed now."
        else:
            return "Soil moisture is within the ideal range. Monitor regularly, no immediate irrigation."

class ForestRiskAnalyser:
    def compute_fire_risk(self, tree_species: str, summary: SensorReadingSummary) -> str:
        if summary.avg_temperature is None or summary.avg_humidity is None:
            return "Insufficient data for fire risk assessment."

        score = 0
        if summary.avg_temperature > 30:
            score += 2
        elif summary.avg_temperature > 25:
            score += 1

        if summary.avg_humidity < 30:
            score += 2
        elif summary.avg_humidity < 45:
            score += 1

        if tree_species and tree_species.lower() in ["pine", "spruce", "fir"]:
            score += 1

        if score >= 4:
            return "High fire risk. Increase monitoring and consider preventive measures."
        elif score >= 2:
            return "Moderate fire risk. Monitor conditions closely."
        else:
            return "Low fire risk under current conditions."
