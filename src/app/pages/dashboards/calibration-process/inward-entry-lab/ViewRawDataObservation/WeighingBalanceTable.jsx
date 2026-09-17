
export const WeighingBalanceTable = ({ observationRows, diagram }) => {
  const weighingCount = observationRows?.weighingCount || 0;
  const repeatabilityCount = observationRows?.repeatabilityCount || 0;
  const eccentricityCount = observationRows?.eccentricityCount || 0;

  return (
    <div className="space-y-8 print:space-y-6">
      {/* Diagram Selection Display */}
      {diagram && (
        <div className="mb-6 flex flex-col items-center gap-2">
          <h4 className="font-semibold text-sm">Selected Diagram: {diagram === 'circalimg' ? 'Circular Diagram' : 'Rectangular Diagram'}</h4>
          <img
            src={diagram === 'circalimg' ? '/images/circalimg.png' : '/images/newrectangle.png'}
            alt="Selected Diagram"
            className="h-32 object-contain border border-gray-200 p-2 rounded"
          />
        </div>
      )}

      {/* 1. Weighing Process Table */}
      {weighingCount > 0 && (
        <div>
          <h4 className="font-semibold mb-2 text-sm bg-gray-100 p-2 border border-gray-300">Weighing Process</h4>
          <div className="overflow-x-auto">
            <table className="w-full border border-gray-300 text-sm border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-300">
                  <th className="border border-gray-300 px-3 py-2 text-left font-medium text-gray-700">Sr. No.</th>
                  <th className="border border-gray-300 px-3 py-2 text-left font-medium text-gray-700">Nominal Value</th>
                  <th colSpan="3" className="border border-gray-300 px-3 py-2 text-center font-medium text-gray-700">Reading</th>
                  <th className="border border-gray-300 px-3 py-2 text-left font-medium text-gray-700">Average</th>
                  <th className="border border-gray-300 px-3 py-2 text-left font-medium text-gray-700">Error</th>
                </tr>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300"></th>
                  <th className="border border-gray-300"></th>
                  <th className="border border-gray-300 px-2 py-1 text-center text-xs font-medium text-gray-600">1</th>
                  <th className="border border-gray-300 px-2 py-1 text-center text-xs font-medium text-gray-600">2</th>
                  <th className="border border-gray-300 px-2 py-1 text-center text-xs font-medium text-gray-600">3</th>
                  <th className="border border-gray-300"></th>
                  <th className="border border-gray-300"></th>
                </tr>
              </thead>
              <tbody>
                {(observationRows?.rows || []).slice(0, weighingCount).map((row, rowIndex) => (
                  <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    {row.map((cell, colIndex) => (
                      <td key={colIndex} className="border border-gray-300 px-3 py-2 text-center">
                        {cell || ''}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. Repeatability Table */}
      {repeatabilityCount > 0 && (
        <div>
          <h4 className="font-semibold mb-2 text-sm bg-gray-100 p-2 border border-gray-300">Repeatability</h4>
          <div className="overflow-x-auto">
            <table className="w-full border border-gray-300 text-sm border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-300">
                  <th className="border border-gray-300 px-3 py-2 text-left font-medium text-gray-700">Nominal Value</th>
                  <th colSpan="10" className="border border-gray-300 px-3 py-2 text-center font-medium text-gray-700">Reading on UUC</th>
                  <th className="border border-gray-300 px-3 py-2 text-left font-medium text-gray-700">Average</th>
                </tr>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300"></th>
                  {Array.from({ length: 10 }).map((_, i) => (
                    <th key={i} className="border border-gray-300 px-2 py-1 text-center text-xs font-medium text-gray-600">{i + 1}</th>
                  ))}
                  <th className="border border-gray-300"></th>
                </tr>
              </thead>
              <tbody>
                {(observationRows?.rows || []).slice(weighingCount, weighingCount + repeatabilityCount).map((row, rowIndex) => (
                  <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    {row.map((cell, colIndex) => (
                      <td key={colIndex} className="border border-gray-300 px-3 py-2 text-center">
                        {cell || ''}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. Eccentricity Table */}
      {eccentricityCount > 0 && (
        <div>
          <h4 className="font-semibold mb-2 text-sm bg-gray-100 p-2 border border-gray-300">Eccentricity</h4>
          <div className="overflow-x-auto">
            <table className="w-full border border-gray-300 text-sm border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-300">
                  <th className="border border-gray-300 px-3 py-2 text-left font-medium text-gray-700">Nominal Value</th>
                  <th colSpan="5" className="border border-gray-300 px-3 py-2 text-center font-medium text-gray-700">Reading on Clockwise</th>
                  <th colSpan="5" className="border border-gray-300 px-3 py-2 text-center font-medium text-gray-700">Reading on Anticlockwise</th>
                  <th className="border border-gray-300 px-3 py-2 text-left font-medium text-gray-700">D=Ec (Max-Min)/2</th>
                </tr>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300"></th>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <th key={i} className="border border-gray-300 px-2 py-1 text-center text-xs font-medium text-gray-600">{i + 1}</th>
                  ))}
                  {Array.from({ length: 5 }).map((_, i) => (
                    <th key={i + 5} className="border border-gray-300 px-2 py-1 text-center text-xs font-medium text-gray-600">{i + 1}</th>
                  ))}
                  <th className="border border-gray-300"></th>
                </tr>
              </thead>
              <tbody>
                {(observationRows?.rows || []).slice(weighingCount + repeatabilityCount).map((row, rowIndex) => (
                  <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    {row.map((cell, colIndex) => (
                      <td key={colIndex} className="border border-gray-300 px-3 py-2 text-center">
                        {cell || ''}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default WeighingBalanceTable;
