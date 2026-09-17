export const safeGetArrayValue = (val) => {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  if (typeof val === 'string') {
    try {
      const parsed = JSON.parse(val);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      return val.split(',').map(s => s.trim());
    }
  }
  return [val];
};

// Format number with scientific notation for very small values
export const formatUncertaintyValue = (value, decimals = 6) => {
  if (typeof value !== 'number' || isNaN(value)) return value;

  // Use scientific notation for very small numbers (less than 0.0001)
  if (Math.abs(value) < 0.0001 && value !== 0) {
    // Get exponent and mantissa
    const exponent = Math.floor(Math.log10(Math.abs(value)));
    const mantissa = value / Math.pow(10, exponent);
    // Format as E notation: e.g., 9.9231E-5
    return mantissa.toFixed(4) + 'E' + (exponent >= 0 ? '+' : '') + exponent;
  }

  // For normal values, use fixed decimal places
  return value.toFixed(decimals);
};
