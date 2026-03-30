"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { InventoryRow, LoanRow } from "@/services/lib/types";
import LowStockChart from "./LowStockItems";
import TypeDistributionChart from "./EquipmentTypeDistribution";
import PopularityChart from "./EquipmentTypePopularity";
import DemandItemsChart from "./DemandItems";
import {
  buildLowStockData,
  buildEqTypeDistribution,
  buildEqTypePopularity,
  buildDemandData,
} from "@/services/lib/analytics";

interface ChartCarouselProps {
  inventory: InventoryRow[];
  loans: LoanRow[];
}

export default function ChartCarousel({
  inventory,
  loans,
}: ChartCarouselProps) {
  const [index, setIndex] = useState(0);

  const slides = [
    {
      title: "Equipment Type Distribution",
      chart: (
        <TypeDistributionChart
          data={buildEqTypeDistribution(inventory).map((d) => ({
            category: d.equipmentType,
            count: d.count,
          }))}
        />
      ),
    },

    {
      title: "Most Demanded Items",
      chart: (
        <DemandItemsChart
          data={buildDemandData(loans).map((d) => ({
            name: d.name,
            borrowed: d.totalLoans,
          }))}
        />
      ),
    },

    {
      title: "Popularity by Equipment Type",
      chart: (
        <PopularityChart
          data={buildEqTypePopularity(inventory).map((d) => ({
            name: d.type,
            borrowed: d.borrowed,
          }))}
        />
      ),
    },

    {
      title: "Low Stock Items",
      chart: (
        <LowStockChart
          data={buildLowStockData(inventory).map((i) => ({
            name: i.name,
            net_stock: i.available,
          }))}
        />
      ),
    },
  ];

  const prev = () => setIndex((i) => (i - 1 + slides.length) % slides.length);
  const next = () => setIndex((i) => (i + 1) % slides.length);

  return (
    <div className="flex flex-col gap-3 p-4 h-full">
      <div className="flex items-center justify-between">
        <h3 className="font-mp text-sm font-semibold text-neutral-700">
          {slides[index].title}
        </h3>
        <div className="flex items-center gap-1">
          <button
            onClick={prev}
            className="p-1.5 rounded-lg border border-neutral-200 hover:bg-neutral-50 text-neutral-500 transition-all"
          >
            <ChevronLeft size={15} />
          </button>
          <span className="text-xs font-mp text-neutral-400 px-1">
            {index + 1} / {slides.length}
          </span>
          <button
            onClick={next}
            className="p-1.5 rounded-lg border border-neutral-200 hover:bg-neutral-50 text-neutral-500 transition-all"
          >
            <ChevronRight size={15} />
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-0">{slides[index].chart}</div>

      <div className="flex justify-center gap-1.5">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className={`w-1.5 h-1.5 rounded-full transition-all duration-200 ${
              i === index ? "bg-neutral-700 w-3" : "bg-neutral-300"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
