import { formatValueByLc } from './viewRawDataUtils';

export const ViewObservationWBN = ({ observations = [] }) => {
    if (!observations || observations.length === 0) return null;

    // parseWBDynamicData returns an array with the observation data object as the first element
    let data = observations[0];

    // Handle nested observation_data structure from API response if present
    if (data?.observation_data) {
        data = data.observation_data;
    }

    const weighingProcess = data?.weighing_process;
    const repeatability = data?.repeatability;
    const eccentricity = data?.eccentricity;

    if (!weighingProcess && !repeatability && !eccentricity) {
        return (
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded">
                <p className="text-yellow-800 dark:text-yellow-200">No calibration points available for WBN Observation</p>
            </div>
        );
    }

    return (
        <div className="mb-8">
            <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4 uppercase">Weighing Balance (WBN) Observations</h3>

            {/* Weighing Process Section */}
            {weighingProcess && weighingProcess.rows && weighingProcess.rows.length > 0 && (
                <div className="mb-6">
                    <h4 className="text-lg font-medium text-gray-800 dark:text-white mb-3 bg-blue-50 dark:bg-blue-900 p-2 rounded">
                        {weighingProcess.title || 'Weighing Process'}
                    </h4>
                    <div className="overflow-x-auto border border-gray-200 dark:border-gray-600">
                        <table className="w-full text-sm border-collapse">
                            <thead>
                                <tr className="bg-gray-100 dark:bg-gray-700 border-b border-gray-300 dark:border-gray-600">
                                    {weighingProcess.headers && weighingProcess.headers.map((header, idx) => (
                                        <th key={idx} className="px-3 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-200 uppercase tracking-wider border-r border-gray-300 dark:border-gray-600">
                                            {header}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {weighingProcess.rows.map((row, rowIndex) => (
                                    <tr key={rowIndex} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                        <td className="px-3 py-2 text-sm border-r border-gray-200 dark:border-gray-600 dark:text-gray-200">{row.sr_no}</td>
                                        <td className="px-3 py-2 text-sm border-r border-gray-200 dark:border-gray-600 dark:text-gray-200">{row.nominal_value}</td>
                                        {/* W1, W2, W3 */}
                                        {row.uuc_observations && row.uuc_observations.map((obs, obsIdx) => (
                                            <td key={obsIdx} className="px-3 py-2 text-sm border-r border-gray-200 dark:border-gray-600 dark:text-gray-200">
                                                {obs.value !== undefined && obs.value !== null ? formatValueByLc(obs.value, null, row.least_count_uuc || '0.010') : ''}
                                                {row.master_unit && <span className="text-xs text-gray-500 ml-1">{row.master_unit}</span>}
                                            </td>
                                        ))}
                                        <td className="px-3 py-2 text-sm border-r border-gray-200 dark:border-gray-600 dark:text-gray-200">
                                            {row.average_uuc !== undefined && row.average_uuc !== null ? formatValueByLc(row.average_uuc, null, row.least_count_uuc || '0.010') : ''}
                                            {row.master_unit && <span className="text-xs text-gray-500 ml-1">{row.master_unit}</span>}
                                        </td>
                                        <td className="px-3 py-2 text-sm border-gray-200 dark:border-gray-600 dark:text-gray-200">
                                            {row.error !== undefined && row.error !== null ? formatValueByLc(row.error, null, row.least_count_uuc || '0.010') : ''}
                                            {row.master_unit && <span className="text-xs text-gray-500 ml-1">{row.master_unit}</span>}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Repeatability Section */}
            {repeatability && repeatability.rows && repeatability.rows.length > 0 && (
                <div className="mb-6">
                    <h4 className="text-lg font-medium text-gray-800 dark:text-white mb-3 bg-blue-50 dark:bg-blue-900 p-2 rounded">
                        {repeatability.title || 'Repeatability'}
                    </h4>
                    <div className="overflow-x-auto border border-gray-200 dark:border-gray-600">
                        <table className="w-full text-sm border-collapse">
                            <thead>
                                <tr className="bg-gray-100 dark:bg-gray-700 border-b border-gray-300 dark:border-gray-600">
                                    {repeatability.headers && repeatability.headers.map((header, idx) => (
                                        <th key={idx} className="px-3 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-200 uppercase tracking-wider border-r border-gray-300 dark:border-gray-600">
                                            {header}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {repeatability.rows.map((row, rowIndex) => (
                                    <tr key={rowIndex} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                        <td className="px-3 py-2 text-sm border-r border-gray-200 dark:border-gray-600 dark:text-gray-200">{row.nominal_value}</td>
                                        {/* R1-R5 */}
                                        {row.uucr_observations && row.uucr_observations.map((obs, obsIdx) => (
                                            <td key={obsIdx} className="px-3 py-2 text-sm border-r border-gray-200 dark:border-gray-600 dark:text-gray-200">
                                                {obs.value !== undefined && obs.value !== null ? formatValueByLc(obs.value, null, row.least_count_uuc || '0.010') : ''}
                                                {row.unit && <span className="text-xs text-gray-500 ml-1">{row.unit}</span>}
                                            </td>
                                        ))}
                                        <td className="px-3 py-2 text-sm border-gray-200 dark:border-gray-600 dark:text-gray-200">
                                            {row.average_uucr !== undefined && row.average_uucr !== null ? formatValueByLc(row.average_uucr, null, row.least_count_uuc || '0.010') : ''}
                                            {row.unit && <span className="text-xs text-gray-500 ml-1">{row.unit}</span>}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Eccentricity Section */}
            {eccentricity && eccentricity.rows && eccentricity.rows.length > 0 && (
                <div className="mb-6">
                    <h4 className="text-lg font-medium text-gray-800 dark:text-white mb-3 bg-blue-50 dark:bg-blue-900 p-2 rounded">
                        {eccentricity.title || 'Eccentricity'}
                    </h4>
                    <div className="overflow-x-auto border border-gray-200 dark:border-gray-600">
                        <table className="w-full text-sm border-collapse">
                            <thead>
                                <tr className="bg-gray-100 dark:bg-gray-700 border-b border-gray-300 dark:border-gray-600">
                                    {eccentricity.headers && eccentricity.headers.map((header, idx) => (
                                        <th key={idx} className="px-3 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-200 uppercase tracking-wider border-r border-gray-300 dark:border-gray-600">
                                            {header}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {eccentricity.rows.map((row, rowIndex) => (
                                    <tr key={rowIndex} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                        <td className="px-3 py-2 text-sm border-r border-gray-200 dark:border-gray-600 dark:text-gray-200">{row.nominal_value}</td>
                                        {/* Clockwise 1-5 */}
                                        {row.clockwise_observations && row.clockwise_observations.map((obs, obsIdx) => (
                                            <td key={`cw-${obsIdx}`} className="px-3 py-2 text-sm border-r border-gray-200 dark:border-gray-600 dark:text-gray-200">
                                                {obs.value !== undefined && obs.value !== null ? formatValueByLc(obs.value, null, row.least_count_uuc || '0.010') : ''}
                                                {row.unit && <span className="text-xs text-gray-500 ml-1">{row.unit}</span>}
                                            </td>
                                        ))}
                                        {/* Anticlockwise 1-5 */}
                                        {row.anticlockwise_observations && row.anticlockwise_observations.map((obs, obsIdx) => (
                                            <td key={`acw-${obsIdx}`} className="px-3 py-2 text-sm border-r border-gray-200 dark:border-gray-600 dark:text-gray-200">
                                                {obs.value !== undefined && obs.value !== null ? formatValueByLc(obs.value, null, row.least_count_uuc || '0.010') : ''}
                                                {row.unit && <span className="text-xs text-gray-500 ml-1">{row.unit}</span>}
                                            </td>
                                        ))}
                                        <td className="px-3 py-2 text-sm border-gray-200 dark:border-gray-600 dark:text-gray-200">
                                            {row.eccentricity_d_value !== undefined && row.eccentricity_d_value !== null ? formatValueByLc(row.eccentricity_d_value, null, row.least_count_uuc || '0.010') : ''}
                                            {row.unit && <span className="text-xs text-gray-500 ml-1">{row.unit}</span>}
                                        </td>
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