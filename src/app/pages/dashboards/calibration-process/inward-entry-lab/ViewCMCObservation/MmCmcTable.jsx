import { formatUncertaintyValue } from "./viewCmcUtils";

export const MmCmcTable = ({ data }) => (
  <div className="overflow-x-auto">
    <table className="w-full border-collapse text-[12px] text-gray-700 min-w-max">
      <thead>
        <tr className="bg-gray-100 text-center">
          <th colSpan="12" className="border border-gray-300 px-1 py-2 bg-gray-200 font-semibold text-xs">
            Uncertainty Type A
          </th>
          <th colSpan="4" className="border border-gray-300 px-1 py-2 bg-gray-200 font-semibold text-xs">
            Uncertainty Type B
          </th>
          <th colSpan="7" className="border border-gray-300 px-1 py-2 bg-gray-200 font-semibold text-xs">
            Combined Uncertainty
          </th>
        </tr>
        <tr className="bg-gray-200 text-center text-[12px] font-medium">
          <th className="border border-gray-300 px-1 py-2">Sr No</th>
          <th className="border border-gray-300 px-1 py-2">Unit Type</th>
          <th className="border border-gray-300 px-1 py-2">Mode</th>
          <th className="border border-gray-300 px-1 py-2">UUC 1</th>
          <th className="border border-gray-300 px-1 py-2">UUC 2</th>
          <th className="border border-gray-300 px-1 py-2">UUC 3</th>
          <th className="border border-gray-300 px-1 py-2">UUC 4</th>
          <th className="border border-gray-300 px-1 py-2">UUC 5</th>
          <th className="border border-gray-300 px-1 py-2">Unit</th>
          <th className="border border-gray-300 px-1 py-2">Calibration Point</th>
          <th className="border border-gray-300 px-1 py-2">Average</th>
          <th className="border border-gray-300 px-1 py-2">Std Deviation</th>
          <th className="border border-gray-300 px-1 py-2">Type A</th>
          <th className="border border-gray-300 px-1 py-2">Accuracy of Calibrator</th>
          <th className="border border-gray-300 px-1 py-2">Uncertainty of Master</th>
          <th className="border border-gray-300 px-1 py-2">Least Count of UUC</th>
          <th className="border border-gray-300 px-1 py-2">Combined Uncertainty</th>
          <th className="border border-gray-300 px-1 py-2">Degree of Freedom</th>
          <th className="border border-gray-300 px-1 py-2">Coverage Factor</th>
          <th className="border border-gray-300 px-1 py-2">Expanded Uncertainty Value</th>
          <th className="border border-gray-300 px-1 py-2">Expanded Uncertainty %</th>
          <th className="border border-gray-300 px-1 py-2">CMC Taken</th>
          <th className="border border-gray-300 px-1 py-2">CMC Scope</th>
        </tr>
      </thead>
      <tbody>
        {data.map((row, i) => (
          <tr key={i} className="hover:bg-gray-50 text-center text-[12px]">
            <td className="border border-gray-300 px-1 py-2">{row.srNo}</td>
            <td className="border border-gray-300 px-1 py-2">{row.unitType}</td>
            <td className="border border-gray-300 px-1 py-2">{row.mode}</td>
            <td className="border border-gray-300 px-1 py-2">{row.uuc0}</td>
            <td className="border border-gray-300 px-1 py-2">{row.uuc1}</td>
            <td className="border border-gray-300 px-1 py-2">{row.uuc2}</td>
            <td className="border border-gray-300 px-1 py-2">{row.uuc3}</td>
            <td className="border border-gray-300 px-1 py-2">{row.uuc4}</td>
            <td className="border border-gray-300 px-1 py-2">{row.unit}</td>
            <td className="border border-gray-300 px-1 py-2">{row.calibrationPoint}</td>
            <td className="border border-gray-300 px-1 py-2">{row.average}</td>
            <td className="border border-gray-300 px-1 py-2">{typeof row.stdDeviation === 'number' ? formatUncertaintyValue(row.stdDeviation, 6) : row.stdDeviation}</td>
            <td className="border border-gray-300 px-1 py-2">{typeof row.typeA === 'number' ? formatUncertaintyValue(row.typeA, 6) : row.typeA}</td>
            <td className="border border-gray-300 px-1 py-2">{typeof row.accuracyOfCalibrator === 'number' ? row.accuracyOfCalibrator.toFixed(6) : row.accuracyOfCalibrator}</td>
            <td className="border border-gray-300 px-1 py-2">{typeof row.uncertaintyOfMaster === 'number' ? row.uncertaintyOfMaster.toFixed(6) : row.uncertaintyOfMaster}</td>
            <td className="border border-gray-300 px-1 py-2">{row.leastCountOfUuc}</td>
            <td className="border border-gray-300 px-1 py-2">{typeof row.combinedUncertainty === 'number' ? row.combinedUncertainty.toFixed(6) : row.combinedUncertainty}</td>
            <td className="border border-gray-300 px-1 py-2">{row.degreeOfFreedom === '-' ? '-' : (typeof row.degreeOfFreedom === 'number' ? row.degreeOfFreedom.toFixed(2) : row.degreeOfFreedom)}</td>
            <td className="border border-gray-300 px-1 py-2">{row.coverageFactor}</td>
            <td className="border border-gray-300 px-1 py-2">{typeof row.expandedUncertaintyValue === 'number' ? row.expandedUncertaintyValue.toFixed(6) : row.expandedUncertaintyValue}</td>
            <td className="border border-gray-300 px-1 py-2">{typeof row.expandedUncertaintyPercent === 'number' ? row.expandedUncertaintyPercent.toFixed(6) : row.expandedUncertaintyPercent}</td>
            <td className="border border-gray-300 px-1 py-2">{typeof row.cmcTaken === 'number' ? row.cmcTaken.toFixed(6) : row.cmcTaken}</td>
            <td className="border border-gray-300 px-1 py-2">{typeof row.cmcScope === 'number' ? row.cmcScope.toFixed(6) : row.cmcScope}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default MmCmcTable;
