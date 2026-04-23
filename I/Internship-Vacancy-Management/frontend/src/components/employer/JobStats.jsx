import React from 'react';
import { FiTrendingUp, FiUsers, FiEye, FiClock } from 'react-icons/fi';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Filler,
  Tooltip,
  Legend,
  Title,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Filler,
  Tooltip,
  Legend,
  Title
);

const JobStats = ({ stats }) => {
  // Match label order: Active, Filled, Expired, Draft
  // "Lucid" look: per-slice gradients (light -> dark) in the same orange theme.
  const doughnutStops = [
    { from: 'rgba(254, 215, 170, 0.95)', to: 'rgba(253, 186, 116, 0.95)' }, // Active
    { from: 'rgba(253, 186, 116, 0.95)', to: 'rgba(251, 146, 60, 0.95)' },  // Filled
    { from: 'rgba(251, 146, 60, 0.95)', to: 'rgba(249, 115, 22, 0.95)' },   // Expired
    { from: 'rgba(249, 115, 22, 0.95)', to: 'rgba(234, 88, 12, 0.95)' },    // Draft
  ];
	const doughnutBorder = 'rgba(11, 19, 43, 1)'; // dark.base

  const doughnutBackground = (context) => {
    const { chart, dataIndex, datasetIndex } = context;
    const { ctx } = chart;
    const stops = doughnutStops[dataIndex] || doughnutStops[0];
    const meta = chart.getDatasetMeta(Number.isFinite(datasetIndex) ? datasetIndex : 0);
    const arc = meta?.data?.[dataIndex];
    if (!arc) {
      return stops?.to || 'rgba(249, 115, 22, 0.9)';
    }

    const x = arc.x;
    const y = arc.y;
    const inner = arc.innerRadius;
    const outer = arc.outerRadius;
    if (![x, y, inner, outer].every(Number.isFinite) || outer <= 0) {
      return stops?.to || 'rgba(249, 115, 22, 0.9)';
    }

    // Radial glow toward the outer edge
    const innerRadius = Math.max(0, inner * 0.6);
    const outerRadius = outer;
    const gradient = ctx.createRadialGradient(
      x,
      y,
      innerRadius,
      x,
      y,
      outerRadius
    );
    // Inner = darker, outer = lighter
    gradient.addColorStop(0, stops.to);
    gradient.addColorStop(0.7, stops.to);
    gradient.addColorStop(1, stops.from);
    return gradient;
  };

  const applicationData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [
      {
        label: 'Applications',
        data: stats?.weeklyData || [0, 0, 0, 0],
        borderColor: 'rgb(249, 115, 22)',
        backgroundColor: 'rgba(249, 115, 22, 0.12)',
        fill: true,
      },
    ],
  };

  const jobStatusData = {
    labels: ['Active', 'Filled', 'Expired', 'Draft'],
    datasets: [
      {
        data: [
          stats?.activeJobs || 0,
          stats?.filledJobs || 0,
          stats?.expiredJobs || 0,
          stats?.draftJobs || 0,
        ],
      backgroundColor: doughnutBackground,
			borderColor: doughnutBorder,
			borderWidth: 2,
      hoverOffset: 6,
      },
    ],
  };

	const doughnutOptions = {
		responsive: true,
		plugins: {
			legend: {
				labels: {
					color: 'rgba(226, 232, 240, 0.9)',
				},
			},
		},
	};

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-dark-card rounded-lg p-4 shadow-sm">
          <FiEye className="h-5 w-5 text-primary-600 mb-2" />
          <p className="text-2xl font-bold">{stats?.totalViews || 0}</p>
          <p className="text-sm text-slate-300">Total Views</p>
        </div>
        <div className="bg-dark-card rounded-lg p-4 shadow-sm">
          <FiUsers className="h-5 w-5 text-primary-600 mb-2" />
          <p className="text-2xl font-bold">{stats?.totalApplications || 0}</p>
          <p className="text-sm text-slate-300">Applications</p>
        </div>
        <div className="bg-dark-card rounded-lg p-4 shadow-sm">
          <FiTrendingUp className="h-5 w-5 text-primary-600 mb-2" />
          <p className="text-2xl font-bold">{stats?.applicationRate || 0}%</p>
          <p className="text-sm text-slate-300">Application Rate</p>
        </div>
        <div className="bg-dark-card rounded-lg p-4 shadow-sm">
          <FiClock className="h-5 w-5 text-primary-600 mb-2" />
          <p className="text-2xl font-bold">{stats?.avgResponseTimeDays || 0}d</p>
          <p className="text-sm text-slate-300">Avg Response</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-dark-card rounded-lg p-4 shadow-sm">
          <h3 className="font-semibold mb-4">Application Trends</h3>
          <Line data={applicationData} options={{ responsive: true }} />
        </div>
        <div className="bg-dark-card rounded-lg p-4 shadow-sm">
          <h3 className="font-semibold mb-4">Job Post Status</h3>
          <div className="max-w-sm mx-auto">
				<Doughnut data={jobStatusData} options={doughnutOptions} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobStats;