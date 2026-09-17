export const DpgCmcTable = ({ data }) => (
  <div className="overflow-x-auto">
    <table className="w-full border-collapse text-[12px] text-gray-700 min-w-max">
      <thead>
        <tr className="bg-gray-200 text-center text-xs font-medium">
          <th className="border border-gray-300 px-2 py-2">Sr No</th>
          <th className="border border-gray-300 px-2 py-2">Set Pressure on UUC</th>
          <th className="border border-gray-300 px-2 py-2">M1</th>
          <th className="border border-gray-300 px-2 py-2">M2</th>
          <th className="border border-gray-300 px-2 py-2">M3</th>
          <th className="border border-gray-300 px-2 py-2">Mean (bar)</th>
          <th className="border border-gray-300 px-2 py-2">Error (bar)</th>
          <th className="border border-gray-300 px-2 py-2">Max Zero Error</th>
          <th className="border border-gray-300 px-2 py-2">Hysterisis (bar)</th>
          <th className="border border-gray-300 px-2 py-2">Repeatability (bar)</th>
          <th className="border border-gray-300 px-2 py-2">Least Count of UUC</th>
          <th className="border border-gray-300 px-2 py-2">Uncertainty of Master</th>
          <th className="border border-gray-300 px-2 py-2">Combined Uncertainty</th>
          <th className="border border-gray-300 px-2 py-2">Degree of Freedom</th>
          <th className="border border-gray-300 px-2 py-2">Coverage Factor</th>
          <th className="border border-gray-300 px-2 py-2">Expanded Uncertainty</th>
          <th className="border border-gray-300 px-2 py-2">CMC Taken</th>
          <th className="border border-gray-300 px-2 py-2">CMC Scope</th>
        </tr>
      </thead>
      <tbody>
        {data.map((row, i) => (
          <tr key={i} className="hover:bg-gray-50 text-center">
            <td className="border border-gray-300 px-2 py-2">{row.srNo}</td>
            <td className="border border-gray-300 px-2 py-2">{row.setPressure}</td>
            <td className="border border-gray-300 px-2 py-2">{row.m1}</td>
            <td className="border border-gray-300 px-2 py-2">{row.m2}</td>
            <td className="border border-gray-300 px-2 py-2">{row.m3}</td>
            <td className="border border-gray-300 px-2 py-2">{row.mean}</td>
            <td className="border border-gray-300 px-2 py-2">{row.error}</td>
            <td className="border border-gray-300 px-2 py-2">{row.maxZeroError}</td>
            <td className="border border-gray-300 px-2 py-2">{row.hysterisis}</td>
            <td className="border border-gray-300 px-2 py-2">{row.repeatability}</td>
            <td className="border border-gray-300 px-2 py-2">{row.leastcount}</td>
            <td className="border border-gray-300 px-2 py-2">{row.masterUncertainty}</td>
            <td className="border border-gray-300 px-2 py-2">{row.combinedUncertainty}</td>
            <td className="border border-gray-300 px-2 py-2">{row.degreeOfFreedom}</td>
            <td className="border border-gray-300 px-2 py-2">{row.coverageFactor}</td>
            <td className="border border-gray-300 px-2 py-2">{row.expandedUncertainty}</td>
            <td className="border border-gray-300 px-2 py-2">{row.cmcTaken}</td>
            <td className="border border-gray-300 px-2 py-2">{row.cmcScope}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default DpgCmcTable;
