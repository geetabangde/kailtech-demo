import { formatUncertaintyValue } from "./viewCmcUtils";

export const TmCmcTable = ({ data }) => (
  <div className="overflow-x-auto">
    <table className="w-full border-collapse text-[12px] text-gray-700 min-w-max">
      <thead>
        <tr className="bg-gray-100 text-center">
          <th colSpan="16" className="border border-gray-300 px-1 py-2 bg-gray-200 font-semibold text-xs">
            Type A Factor
          </th>
          <th colSpan="3" className="border border-gray-300 px-1 py-2 bg-gray-200 font-semibold text-xs">
            Type B Factor
          </th>
          <th colSpan="6" className="border border-gray-300 px-1 py-2 bg-gray-200 font-semibold text-xs">
            Uncertainty Measurement
          </th>
        </tr>
        <tr className="bg-gray-200 text-center text-[12px] font-medium">
          <th className="border border-gray-300 px-1 py-2">Sr no</th>
          <th className="border border-gray-300 px-1 py-2">1</th>
          <th className="border border-gray-300 px-1 py-2">2</th>
          <th className="border border-gray-300 px-1 py-2">3</th>
          <th className="border border-gray-300 px-1 py-2">4</th>
          <th className="border border-gray-300 px-1 py-2">5</th>
          <th className="border border-gray-300 px-1 py-2">6</th>
          <th className="border border-gray-300 px-1 py-2">7</th>
          <th className="border border-gray-300 px-1 py-2">8</th>
          <th className="border border-gray-300 px-1 py-2">9</th>
          <th className="border border-gray-300 px-1 py-2">10</th>
          <th className="border border-gray-300 px-1 py-2">Unit</th>
          <th className="border border-gray-300 px-1 py-2">Calibration point</th>
          <th className="border border-gray-300 px-1 py-2">Average</th>
          <th className="border border-gray-300 px-1 py-2">Std Deviation</th>
          <th className="border border-gray-300 px-1 py-2">Type A</th>
          <th className="border border-gray-300 px-1 py-2">Accuracy Of Calibrator in Value</th>
          <th className="border border-gray-300 px-1 py-2">Uncertainty of master in %</th>
          <th className="border border-gray-300 px-1 py-2">Least Count of UUC</th>
          <th className="border border-gray-300 px-1 py-2">Combined Uncertainty</th>
          <th className="border border-gray-300 px-1 py-2">Degree of Freedom</th>
          <th className="border border-gray-300 px-1 py-2">Coverage Factor (k)</th>
          <th className="border border-gray-300 px-1 py-2">Expanded Uncertainty in Value</th>
          <th className="border border-gray-300 px-1 py-2">Expanded Uncertainty in %</th>
          <th className="border border-gray-300 px-1 py-2">CMC Taken</th>
        </tr>
      </thead>
      <tbody>
        {data.map((row, i) => (
          <tr key={i} className="hover:bg-gray-50 text-center text-[12px]">
            <td className="border border-gray-300 px-1 py-2">{row.srNo}</td>
            {row.values.slice(0, 10).map((v, idx) => (
              <td key={idx} className="border border-gray-300 px-1 py-2">{v}</td>
            ))}
            <td className="border border-gray-300 px-1 py-2">{row.unit}</td>
            <td className="border border-gray-300 px-1 py-2">{row.calibrationPoint}</td>
            <td className="border border-gray-300 px-1 py-2">{typeof row.average === 'number' ? row.average.toFixed(6) : row.average}</td>
            <td className="border border-gray-300 px-1 py-2">{typeof row.stdDeviation === 'number' ? formatUncertaintyValue(row.stdDeviation, 6) : row.stdDeviation}</td>
            <td className="border border-gray-300 px-1 py-2">{typeof row.typeA === 'number' ? formatUncertaintyValue(row.typeA, 6) : row.typeA}</td>
            <td className="border border-gray-300 px-1 py-2">{typeof row.accuracyCalibrator === 'number' ? row.accuracyCalibrator.toFixed(6) : row.accuracyCalibrator}</td>
            <td className="border border-gray-300 px-1 py-2">{typeof row.uncertaintyMaster === 'number' ? row.uncertaintyMaster.toFixed(6) : row.uncertaintyMaster}</td>
            <td className="border border-gray-300 px-1 py-2">{row.leastCount}</td>
            <td className="border border-gray-300 px-1 py-2">{typeof row.combinedUnc === 'number' ? row.combinedUnc.toFixed(6) : row.combinedUnc}</td>
            <td className="border border-gray-300 px-1 py-2">{row.dof === '-' ? '-' : (typeof row.dof === 'number' ? row.dof.toFixed(2) : row.dof)}</td>
            <td className="border border-gray-300 px-1 py-2">{typeof row.coverageFactor === 'number' ? row.coverageFactor.toFixed(2) : row.coverageFactor}</td>
            <td className="border border-gray-300 px-1 py-2">{typeof row.expandedUncValue === 'number' ? row.expandedUncValue.toFixed(6) : row.expandedUncValue}</td>
            <td className="border border-gray-300 px-1 py-2">{typeof row.expandedUncPercent === 'number' ? row.expandedUncPercent.toFixed(6) : row.expandedUncPercent}</td>
            <td className="border border-gray-300 px-1 py-2">{typeof row.cmc === 'number' ? row.cmc.toFixed(6) : row.cmc}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default TmCmcTable;
