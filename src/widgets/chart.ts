import { formatCurrency, getPriceFractionDigits } from "@/lib/utils";
import ApexCharts, { ApexOptions } from "apexcharts";

export interface ChartPoint {
  x: number;
  y: number | number[];
}

const options: ApexOptions = {
  series: [
    {
      name: "Line chart",
      data: [],
    },
  ],
  stroke: {
    curve: "smooth",
    width: 1.7,
    colors: ["#6C9FCE"],
  },
  chart: {
    sparkline: {
      enabled: true,
    },
    type: "line",
    height: 70,
    width: "100%",
    zoom: {
      enabled: false,
    },
    toolbar: {
      show: false,
    },
  },
  tooltip: {
    enabled: false,
  },
  xaxis: {
    type: "datetime",
    labels: {
      show: false,
    },
    axisTicks: {
      show: false,
    },
    axisBorder: {
      show: false,
    },
  },
  yaxis: {
    labels: {
      show: false,
    },
    axisTicks: {
      show: false,
    },
    axisBorder: {
      show: false,
    },
  },
  grid: {
    show: false,
  },
  legend: {
    show: false,
  },
};

export default class Chart {
  private graph: ApexCharts;

  constructor(ref: HTMLDivElement, isCandlestick = false) {
    let graphOptions: ApexOptions = options;
    if (isCandlestick) {
      graphOptions = {
        ...options,
        chart: {
          ...options.chart,
          type: "candlestick",
        },
        tooltip: {
          ...options.tooltip,
          enabled: true,
          custom: function ({ seriesIndex, dataPointIndex, w }) {
            const date = new Date(
              w.globals.seriesX[seriesIndex][dataPointIndex]
            ).toLocaleString("en-US", {
              dateStyle: "medium",
              timeStyle: "short",
              hour12: false,
            });
            const o = w.globals.seriesCandleO[seriesIndex][dataPointIndex];
            const h = w.globals.seriesCandleH[seriesIndex][dataPointIndex];
            const l = w.globals.seriesCandleL[seriesIndex][dataPointIndex];
            const c = w.globals.seriesCandleC[seriesIndex][dataPointIndex];
            return (
              '<div class="font-bold">' +
              date +
              '</div>' +
              '<div class="apexcharts-tooltip-candlestick">' +
              '<div class="flex justify-between gap-1">Open: <span class="value">' +
              formatCurrency(o, getPriceFractionDigits(o)) +
              "</span></div>" +
              '<div class="flex justify-between gap-1">High: <span class="value">' +
              formatCurrency(h, getPriceFractionDigits(h)) +
              "</span></div>" +
              '<div class="flex justify-between gap-1">Low: <span class="value">' +
              formatCurrency(l, getPriceFractionDigits(l)) +
              "</span></div>" +
              '<div class="flex justify-between gap-1">Close: <span class="value">' +
              formatCurrency(c, getPriceFractionDigits(c)) +
              "</span></div>" +
              "</div>"
            );
          },
        },
      };
    }

    this.graph = new ApexCharts(ref, graphOptions);
    this.graph.render();
  }

  update(pointData: ChartPoint[]) {
    this.graph.updateSeries([{ data: pointData }]);
  }

  destroy() {
    this.graph.destroy();
  }
}
