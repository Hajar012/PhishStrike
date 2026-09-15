import datetime
from typing import List, Dict, Any


def calculate_risk_score(breaches: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Calculate risk score based on SRS-defined risk factors.
    
    Risk factors:
    - Recency (R): 30% weight
    - Sensitivity (S): 35% weight  
    - Frequency (F): 20% weight
    - Exposure Type (E): 15% weight
    
    Formula: Risk Score = (0.30 × R + 0.35 × S + 0.20 × F + 0.15 × E) × 10
    
    Returns score 0-100 and risk level.
    """
    
    if not breaches:
        return {
            "score": 0,
            "level": "safe",
            "factors": {
                "recency": 0,
                "sensitivity": 0, 
                "frequency": 0,
                "exposure": 0
            }
        }
    
    # Factor 1: Recency (R) - based on most recent breach
    recency_score = calculate_recency_score(breaches)
    
    # Factor 2: Sensitivity (S) - based on data types exposed
    sensitivity_score = calculate_sensitivity_score(breaches)
    
    # Factor 3: Frequency (F) - based on number of breaches
    frequency_score = calculate_frequency_score(breaches)
    
    # Factor 4: Exposure Type (E) - based on scale/scope of breaches
    exposure_score = calculate_exposure_score(breaches)
    
    # Calculate weighted risk score
    risk_score = (0.30 * recency_score + 0.35 * sensitivity_score + 
                  0.20 * frequency_score + 0.15 * exposure_score) * 10
    
    # Round to nearest integer
    risk_score = round(risk_score)
    
    # Determine risk level
    risk_level = determine_risk_level(risk_score)
    
    return {
        "score": risk_score,
        "level": risk_level,
        "factors": {
            "recency": recency_score,
            "sensitivity": sensitivity_score,
            "frequency": frequency_score,
            "exposure": exposure_score
        }
    }


def calculate_recency_score(breaches: List[Dict[str, Any]]) -> float:
    """
    Calculate recency score (0-10) based on breach dates.
    More recent breaches = higher score.
    """
    if not breaches:
        return 0
    
    # Get current date
    current_date = datetime.datetime.now().date()
    
    # Find most recent breach date
    most_recent_date = None
    for breach in breaches:
        if breach.get("BreachDate"):
            try:
                breach_date = datetime.datetime.strptime(breach["BreachDate"], "%Y-%m-%d").date()
                if most_recent_date is None or breach_date > most_recent_date:
                    most_recent_date = breach_date
            except (ValueError, TypeError):
                continue
    
    if not most_recent_date:
        return 5  # Default if no valid dates
    
    # Calculate days since breach
    days_since_breach = (current_date - most_recent_date).days
    
    # Score based on recency (0-10 scale)
    # Less than 30 days = 10, more than 10 years = 0
    if days_since_breach <= 30:
        return 10
    elif days_since_breach <= 365:  # 1 year
        return 8
    elif days_since_breach <= 1095:  # 3 years
        return 6
    elif days_since_breach <= 1825:  # 5 years
        return 4
    elif days_since_breach <= 3650:  # 10 years
        return 2
    else:
        return 0


def calculate_sensitivity_score(breaches: List[Dict[str, Any]]) -> float:
    """
    Calculate sensitivity score (0-10) based on exposed data types.
    More sensitive data types = higher score.
    """
    if not breaches:
        return 0
    
    # Define sensitivity weights for different data types
    sensitivity_weights = {
        "passwords": 10,
        "password-hints": 8,
        "security-questions-and-answers": 9,
        "usernames": 4,
        "email-addresses": 3,
        "ip-addresses": 5,
        "names": 4,
        "phone-numbers": 6,
        "physical-addresses": 7,
        "dates-of-birth": 7,
        "credit-cards": 10,
        "bank-account-numbers": 10,
        "government-id-numbers": 10,
        "private-messages": 8,
        "health-information": 10,
        "biometric-data": 10
    }
    
    # Track all unique data classes across breaches
    all_data_classes = set()
    max_breach_sensitivity = 0
    
    for breach in breaches:
        data_classes = breach.get("DataClasses", [])
        if not data_classes:
            continue
            
        # Convert to lowercase for matching
        data_classes_lower = [dc.lower() for dc in data_classes]
        all_data_classes.update(data_classes_lower)
        
        # Calculate breach-specific sensitivity
        breach_sensitivity = 0
        for dc in data_classes_lower:
            # Find matching weight (partial match for variations)
            weight = 0
            for key, value in sensitivity_weights.items():
                if key in dc or dc in key:
                    weight = max(weight, value)
                    break
            if weight == 0:
                weight = 2  # Default for unknown data types
            breach_sensitivity = max(breach_sensitivity, weight)
        
        max_breach_sensitivity = max(max_breach_sensitivity, breach_sensitivity)
    
    # If we have data classes, use the maximum sensitivity found
    if all_data_classes:
        # Normalize to 0-10 scale (already mostly in that range)
        return min(10, max_breach_sensitivity)
    
    return 5  # Default if no data classes information


def calculate_frequency_score(breaches: List[Dict[str, Any]]) -> float:
    """
    Calculate frequency score (0-10) based on number of breaches.
    More breaches = higher score.
    """
    breach_count = len(breaches)
    
    # Score based on number of breaches (0-10 scale)
    if breach_count == 0:
        return 0
    elif breach_count == 1:
        return 3
    elif breach_count <= 3:
        return 5
    elif breach_count <= 5:
        return 7
    elif breach_count <= 10:
        return 9
    else:
        return 10


def calculate_exposure_score(breaches: List[Dict[str, Any]]) -> float:
    """
    Calculate exposure score (0-10) based on scale/scope of breaches.
    Larger breaches = higher score.
    """
    if not breaches:
        return 0
    
    total_affected = 0
    breach_scales = []
    
    for breach in breaches:
        pwn_count = breach.get("PwnCount")
        if pwn_count:
            try:
                count = int(pwn_count)
                total_affected += count
                breach_scales.append(count)
            except (ValueError, TypeError):
                continue
    
    if not breach_scales:
        return 5  # Default if no scale information
    
    # Find maximum breach scale
    max_scale = max(breach_scales)
    
    # Score based on breach scale (0-10 scale)
    # ponytail: simplified scale calculation - could be refined with log scale for very large breaches
    if max_scale <= 1000:
        return 2
    elif max_scale <= 10000:
        return 4
    elif max_scale <= 100000:
        return 6
    elif max_scale <= 1000000:
        return 8
    else:
        return 10


def determine_risk_level(score: int) -> str:
    """
    Determine risk level based on score.
    """
    if score <= 20:
        return "safe"
    elif score <= 40:
        return "low"
    elif score <= 60:
        return "medium"
    elif score <= 80:
        return "high"
    else:
        return "critical"