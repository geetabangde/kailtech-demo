
export const TMTable = ({ observationRows }) => {
  return (
    <div className="overflow-x-auto mb-6">
      <table className="w-full border border-gray-300 text-sm">
        <thead>
          <tr className="bg-gray-100">
            <th rowSpan="2" className="border border-gray-300 px-4 py-2 text-center font-medium text-gray-700">Sr. No.</th>
            <th rowSpan="2" className="border border-gray-300 px-4 py-2 text-center font-medium text-gray-700">Parameter</th>
            <th rowSpan="2" className="border border-gray-300 px-4 py-2 text-center font-medium text-gray-700">Nominal/ Set Value</th>
            <th rowSpan="2" className="border border-gray-300 px-4 py-2 text-center font-medium text-gray-700">Range</th>
            <th rowSpan="2" className="border border-gray-300 px-4 py-2 text-center font-medium text-gray-700">Value Shown on</th>
            <th colSpan="5" className="border border-gray-300 px-4 py-2 text-center font-medium text-gray-700">Observation</th>
            <th rowSpan="2" className="border border-gray-300 px-4 py-2 text-center font-medium text-gray-700">Average</th>
            <th rowSpan="2" className="border border-gray-300 px-4 py-2 text-center font-medium text-gray-700">Error</th>
          </tr>
          <tr className="bg-gray-50">
            <th className="border border-gray-300 px-4 py-2 text-center text-xs font-medium text-gray-500">1&6</th>
            <th className="border border-gray-300 px-4 py-2 text-center text-xs font-medium text-gray-500">2&7</th>
            <th className="border border-gray-300 px-4 py-2 text-center text-xs font-medium text-gray-500">3&8</th>
            <th className="border border-gray-300 px-4 py-2 text-center text-xs font-medium text-gray-500">4&9</th>
            <th className="border border-gray-300 px-4 py-2 text-center text-xs font-medium text-gray-500">5&10</th>
          </tr>
        </thead>
        {(observationRows?.rows || []).map((row, rowIndex) => {
          return (
            <tbody key={rowIndex}>
              {/* UUC Row 1 (Obs 1-5) */}
              <tr>
                <td rowSpan="4" className="border border-gray-300 px-4 py-2 text-center">{row[0]}</td>
                <td rowSpan="4" className="border border-gray-300 px-4 py-2 text-center">{row[1]}</td>
                <td rowSpan="4" className="border border-gray-300 px-4 py-2 text-center">{row[2]}</td>
                <td rowSpan="4" className="border border-gray-300 px-4 py-2 text-center">{row[3]}</td>
                <td rowSpan="2" className="border border-gray-300 px-4 py-2 text-center font-medium bg-gray-50">UUC</td>
                <td className="border border-gray-300 px-4 py-2 text-center">{row[4]}</td>
                <td className="border border-gray-300 px-4 py-2 text-center">{row[5]}</td>
                <td className="border border-gray-300 px-4 py-2 text-center">{row[6]}</td>
                <td className="border border-gray-300 px-4 py-2 text-center">{row[7]}</td>
                <td className="border border-gray-300 px-4 py-2 text-center">{row[8]}</td>
                <td rowSpan="2" className="border border-gray-300 px-4 py-2 text-center bg-gray-50">{row[24]}</td>
                <td rowSpan="4" className="border border-gray-300 px-4 py-2 text-center bg-gray-50">{row[25]}</td>
              </tr>
              {/* UUC Row 2 (Obs 6-10) */}
              <tr>
                <td className="border border-gray-300 px-4 py-2 text-center">{row[9]}</td>
                <td className="border border-gray-300 px-4 py-2 text-center">{row[10]}</td>
                <td className="border border-gray-300 px-4 py-2 text-center">{row[11]}</td>
                <td className="border border-gray-300 px-4 py-2 text-center">{row[12]}</td>
                <td className="border border-gray-300 px-4 py-2 text-center">{row[13]}</td>
              </tr>
              {/* Master Row 1 (Obs 1-5) */}
              <tr>
                <td rowSpan="2" className="border border-gray-300 px-4 py-2 text-center font-medium bg-gray-50">Master</td>
                <td className="border border-gray-300 px-4 py-2 text-center">{row[14]}</td>
                <td className="border border-gray-300 px-4 py-2 text-center">{row[15]}</td>
                <td className="border border-gray-300 px-4 py-2 text-center">{row[16]}</td>
                <td className="border border-gray-300 px-4 py-2 text-center">{row[17]}</td>
                <td className="border border-gray-300 px-4 py-2 text-center">{row[18]}</td>
                <td rowSpan="2" className="border border-gray-300 px-4 py-2 text-center bg-gray-50">{row[26]}</td>
              </tr>
              {/* Master Row 2 (Obs 6-10) */}
              <tr>
                <td className="border border-gray-300 px-4 py-2 text-center">{row[19]}</td>
                <td className="border border-gray-300 px-4 py-2 text-center">{row[20]}</td>
                <td className="border border-gray-300 px-4 py-2 text-center">{row[21]}</td>
                <td className="border border-gray-300 px-4 py-2 text-center">{row[22]}</td>
                <td className="border border-gray-300 px-4 py-2 text-center">{row[23]}</td>
              </tr>
            </tbody>
          );
        })}
      </table>
    </div>
  );
};

export default TMTable;
