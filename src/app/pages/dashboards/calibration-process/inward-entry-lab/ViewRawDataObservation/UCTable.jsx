
export const UCTable = ({ observationRows }) => {
  let globalRowIndex = 0;

  return (
    <div className="space-y-6">
      {(observationRows?.modes || []).map((modeGroup, mIndex) => {
        const isMeasure = modeGroup.mode?.toLowerCase() === 'measure';
        const pointsCount = modeGroup.calibration_points?.length || 0;

        const currentStartingRowIndex = globalRowIndex;
        globalRowIndex += pointsCount;

        return (
          <div key={mIndex} className="mb-6">
            <h4 className="font-semibold text-md bg-gray-100 p-2 border border-gray-300">{modeGroup.mode}</h4>
            <div className="overflow-x-auto">
              <table className="w-full border border-gray-300 text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-300">
                    <th rowSpan="2" className="border border-gray-300 px-3 py-2 text-left">Sr. No.</th>
                    <th rowSpan="2" className="border border-gray-300 px-3 py-2 text-left">Unit Type</th>
                    <th rowSpan="2" className="border border-gray-300 px-3 py-2 text-left">Range</th>
                    <th rowSpan="2" className="border border-gray-300 px-3 py-2 text-left">
                      {isMeasure ? 'Nominal/ Set Value on master' : 'Nominal/ Set Value on UUC'}
                    </th>
                    <th rowSpan="2" className="border border-gray-300 px-3 py-2 text-left">
                      {isMeasure ? 'Nominal/ Set Value on master' : 'Nominal/ Set Value on UUC'}
                    </th>
                    <th colSpan="5" className="border border-gray-300 px-3 py-2 text-center">
                      {isMeasure ? 'Observation on UUC' : 'Observation on Master'}
                    </th>
                    <th rowSpan="2" className="border border-gray-300 px-3 py-2 text-left">Average</th>
                    <th rowSpan="2" className="border border-gray-300 px-3 py-2 text-left">Error</th>
                  </tr>
                  <tr className="bg-gray-50 border-b border-gray-300">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <th key={num} className="border border-gray-300 px-3 py-2 text-left">
                        Observation {num}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(observationRows?.rows || []).slice(currentStartingRowIndex, currentStartingRowIndex + pointsCount).map((row, relativeRowIndex) => {
                    const actualRowIndex = currentStartingRowIndex + relativeRowIndex;
                    return (
                      <tr key={actualRowIndex} className="hover:bg-gray-50">
                        {row.map((cell, colIndex) => (
                          <td key={colIndex} className="border border-gray-300 px-3 py-2">
                            {cell}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default UCTable;
