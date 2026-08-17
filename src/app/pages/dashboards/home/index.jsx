import { Page } from "components/shared/Page";
import { SplashScreen } from "components/template/SplashScreen";


import { NotificationTable } from "./NotificationTable";
import { PendingInstrumentsTable } from "./PendingInstrumentsTable";
import { BirthdaysWidget } from "./BirthdaysWidget";
import { MasterInstrumentsTable } from "./MasterInstrumentsTable";
import { ReportChemistsTable } from "./ReportChemistsTable";
import { TaskStatistics } from "./TaskStatistics";
import { BrnStatusPanels } from "./BrnStatusPanels";
import { MOMTasks } from "./MOMTasks";
import { useEffect, useState } from "react";
import axios from "utils/axios";

export default function Home() {
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const token = localStorage.getItem("authToken");
        const response = await axios.get("/dashboard/get-dashboard", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        if (response.data && response.data.success) {
          setDashboardData(response.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <Page title="Homepage">
      <div className="transition-content mt-5 min-h-screen w-full lg:mt-7 px-4 sm:px-4">
        <MOMTasks data={dashboardData?.mom_tasks} />
        <TaskStatistics data={dashboardData} />
        <BrnStatusPanels />
        <div className="mt-4 grid grid-cols-12 gap-4 sm:mt-5 sm:gap-5 lg:mt-6 lg:gap-6">
          <NotificationTable data={dashboardData?.notifications} />
          <PendingInstrumentsTable data={dashboardData?.pending_instruments} />
          <div className="col-span-12 flex flex-col gap-4 sm:gap-5 lg:gap-6">
            <MasterInstrumentsTable />
            <ReportChemistsTable />
            <BirthdaysWidget data={dashboardData?.birthdays} />
          </div>
        </div>
      </div>
    </Page>
  );
}
