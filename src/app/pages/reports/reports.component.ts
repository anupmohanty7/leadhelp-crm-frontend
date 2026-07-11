import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';

import {
  ChartConfiguration,
  ChartData,
  ChartOptions
} from 'chart.js';

import { BaseChartDirective } from 'ng2-charts';
import { finalize, forkJoin } from 'rxjs';

import { LabelCount } from '../../shared/models/label-count';
import { ReportSummary } from '../../shared/models/report-summary';
import { ReportService } from '../../shared/services/report.service';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [
    CommonModule,
    BaseChartDirective
  ],
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.css'
})
export class ReportsComponent implements OnInit {

  loading = false;
  errorMessage = '';

  summary: ReportSummary = {
    totalLeads: 0,
    hotLeads: 0,
    warmLeads: 0,
    coldLeads: 0,
    closedWon: 0,
    closedLost: 0
  };

  statusChartData: ChartData<'bar'> = {
    labels: [],
    datasets: [
      {
        label: 'Leads',
        data: [],
        borderRadius: 8,
        maxBarThickness: 44
      }
    ]
  };

  leadTypeChartData: ChartData<'doughnut'> = {
    labels: [],
    datasets: [
      {
        data: []
      }
    ]
  };

  sourceChartData: ChartData<'pie'> = {
    labels: [],
    datasets: [
      {
        data: []
      }
    ]
  };

  readonly barChartOptions:
    ChartConfiguration<'bar'>['options'] = {

    responsive: true,
    maintainAspectRatio: false,

    plugins: {
      legend: {
        display: false
      }
    },

    scales: {
      x: {
        grid: {
          display: false
        }
      },

      y: {
        beginAtZero: true,

        ticks: {
          precision: 0
        }
      }
    }
  };

  readonly circularChartOptions:
    ChartOptions<'doughnut'> = {

    responsive: true,
    maintainAspectRatio: false,
    cutout: '64%',

    plugins: {
      legend: {
        position: 'bottom',

        labels: {
          usePointStyle: true,
          padding: 17
        }
      }
    }
  };

  readonly pieChartOptions:
    ChartOptions<'pie'> = {

    responsive: true,
    maintainAspectRatio: false,

    plugins: {
      legend: {
        position: 'bottom',

        labels: {
          usePointStyle: true,
          padding: 17
        }
      }
    }
  };

  constructor(
    private readonly reportService: ReportService
  ) {
  }

  ngOnInit(): void {
    this.loadReports();
  }

  loadReports(): void {
    this.loading = true;
    this.errorMessage = '';

    forkJoin({
      summary:
        this.reportService.getReportSummary(),

      statuses:
        this.reportService.getLeadsByStatus(),

      leadTypes:
        this.reportService.getLeadsByLeadType(),

      sources:
        this.reportService.getLeadsBySource()
    })
      .pipe(
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe({
        next: response => {
          this.summary = response.summary;

          this.statusChartData =
            this.createBarChart(response.statuses);

          this.leadTypeChartData =
            this.createDoughnutChart(
              response.leadTypes
            );

          this.sourceChartData =
            this.createPieChart(response.sources);
        },

        error: error => {
          console.error(error);

          this.errorMessage =
            'Unable to load reports. Make sure the backend is running.';
        }
      });
  }

  printReport(): void {
    window.print();
  }

  getConversionRate(): number {
    const completed =
      this.summary.closedWon +
      this.summary.closedLost;

    if (completed === 0) {
      return 0;
    }

    return Math.round(
      (
        this.summary.closedWon /
        completed
      ) * 100
    );
  }

  private createBarChart(
    values: LabelCount[]
  ): ChartData<'bar'> {

    return {
      labels: values.map(
        value => value.label
      ),

      datasets: [
        {
          label: 'Leads',
          data: values.map(
            value => value.count
          ),
          borderRadius: 8,
          maxBarThickness: 44
        }
      ]
    };
  }

  private createDoughnutChart(
    values: LabelCount[]
  ): ChartData<'doughnut'> {

    return {
      labels: values.map(
        value => value.label
      ),

      datasets: [
        {
          data: values.map(
            value => value.count
          )
        }
      ]
    };
  }

  private createPieChart(
    values: LabelCount[]
  ): ChartData<'pie'> {

    return {
      labels: values.map(
        value => value.label
      ),

      datasets: [
        {
          data: values.map(
            value => value.count
          )
        }
      ]
    };
  }
}