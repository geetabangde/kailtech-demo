
export const TSTable = ({ observationRows }) => {
  const allRows = observationRows?.rows || [];
  const sieves = [];

  // Group rows into 5-cycle sets (each set represents 1 sieve / calibration point)
  for (let i = 0; i < allRows.length; i += 5) {
    const sieveRows = allRows.slice(i, i + 5);
    const nominalSize = observationRows?.hiddenInputs?.values?.[i] || '';
    sieves.push({
      nominalSize,
      rows: sieveRows,
    });
  }

  if (sieves.length === 0 && allRows.length > 0) {
    sieves.push({
      nominalSize: observationRows?.hiddenInputs?.values?.[0] || '',
      rows: allRows,
    });
  }

  return (
    <div className="space-y-6 mb-6">
      {sieves.map((sieve, sIdx) => (
        <div key={sIdx} className="overflow-x-auto border border-gray-300">
          <table className="w-full border-collapse text-sm">
            <thead>
              {/* Nominal Size of Sieve Header */}
              <tr className="bg-white border-b border-gray-300">
                <td colSpan={10} className="border border-gray-300 px-3 py-2 text-left font-medium text-gray-900">
                  Nominal Size of Sieve: {sieve.nominalSize}
                </td>
              </tr>
              {/* Warp and Weft Sub-section Headers */}
              <tr className="bg-gray-50 border-b border-gray-300">
                <td colSpan={5} className="border border-gray-300 px-3 py-2 text-left font-medium text-gray-700">
                  Aperture Size on Warp Side(in µm/mm)
                </td>
                <th colSpan={5} className="border border-gray-300 px-3 py-2 text-left font-medium text-gray-700">
                  Aperture Size on Weft Side(in µm/mm)
                </th>
              </tr>
              {/* Column Headers */}
              <tr className="bg-gray-100 border-b border-gray-300">
                <th className="border border-gray-300 px-3 py-2 text-left font-medium text-gray-700">Sr no</th>
                <th className="border border-gray-300 px-3 py-2 text-left font-medium text-gray-700">Aperture Size (1)</th>
                <th className="border border-gray-300 px-3 py-2 text-left font-medium text-gray-700">Aperture Size (2)</th>
                <th className="border border-gray-300 px-3 py-2 text-left font-medium text-gray-700">Aperture Size (3)</th>
                <th className="border border-gray-300 px-3 py-2 text-left font-medium text-gray-700">Aperture Size (4)</th>
                <th className="border border-gray-300 px-3 py-2 text-left font-medium text-gray-700">Aperture Size (1)</th>
                <th className="border border-gray-300 px-3 py-2 text-left font-medium text-gray-700">Aperture Size (2)</th>
                <th className="border border-gray-300 px-3 py-2 text-left font-medium text-gray-700">Aperture Size (3)</th>
                <th className="border border-gray-300 px-3 py-2 text-left font-medium text-gray-700">Aperture Size (4)</th>
                <th className="border border-gray-300 px-3 py-2 text-left font-medium text-gray-700">Average Aperture</th>
              </tr>
            </thead>
            <tbody>
              {sieve.rows.map((row, rIdx) => (
                <tr key={rIdx} className={rIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  {row.map((cell, cIdx) => (
                    <td key={cIdx} className="border border-gray-300 px-3 py-2 text-left">
                      {cell !== null && cell !== undefined ? cell : ''}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
};

export default TSTable;
