export function getDisabledStatus(
  observationId,
  colIndex,
  row,
  cell,
  dynamicHeadings,
  disabledColumns
) {
  let isDisabled = colIndex === 0; // SR NO always disabled

  // If hardcoded disabled columns provided (for MM)
  if (disabledColumns && disabledColumns.includes(colIndex)) {
    return true;
  }

  // Template-specific logic
  switch (observationId) {
    case 'observationrtdwi': {  // ✅ Add curly braces
      const rtdRowType = row[2];
      isDisabled = isDisabled || [2].includes(colIndex) || cell === '-';
      if (rtdRowType === 'UUC') {
        isDisabled = isDisabled || [1, 10, 11, 12, 13, 14].includes(colIndex);
      }
      if (rtdRowType === 'Master') {
        if ([11].includes(colIndex)) {
          isDisabled = false;
        } else if ([0, 1, 4, 12, 13, 14].includes(colIndex)) {
          isDisabled = true;
        }
      }
      break;
    }

    case 'observationgtm': {  // ✅ Add curly braces
      const gtmRowType = row[2];
      isDisabled = isDisabled || [2].includes(colIndex) || cell === '-';
      if (gtmRowType === 'UUC') {
        isDisabled = isDisabled || [0, 1, 2, 4, 5, 11, 12, 13].includes(colIndex);
      }
      if (gtmRowType === 'Master') {
        isDisabled = isDisabled || [0, 1, 2, 3, 11, 13].includes(colIndex);
      }
      break;
    }

    case 'observationmg': {  // ✅ Add curly braces
      if (dynamicHeadings?.mainhading?.calibration_settings) {
        const sortedSettings = [...dynamicHeadings.mainhading.calibration_settings]
          .filter(col => col.checkbox === 'yes')
          .sort((a, b) => a.field_position - b.field_position);
        
        let currentCol = 1;
        let matchedSetting = null;
        
        for (const setting of sortedSettings) {
          if (setting.fieldname === 'master') {
            const obsSettings = dynamicHeadings?.observation_heading?.observation_settings || [];
            const obsCount = obsSettings.filter(obs => obs.checkbox === 'yes').length;
            
            if (colIndex >= currentCol && colIndex < currentCol + obsCount) {
              matchedSetting = setting;
              break;
            }
            currentCol += obsCount;
          } else {
            if (colIndex === currentCol) {
              matchedSetting = setting;
              break;
            }
            currentCol++;
          }
        }
        
        if (matchedSetting) {
          isDisabled = isDisabled || ['averagemaster', 'error', 'hysterisis', 'uuc', 'calculatedmaster']
            .includes(matchedSetting.fieldname);
        }
      } else {
        isDisabled = isDisabled || [5, 6, 7].includes(colIndex);
      }
      break;
    }

    case 'observationdg':
      isDisabled = isDisabled || [0, 1, 6, 7, 8, 9, 10].includes(colIndex);
      break;

    case 'observationdpg':
      isDisabled = isDisabled || [1, 2, 6, 7, 8, 9].includes(colIndex);
      break;

    case 'observationodfm':
      isDisabled = isDisabled || [2, 8, 9].includes(colIndex);
      break;

    case 'observationppg':
      isDisabled = isDisabled || [1, 2, 9, 10, 11, 12].includes(colIndex);
      break;

    case 'observationapg':
      isDisabled = isDisabled || [1, 2, 5, 6, 7].includes(colIndex);
      break;

    case 'observationctg':
      isDisabled = isDisabled || [1, 7, 8].includes(colIndex);
      break;

    case 'observationvc':
      isDisabled = isDisabled || [0, 1, 7, 8].includes(colIndex);
      break;

    case 'observationmsr':
      isDisabled = isDisabled || [1, 7, 8].includes(colIndex);
      break;

    case 'observationavg':
      isDisabled = isDisabled || [5, 6, 7].includes(colIndex);
      break;

    case 'observationit':
      isDisabled = isDisabled || [1, 7, 8].includes(colIndex);
      break;

    case 'observationexm':
      isDisabled = isDisabled || [1, 7, 8].includes(colIndex);
      break;

    case 'observationfg':
      isDisabled = isDisabled || [7, 8].includes(colIndex);
      break;

    case 'observationhg':
      isDisabled = isDisabled || [1, 7, 8].includes(colIndex);
      break;

    case 'observationmt':
      isDisabled = isDisabled || [1, 7, 8].includes(colIndex);
      break;

    case 'observationmm':
      isDisabled = isDisabled || [3, 4, 10, 11].includes(colIndex);
      break;

    default:
      break;
  }

  return isDisabled;
}