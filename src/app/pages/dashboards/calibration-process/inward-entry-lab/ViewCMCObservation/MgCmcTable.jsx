export const MgCmcTable = ({ data }) => (
  <div className="overflow-x-auto">
    <table className="w-full border-collapse text-[12px] text-gray-700 min-w-max">
      <thead>
        <tr className="bg-gray-200 text-center text-xs font-medium">
          <th rowSpan="2" className="border border-gray-300 px-2 py-2">Sr no</th>
          <th rowSpan="2" className="border border-gray-300 px-2 py-2">Set Pressure on UUC</th>
          <th colSpan="2" className="border border-gray-300 px-2 py-2 bg-gray-300">
            Observation on master ({data[0]?.masterUnit || "Pa"})
          </th>
          <th rowSpan="2" className="border border-gray-300 px-2 py-2">Mean ({data[0]?.masterUnit || "Pa"})</th>
          <th rowSpan="2" className="border border-gray-300 px-2 py-2">Error ({data[0]?.masterUnit || "Pa"})</th>
          <th rowSpan="2" className="border border-gray-300 px-2 py-2">Max Zero Error</th>
          <th rowSpan="2" className="border border-gray-300 px-2 py-2">Hysterisis ({data[0]?.masterUnit || "Pa"})</th>
          <th rowSpan="2" className="border border-gray-300 px-2 py-2">Repeatability ({data[0]?.masterUnit || "Pa"})</th>
          <th rowSpan="2" className="border border-gray-300 px-2 py-2">Leastcount of UUC</th>
          <th rowSpan="2" className="border border-gray-300 px-2 py-2">Uncertainty of Master</th>
          <th rowSpan="2" className="border border-gray-300 px-2 py-2">Combined Uncertainty</th>
          <th rowSpan="2" className="border border-gray-300 px-2 py-2">Degree of Freedom</th>
          <th rowSpan="2" className="border border-gray-300 px-2 py-2">Coverage Factor</th>
          <th rowSpan="2" className="border border-gray-300 px-2 py-2">Expanded Uncertainty</th>
          <th rowSpan="2" className="border border-gray-300 px-2 py-2">CMC Taken</th>
        </tr>
        <tr className="bg-gray-200 text-center text-xs font-medium">
          <th className="border border-gray-300 px-2 py-2">M1</th>
          <th className="border border-gray-300 px-2 py-2">M2</th>
        </tr>
      </thead>
      <tbody>
        {data.map((row, i) => (
          <tr key={i} className="hover:bg-gray-50 text-center">
            <td className="border border-gray-300 px-2 py-2">{row.srNo}</td>
            <td className="border border-gray-300 px-2 py-2">{row.setPressure}</td>
            <td className="border border-gray-300 px-2 py-2">{row.masterObservationM1}</td>
            <td className="border border-gray-300 px-2 py-2">{row.masterObservationM2}</td>
            <td className="border border-gray-300 px-2 py-2">{typeof row.meanMaster === 'number' ? row.meanMaster.toFixed(2) : row.meanMaster}</td>
            <td className="border border-gray-300 px-2 py-2">{typeof row.error === 'number' ? row.error.toFixed(2) : row.error}</td>
            <td className="border border-gray-300 px-2 py-2">{typeof row.maxZeroError === 'number' ? row.maxZeroError.toFixed(4) : row.maxZeroError}</td>
            <td className="border border-gray-300 px-2 py-2">{typeof row.hysterisis === 'number' ? row.hysterisis.toFixed(2) : row.hysterisis}</td>
            <td className="border border-gray-300 px-2 py-2">{typeof row.repeatability === 'number' ? row.repeatability.toFixed(6) : row.repeatability}</td>
            <td className="border border-gray-300 px-2 py-2">{row.leastCountUuc}</td>
            <td className="border border-gray-300 px-2 py-2">{typeof row.uncertaintyMaster === 'number' ? row.uncertaintyMaster.toFixed(6) : row.uncertaintyMaster}</td>
            <td className="border border-gray-300 px-2 py-2">{typeof row.combinedUncertainty === 'number' ? row.combinedUncertainty.toFixed(6) : row.combinedUncertainty}</td>
            <td className="border border-gray-300 px-2 py-2">{row.degreeOfFreedom === '-' ? '-' : (typeof row.degreeOfFreedom === 'number' ? row.degreeOfFreedom.toFixed(2) : row.degreeOfFreedom)}</td>
            <td className="border border-gray-300 px-2 py-2">{typeof row.coverageFactor === 'number' ? row.coverageFactor.toFixed(2) : row.coverageFactor}</td>
            <td className="border border-gray-300 px-2 py-2">{typeof row.expandedUncertainty === 'number' ? row.expandedUncertainty.toFixed(6) : row.expandedUncertainty}</td>
            <td className="border border-gray-300 px-2 py-2">{typeof row.cmcTaken === 'number' ? row.cmcTaken.toFixed(6) : row.cmcTaken}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default MgCmcTable;
