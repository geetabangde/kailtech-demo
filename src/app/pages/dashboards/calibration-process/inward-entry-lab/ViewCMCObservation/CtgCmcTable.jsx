export const CtgCmcTable = ({ data }) => (
  <div className="overflow-x-auto">
    <table className="w-full border-collapse text-[12px] text-gray-700">
      <thead>
        <tr className="bg-gray-100">
          <th colSpan="12" className="border border-gray-300 px-2 py-2 bg-gray-200 font-semibold text-center">
            Type A Factor
          </th>
          <th colSpan="2" className="border border-gray-300 px-2 py-2 bg-gray-200 font-semibold text-center">
            Type B Factor
          </th>
          <th colSpan="4" className="border border-gray-300 px-2 py-2 bg-gray-200 font-semibold text-center">
            Uncertainty Measurement
          </th>
        </tr>
        <tr className="bg-gray-200 text-center text-[12px] font-medium">
          <th className="border border-gray-300 px-2 py-2">Sr No</th>
          <th className="border border-gray-300 px-2 py-2">Type Of Measurement</th>
          <th className="border border-gray-300 px-2 py-2">1</th>
          <th className="border border-gray-300 px-2 py-2">2</th>
          <th className="border border-gray-300 px-2 py-2">3</th>
          <th className="border border-gray-300 px-2 py-2">4</th>
          <th className="border border-gray-300 px-2 py-2">5</th>
          <th className="border border-gray-300 px-2 py-2">Unit</th>
          <th className="border border-gray-300 px-2 py-2">Calibration Point</th>
          <th className="border border-gray-300 px-2 py-2">Average</th>
          <th className="border border-gray-300 px-2 py-2">Std Deviation</th>
          <th className="border border-gray-300 px-2 py-2">Type A</th>
          <th className="border border-gray-300 px-2 py-2">Uncertainty of Master in mm</th>
          <th className="border border-gray-300 px-2 py-2">Least Count of UUC</th>
          <th className="border border-gray-300 px-2 py-2">Combined Uncertainty</th>
          <th className="border border-gray-300 px-2 py-2">Degree of Freedom</th>
          <th className="border border-gray-300 px-2 py-2">Coverage Factor (k)</th>
          <th className="border border-gray-300 px-2 py-2">Expanded Uncertainty</th>
        </tr>
      </thead>
      <tbody>
        {data.map((row, i) => (
          <tr key={i} className="hover:bg-gray-50">
            <td className="border border-gray-300 px-2 py-3 text-center">{row.srNo}</td>
            <td className="border border-gray-300 px-2 py-3">{row.typeOfMeasurement}</td>
            {row.values.map((v, idx) => (
              <td key={idx} className="border border-gray-300 px-2 py-3 text-center">
                {v}
              </td>
            ))}
            <td className="border border-gray-300 px-2 py-3 text-center">{row.unit}</td>
            <td className="border border-gray-300 px-2 py-3 text-center">{row.calibrationPoint}</td>
            <td className="border border-gray-300 px-2 py-3 text-center">{row.average}</td>
            <td className="border border-gray-300 px-2 py-3 text-center">{row.stdDeviation}</td>
            <td className="border border-gray-300 px-2 py-3 text-center">{row.typeA}</td>
            <td className="border border-gray-300 px-2 py-3 text-center">{row.uncertaintyOfMaster}</td>
            <td className="border border-gray-300 px-2 py-3 text-center">{row.leastCount}</td>
            <td className="border border-gray-300 px-2 py-3 text-center">{row.combinedUnc}</td>
            <td className="border border-gray-300 px-2 py-3 text-center">{row.dof}</td>
            <td className="border border-gray-300 px-2 py-3 text-center">{row.coverageFactor}</td>
            <td className="border border-gray-300 px-2 py-3 text-center">{row.expandedUnc} μm</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default CtgCmcTable;
