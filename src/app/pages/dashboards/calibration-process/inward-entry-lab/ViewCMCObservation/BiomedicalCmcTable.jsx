export const BiomedicalTableWithData = ({ tableData = [] }) => {
  const headers = [
    'Sr No', 'Unit Type', 'Mode', '1', '2', '3', '4', '5', 'Unit',
    'Calibration Point', 'Average', 'Std Deviation', 'Type A',
    'Accuracy Of Calibrator in Value', 'Uncertainty of Master in %',
    'Least Count', 'Combined Uncertainty', 'Degree of Freedom',
    'Coverage Factor (k)', 'Expanded Uncertainty in Value',
    'Expanded Uncertainty in %', 'CMC Taken', 'CMC Scope'
  ];

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-[12px] text-gray-700 min-w-max">
        <thead>
          <tr className="bg-gray-100">
            <th colSpan="13" className="border border-gray-300 px-2 py-2 bg-gray-200 font-semibold text-center">Type A Factor</th>
            <th colSpan="3" className="border border-gray-300 px-2 py-2 bg-gray-200 font-semibold text-center">Type B Factor</th>
            <th colSpan="7" className="border border-gray-300 px-2 py-2 bg-gray-200 font-semibold text-center">Uncertainty Measurement</th>
          </tr>
          <tr className="bg-gray-200 text-center font-medium">
            {headers.map((header) => <th key={header} className="border border-gray-300 px-2 py-2">{header}</th>)}
          </tr>
        </thead>
        <tbody>
          {tableData.map((row, index) => {
            const values = Array.from({ length: 5 }, (_, readingIndex) => row.values?.[readingIndex] ?? '');
            const cells = [
              row.srNo, row.unitType, row.mode, ...values, row.unitDesc,
              row.calibrationPoint, row.average, row.stdDeviation, row.typeA,
              row.accuracyCalibrator, row.uncertaintyMaster, row.leastCount,
              row.combinedUnc, row.dof, row.coverageFactor, row.expandedUncValue,
              row.expandedUncPercent, row.cmcTaken, row.cmcScope
            ];

            return (
              <tr key={row.srNo ?? index} className="hover:bg-gray-50 text-center">
                {cells.map((value, cellIndex) => <td key={cellIndex} className="border border-gray-300 px-2 py-2">{value ?? ''}</td>)}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export const BiomedicalCmcTable = ({ data = [], electricSafetyData = [] }) => {
  return (
    <>
      {electricSafetyData.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Electric Safety</h3>
          <BiomedicalTableWithData tableData={electricSafetyData} />
        </div>
      )}
      {data.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Performance Test</h3>
          <BiomedicalTableWithData tableData={data} />
        </div>
      )}
    </>
  );
};

export default BiomedicalCmcTable;
