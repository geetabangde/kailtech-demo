import { formatUncertaintyValue } from "./viewCmcUtils";

export const VcCmcTable = ({ data }) => (
  <div className="overflow-x-auto">
    <table className="w-full border-collapse text-[12px] text-gray-700 min-w-max">
      <thead>
        <tr className="bg-gray-100 text-center">
          <th colSpan="12" className="border border-gray-300 px-1 py-2 bg-gray-200 font-semibold text-xs">
            Type A Factor
          </th>
          <th colSpan="9" className="border border-gray-300 px-1 py-2 bg-gray-200 font-semibold text-xs">
            Type B Factor
          </th>
          <th colSpan="5" className="border border-gray-300 px-1 py-2 bg-gray-200 font-semibold text-xs">
            Uncertainty Measurement
          </th>
        </tr>
        <tr className="bg-gray-200 text-center text-[12px] font-medium">
          <th className="border border-gray-300 px-1 py-2 align-bottom">Sr no</th>
          <th className="border border-gray-300 px-1 py-2 align-bottom">Type Of Measurement</th>
          <th className="border border-gray-300 px-1 py-2 align-bottom">1</th>
          <th className="border border-gray-300 px-1 py-2 align-bottom">2</th>
          <th className="border border-gray-300 px-1 py-2 align-bottom">3</th>
          <th className="border border-gray-300 px-1 py-2 align-bottom">4</th>
          <th className="border border-gray-300 px-1 py-2 align-bottom">5</th>
          <th className="border border-gray-300 px-1 py-2 align-bottom">Unit</th>
          <th className="border border-gray-300 px-1 py-2 align-bottom">Calibration point</th>
          <th className="border border-gray-300 px-1 py-2 align-bottom">Average</th>
          <th className="border border-gray-300 px-1 py-2 align-bottom">Std Deviation</th>
          <th className="border border-gray-300 px-1 py-2 align-bottom">Type A</th>
          <th className="border border-gray-300 px-1 py-2 align-bottom">Uncertainty of<br />master in mm</th>
          <th className="border border-gray-300 px-1 py-2 align-bottom">Least Count<br />of UUC</th>
          <th className="border border-gray-300 px-1 py-2 align-bottom">Thermal<br />Coefficient<br />of Master</th>
          <th className="border border-gray-300 px-1 py-2 align-bottom">Thermal<br />Coefficient<br />of UUC</th>
          <th className="border border-gray-300 px-1 py-2 align-bottom">Uncertainty<br />due to<br />Temperature<br />Indicating<br />Device (mm)</th>
          <th className="border border-gray-300 px-1 py-2 align-bottom">Standard<br />uncertainty<br />due to the<br />thermal<br />coefficient<br />of<br />expansion<br />master and<br />Unit Under<br />Calibration<br />assuming<br />20% (mm)</th>
          <th className="border border-gray-300 px-1 py-2 align-bottom">Standard<br />uncertainty<br />due to the<br />difference<br />in<br />temperature<br />master and<br />Unit Under<br />Calibration<br />assuming<br />0.5˚C (mm)</th>
          <th className="border border-gray-300 px-1 py-2 align-bottom">Uncertainty<br />Due<br />Parallelism<br />in (mm)</th>
          <th className="border border-gray-300 px-1 py-2 align-bottom">Standard<br />uncertainty<br />due to Error<br />in Master<br />(Taken Half)<br />in mm</th>
          <th className="border border-gray-300 px-1 py-2 align-bottom">Combined<br />Uncertainty</th>
          <th className="border border-gray-300 px-1 py-2 align-bottom">Degree of<br />Freedom</th>
          <th className="border border-gray-300 px-1 py-2 align-bottom">Coverage<br />Factor (k)</th>
          <th className="border border-gray-300 px-1 py-2 align-bottom">Expanded<br />Uncertainty<br />in Value</th>
          <th className="border border-gray-300 px-1 py-2 align-bottom">CMC<br />taken</th>
        </tr>
      </thead>
      <tbody>
        {data.map((row, i) => (
          <tr key={i} className="hover:bg-gray-50 text-center text-[12px]">
            <td className="border border-gray-300 px-1 py-2">{row.srNo}</td>
            <td className="border border-gray-300 px-1 py-2 text-left">{row.typeOfMeasurement}</td>
            {row.values.map((v, idx) => (
              <td key={idx} className="border border-gray-300 px-1 py-2">{v}</td>
            ))}
            <td className="border border-gray-300 px-1 py-2">{row.unit}</td>
            <td className="border border-gray-300 px-1 py-2">{row.calibrationPoint}</td>
            <td className="border border-gray-300 px-1 py-2">{row.average}</td>
            <td className="border border-gray-300 px-1 py-2">{typeof row.stdDeviation === 'number' ? formatUncertaintyValue(row.stdDeviation, 6) : row.stdDeviation}</td>
            <td className="border border-gray-300 px-1 py-2">{typeof row.typeA === 'number' ? formatUncertaintyValue(row.typeA, 6) : row.typeA}</td>
            <td className="border border-gray-300 px-1 py-2">{typeof row.uncertaintyMaster === 'number' ? formatUncertaintyValue(row.uncertaintyMaster, 6) : row.uncertaintyMaster}</td>
            <td className="border border-gray-300 px-1 py-2">{row.leastCountUuc}</td>
            <td className="border border-gray-300 px-1 py-2">{typeof row.thermalCoeffMaster === 'number' ? formatUncertaintyValue(row.thermalCoeffMaster, 6) : row.thermalCoeffMaster}</td>
            <td className="border border-gray-300 px-1 py-2">{typeof row.thermalCoeffUuc === 'number' ? formatUncertaintyValue(row.thermalCoeffUuc, 6) : row.thermalCoeffUuc}</td>
            <td className="border border-gray-300 px-1 py-2">{typeof row.uncTempDevice === 'number' ? formatUncertaintyValue(row.uncTempDevice, 6) : row.uncTempDevice}</td>
            <td className="border border-gray-300 px-1 py-2">{typeof row.stdUncTher20 === 'number' ? formatUncertaintyValue(row.stdUncTher20, 6) : row.stdUncTher20}</td>
            <td className="border border-gray-300 px-1 py-2">{typeof row.stdUncDiff === 'number' ? formatUncertaintyValue(row.stdUncDiff, 6) : row.stdUncDiff}</td>
            <td className="border border-gray-300 px-1 py-2">{typeof row.uncParallelism === 'number' ? formatUncertaintyValue(row.uncParallelism, 6) : row.uncParallelism}</td>
            <td className="border border-gray-300 px-1 py-2">{typeof row.uncError === 'number' ? formatUncertaintyValue(row.uncError, 6) : row.uncError}</td>
            <td className="border border-gray-300 px-1 py-2">{typeof row.combinedUnc === 'number' ? formatUncertaintyValue(row.combinedUnc, 6) : row.combinedUnc}</td>
            <td className="border border-gray-300 px-1 py-2">{row.dof === '-' ? '-' : (typeof row.dof === 'number' ? formatUncertaintyValue(row.dof, 2) : row.dof)}</td>
            <td className="border border-gray-300 px-1 py-2">{typeof row.coverageFactor === 'number' ? formatUncertaintyValue(row.coverageFactor, 2) : row.coverageFactor}</td>
            <td className="border border-gray-300 px-1 py-2">{typeof row.expandedUnc === 'number' ? formatUncertaintyValue(row.expandedUnc, 6) : row.expandedUnc}</td>
            <td className="border border-gray-300 px-1 py-2">{typeof row.cmc === 'number' ? formatUncertaintyValue(row.cmc, 6) : row.cmc}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default VcCmcTable;
