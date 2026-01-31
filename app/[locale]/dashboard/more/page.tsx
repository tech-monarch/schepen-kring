import { DashboardTabs } from '@/components/dashboard/DashboardTabs';

export async function generateStaticParams() {
  return [
    { locale: 'en' },
    { locale: 'nl' },
  ];
}

export default function MorePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <DashboardTabs />
        
        {/* Page Header */}
        <div className="mt-8 mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Campaign Analytics</h1>
          <p className="mt-2 text-sm text-gray-600">Detailed insights and analytics for all your campaigns</p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 gap-6">
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: 'Total Campaigns', value: '24', change: '+12%', trend: 'up' },
              { title: 'Active Now', value: '8', change: '+2', trend: 'up' },
              { title: 'Avg. CTR', value: '3.2%', change: '-0.4%', trend: 'down' },
              { title: 'Total Spend', value: '$12,450', change: '+8.2%', trend: 'up' },
            ].map((stat, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    stat.trend === 'up' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {stat.change}
                  </span>
                </div>
                <p className="mt-1 text-2xl font-semibold text-gray-900">{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Performance Overview</h3>
              <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                <p className="text-gray-400">Performance chart will be displayed here</p>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Campaign Distribution</h3>
              <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                <p className="text-gray-400">Distribution chart will be displayed here</p>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
              <button className="text-sm font-medium text-blue-600 hover:text-blue-500">
                View all
              </button>
            </div>
            <div className="space-y-4">
              {[1, 2, 3].map((item) => (
                <div key={item} className="flex items-start pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                  <div className="bg-blue-100 p-2 rounded-lg mr-4">
                    <div className="h-5 w-5 text-blue-600">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">Campaign #{item} performance update</p>
                    <p className="text-sm text-gray-500">Updated 2 hours ago</p>
                  </div>
                  <button className="ml-4 text-sm font-medium text-blue-600 hover:text-blue-500">
                    View
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
