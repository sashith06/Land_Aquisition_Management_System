/**
 * Land area conversion utilities for Sri Lankan land measurement standards
 * Conversion factor: 1 hectare = 395.37 perches
 */

// Sri Lankan standard conversion factor
export const HECTARE_TO_PERCH_RATIO = 395.37;

/**
 * Convert hectares to perches
 * @param {number} hectares - Area in hectares
 * @param {number} precision - Number of decimal places (default: 4)
 * @returns {string} - Area in perches as a string with specified precision
 */
export const hectaresToPerches = (hectares, precision = 4) => {
  if (hectares === null || hectares === undefined || hectares === '' || isNaN(hectares)) {
    return '';
  }
  const numHectares = parseFloat(hectares);
  if (isNaN(numHectares)) {
    return '';
  }
  return (numHectares * HECTARE_TO_PERCH_RATIO).toFixed(precision);
};

/**
 * Convert perches to hectares
 * @param {number} perches - Area in perches
 * @param {number} precision - Number of decimal places (default: 4)
 * @returns {string} - Area in hectares as a string with specified precision
 */
export const perchesToHectares = (perches, precision = 4) => {
  if (perches === null || perches === undefined || perches === '' || isNaN(perches)) {
    return '';
  }
  const numPerches = parseFloat(perches);
  if (isNaN(numPerches)) {
    return '';
  }
  return (numPerches / HECTARE_TO_PERCH_RATIO).toFixed(precision);
};

/**
 * Format area display with both units
 * @param {number} hectares - Area in hectares
 * @param {number} perches - Area in perches
 * @returns {string} - Formatted string showing both units
 */
export const formatAreaDisplay = (hectares, perches) => {
  const ha = parseFloat(hectares) || 0;
  const p = parseFloat(perches) || 0;
  return `${ha} ha, ${p} perches`;
};

/**
 * Validate if the conversion between hectares and perches is consistent
 * @param {number} hectares - Area in hectares
 * @param {number} perches - Area in perches
 * @param {number} tolerance - Acceptable difference tolerance (default: 0.01)
 * @returns {boolean} - True if values are consistent
 */
export const validateConversion = (hectares, perches, tolerance = 0.01) => {
  if (!hectares || !perches) return true; // If one is empty, we can't validate
  
  const calculatedPerches = parseFloat(hectaresToPerches(hectares));
  const actualPerches = parseFloat(perches);
  
  return Math.abs(calculatedPerches - actualPerches) <= tolerance;
};

/**
 * Create input change handler with automatic conversion
 * @param {Function} setFormData - State setter function
 * @param {string} haFieldName - Name of the hectares field
 * @param {string} perchFieldName - Name of the perches field
 * @returns {Function} - Input change handler function
 */
export const createAreaConversionHandler = (setFormData, haFieldName, perchFieldName) => {
  return (name, value) => {
    // Handle hectares to perches conversion
    if (name === haFieldName && value !== '') {
      const hectares = parseFloat(value);
      if (!isNaN(hectares)) {
        const perches = hectaresToPerches(hectares);
        setFormData(prev => ({
          ...prev,
          [name]: value,
          [perchFieldName]: perches
        }));
        return;
      }
    }
    
    // Handle perches to hectares conversion
    if (name === perchFieldName && value !== '') {
      const perches = parseFloat(value);
      if (!isNaN(perches)) {
        const hectares = perchesToHectares(perches);
        setFormData(prev => ({
          ...prev,
          [name]: value,
          [haFieldName]: hectares
        }));
        return;
      }
    }
    
    // Regular input handling for other fields
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
};