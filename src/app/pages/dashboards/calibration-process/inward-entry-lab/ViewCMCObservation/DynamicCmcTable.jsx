import { UNCERTAINTY_LAYOUTS } from "../../../calibration-operations/instrument-list/components/UncertaintyLayouts";

export const DynamicCmcTable = ({ customLayout, data, suffix }) => {
  if (!customLayout || !customLayout.columns || customLayout.columns.length === 0) {
    return null;
  }

  const cols = customLayout.columns;

  // Group headers
  const groupHeaders = [];
  let currentGroup = null;
  let currentGroupColSpan = 0;

  cols.forEach((col, index) => {
    const groupName = col.group || "";
    if (groupName !== currentGroup) {
      if (currentGroup !== null) {
        groupHeaders.push({ name: currentGroup, colSpan: currentGroupColSpan });
      }
      currentGroup = groupName;
      currentGroupColSpan = 1;
    } else {
      currentGroupColSpan++;
    }
    if (index === cols.length - 1) {
      groupHeaders.push({ name: currentGroup, colSpan: currentGroupColSpan });
    }
  });

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-[12px] text-gray-700 min-w-max">
        <thead>
          {groupHeaders.length > 0 && groupHeaders.some((g) => g.name) && (
            <tr className="bg-gray-100 text-center">
              {groupHeaders.map((g, i) => (
                <th
                  key={i}
                  colSpan={g.colSpan}
                  className="border border-gray-300 px-2 py-2 bg-gray-200 font-semibold text-xs"
                >
                  {g.name}
                </th>
              ))}
            </tr>
          )}
          <tr className="bg-gray-200 text-center text-[12px] font-medium">
            {cols.map((col) => (
              <th
                key={col.key}
                className="border border-gray-300 px-2 py-2"
              >
                {col.headerName}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length > 0 ? (
            data.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-gray-50 text-center text-[12px]">
                {cols.map((col) => {
                  const originalCol = UNCERTAINTY_LAYOUTS[suffix]?.[col.originalIndex];
                  let cellContent = "";
                  if (originalCol && originalCol.value) {
                    cellContent = originalCol.value(row);
                  } else if (!originalCol) {
                    // Dynamically extract values for dynamic observation columns
                    const headerAsInt = parseInt(col.headerName);
                    if (!isNaN(headerAsInt)) {
                      const valIndex = headerAsInt - 1;
                      if (row.values && Array.isArray(row.values)) {
                        cellContent = row.values[valIndex];
                      } else if (row.master && Array.isArray(row.master)) {
                        cellContent = row.master[valIndex];
                      } else if (row.masterObservations && Array.isArray(row.masterObservations)) {
                        cellContent = row.masterObservations[valIndex];
                      } else if (row[`master${valIndex}`] !== undefined) {
                        cellContent = row[`master${valIndex}`];
                      } else if (row[`uuc${valIndex}`] !== undefined) {
                        cellContent = row[`uuc${valIndex}`];
                      }
                    } else if (col.headerName.startsWith("M") && !isNaN(parseInt(col.headerName.replace("M", "")))) {
                      const valIndex = parseInt(col.headerName.replace("M", "")) - 1;
                      if (row.masterObservations && Array.isArray(row.masterObservations)) {
                        cellContent = row.masterObservations[valIndex];
                      } else if (row.m1 !== undefined) {
                        cellContent = row[`m${valIndex + 1}`];
                      }
                    }
                  }

                  if (typeof cellContent === 'number') {
                    cellContent = cellContent.toFixed(6);
                  }

                  return (
                    <td key={col.key} className="border border-gray-300 px-2 py-2">
                      {cellContent !== undefined && cellContent !== null && cellContent !== "" ? cellContent : "-"}
                    </td>
                  );
                })}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={cols.length} className="border border-gray-300 px-2 py-4 text-center text-gray-500">
                No data available.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default DynamicCmcTable;
