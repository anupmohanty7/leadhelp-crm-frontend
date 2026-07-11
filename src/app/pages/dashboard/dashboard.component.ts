import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';

import {
  RouterLink
} from '@angular/router';

import {
  ChartConfiguration,
  ChartData,
  ChartOptions
} from 'chart.js';

import {
  BaseChartDirective
} from 'ng2-charts';

import {
  forkJoin
} from 'rxjs';

import {
  DashboardResponse
} from '../../shared/models/dashboard-response';

import {
  LabelCount
} from '../../shared/models/label-count';

import {
  DashboardService
} from '../../shared/services/dashboard.service';

import {
  ReportService
} from '../../shared/services/report.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    BaseChartDirective
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {

  loading = true;
  errorMessage = '';

  dashboard: DashboardResponse = {
    totalLeads: 0,
    todayFollowUps: 0,
    pendingFollowUps: 0,
    hotCustomers: 0,
    closedDeals: 0
  };

  statusChartData: ChartData<'bar'> = {
    labels: [],
    datasets: [
      {
        label: 'Leads',
        data: [],
        borderRadius: 8,
        maxBarThickness: 42
      }
    ]
  };

  leadTypeChartData:
    ChartData<'doughnut'> = {

    labels: [],

    datasets: [
      {
        data: []
      }
    ]
  };

  sourceChartData:
    ChartData<'line'> = {

    labels: [],

    datasets: [
      {
        label: 'Leads',
        data: [],
        tension: 0.35,
        fill: true,
        pointRadius: 4,
        pointHoverRadius: 6
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
      },

      tooltip: {
        enabled: true
      }
    },

    scales: {
      x: {
        grid: {
          display: false
        },

        ticks: {
          color: '#7c859b'
        }
      },

      y: {
        beginAtZero: true,

        ticks: {
          precision: 0,
          color: '#7c859b'
        },

        grid: {
          color: '#edf0f5'
        }
      }
    }
  };

  readonly doughnutChartOptions:
    ChartOptions<'doughnut'> = {

    responsive: true,
    maintainAspectRatio: false,
    cutout: '68%',

    plugins: {
      legend: {
        position: 'bottom',

        labels: {
          usePointStyle: true,
          padding: 18,
          color: '#687188'
        }
      }
    }
  };

  readonly lineChartOptions:
    ChartOptions<'line'> = {

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
        },

        ticks: {
          color: '#7c859b'
        }
      },

      y: {
        beginAtZero: true,

        ticks: {
          precision: 0,
          color: '#7c859b'
        },

        grid: {
          color: '#edf0f5'
        }
      }
    }
  };

  constructor(
    private readonly dashboardService:
      DashboardService,

    private readonly reportService:
      ReportService
  ) {
  }

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.loading = true;
    this.errorMessage = '';

    forkJoin({
      summary:
        this.dashboardService
          .getDashboardSummary(),

      statuses:
        this.reportService
          .getLeadsByStatus(),

      leadTypes:
        this.reportService
          .getLeadsByLeadType(),

      sources:
        this.reportService
          .getLeadsBySource()
    })
      .subscribe({
        next: response => {
          this.dashboard =
            response.summary;

          this.prepareStatusChart(
            response.statuses
          );

          this.prepareLeadTypeChart(
            response.leadTypes
          );

          this.prepareSourceChart(
            response.sources
          );

          this.loading = false;
        },

        error: error => {
          console.error(
            'Dashboard loading failed:',
            error
          );

          this.errorMessage =
            'Unable to load dashboard data. Make sure the Spring Boot backend is running.';

          this.loading = false;
        }
      });
  }

  private prepareStatusChart(
    values: LabelCount[]
  ): void {

    this.statusChartData = {
      labels:
        values.map(
          value => value.label
        ),

      datasets: [
        {
          label: 'Leads',

          data:
            values.map(
              value => value.count
            ),

          borderRadius: 8,
          maxBarThickness: 42
        }
      ]
    };
  }

  private prepareLeadTypeChart(
    values: LabelCount[]
  ): void {

    this.leadTypeChartData = {
      labels:
        values.map(
          value => value.label
        ),

      datasets: [
        {
          data:
            values.map(
              value => value.count
            )
        }
      ]
    };
  }

  private prepareSourceChart(
    values: LabelCount[]
  ): void {

    this.sourceChartData = {
      labels:
        values.map(
          value => value.label
        ),

      datasets: [
        {
          label: 'Leads',

          data:
            values.map(
              value => value.count
            ),

          tension: 0.35,
          fill: true,
          pointRadius: 4,
          pointHoverRadius: 6
        }
      ]
    };
  }
}