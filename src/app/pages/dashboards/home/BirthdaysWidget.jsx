import { useState } from "react";
import { Card } from "components/ui";
import { MinusIcon, XMarkIcon, GiftIcon } from "@heroicons/react/24/outline";

const getInitials = (name) => {
  if (!name) return "";
  // Strip common prefixes to get actual name initials
  const cleanName = name.replace(/^Er\.\s*/i, "").trim();
  const parts = cleanName.split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return cleanName.substring(0, 2).toUpperCase();
};

const getBirthdayStatus = (dateString) => {
  if (!dateString) return "Has a birthday coming up!";
  const parts = dateString.split(" "); // e.g. ["09", "Aug"]
  if (parts.length < 2) return "Has a birthday coming up!";
  
  const bDay = parseInt(parts[0], 10);
  const bMonth = parts[1].substring(0, 3).toLowerCase();
  
  const today = new Date();
  const currentDay = today.getDate();
  const currentMonth = today.toLocaleString('default', { month: 'short' }).toLowerCase();

  const months = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
  const bMonthIdx = months.indexOf(bMonth);
  const currentMonthIdx = months.indexOf(currentMonth);

  if (bMonthIdx < currentMonthIdx) {
    return "Birthday has passed!";
  } else if (bMonthIdx > currentMonthIdx) {
    return "Has a birthday coming up!";
  } else {
    // Same month
    if (bDay < currentDay) {
      return "Birthday has passed!";
    } else if (bDay > currentDay) {
      return "Has a birthday coming up!";
    } else {
      return "Happy Birthday! ✨";
    }
  }
};

export function BirthdaysWidget({ data }) {
  const [isVisible, setIsVisible] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);

  const birthdays = data || [];

  if (!isVisible) return null;

  return (
    <div className="flex flex-col w-full">
      <div className="table-toolbar flex items-center justify-between mb-3">
        <h2 className="truncate text-base font-medium tracking-wide text-gray-800 dark:text-dark-100">
          Birthdays in this month ({birthdays.length})
        </h2>
        <div className="flex items-center space-x-2 text-gray-500">
          <button 
            type="button" 
            onClick={() => setIsMinimized(!isMinimized)} 
            className="hover:text-gray-800 dark:hover:text-dark-100"
            title={isMinimized ? "Maximize" : "Minimize"}
          >
            <MinusIcon className="h-5 w-5" />
          </button>
          <button 
            type="button" 
            onClick={() => setIsVisible(false)} 
            className="hover:text-gray-800 dark:hover:text-dark-100"
            title="Close"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
      {!isMinimized && (
        <Card className="relative mt-1 flex grow flex-col p-0 overflow-hidden border-gray-200 dark:border-dark-500 shadow-sm">
          <div className="flex flex-col divide-y divide-gray-100 dark:divide-dark-500 max-h-[400px] overflow-y-auto">
            {birthdays.map((bday, idx) => {
              const statusText = getBirthdayStatus(bday.birthday);
              const isToday = statusText.includes("Happy Birthday");
              
              return (
                <div 
                  key={idx} 
                  className={`group flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-dark-800/50 transition-colors duration-200 cursor-default ${isToday ? 'bg-indigo-50/50 dark:bg-indigo-900/10' : ''}`}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white font-bold shadow-sm transition-transform duration-200 group-hover:scale-110 ${isToday ? 'bg-gradient-to-br from-pink-500 to-rose-600 animate-pulse' : 'bg-gradient-to-br from-indigo-500 to-purple-600'}`}>
                      {getInitials(bday.name)}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                        {bday.name}
                      </span>
                      <span className={`text-xs mt-0.5 ${isToday ? 'text-pink-600 dark:text-pink-400 font-medium' : 'text-gray-500 dark:text-gray-400'}`}>
                        {statusText}
                      </span>
                    </div>
                  </div>
                  <div className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-bold shadow-sm ${isToday ? 'bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'}`}>
                    <GiftIcon className={`w-3.5 h-3.5 ${isToday ? 'animate-bounce' : ''}`} />
                    <span>{bday.birthday}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}
