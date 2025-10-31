"use client";
import React, { useState } from "react";
import { Modal, Tab } from "@/components/ui"; // Assume Modal and Tab are reusable components
import { useI18n } from "@/components/i18n/I18nProvider";
import useSWR from "swr";
import { fetcher } from "@/utils/fetcher";

const API_BASE = "/api";

export const Timetable: React.FC = () => {
  const { t } = useI18n();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const { data: timetableData, mutate } = useSWR(`${API_BASE}/timetable`, fetcher);

  const handleAddSchedule = () => {
    setModalOpen(true);
  };

  const handleSaveSchedule = async (schedule: any) => {
    try {
      const response = await fetch(`${API_BASE}/timetable`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(schedule),
      });
      if (response.ok) {
        mutate();
        setModalOpen(false);
      } else {
        console.error("Failed to save schedule");
      }
    } catch (error) {
      console.error("Error saving schedule:", error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">{t("timetable", "Timetable")}</h1>
        <button
          onClick={handleAddSchedule}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg"
        >
          {t("add_schedule", "Add Schedule")}
        </button>
      </div>
      <Tab>
        {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map((day, index) => (
          <Tab.Panel key={index} title={t(day.toLowerCase(), day)}>
            <div>
              {timetableData?.[day.toLowerCase()]?.map((schedule: any) => (
                <div key={schedule.id} className="p-2 border-b">
                  {schedule.subject} - {schedule.start_time} to {schedule.end_time}
                </div>
              ))}
            </div>
          </Tab.Panel>
        ))}
      </Tab>
      {modalOpen && (
        <Modal onClose={() => setModalOpen(false)}>
          <div>
            <h2>{t("add_schedule", "Add Schedule")}</h2>
            {/* Form for adding schedule */}
            <button onClick={() => handleSaveSchedule({ day: selectedDay })}>
              {t("save", "Save")}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Timetable;
