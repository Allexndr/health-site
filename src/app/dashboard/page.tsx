'use client'

import { useState } from 'react'
import { 
  ChartBarIcon,
  DocumentIcon,
  UserGroupIcon,
  ClockIcon 
} from '@heroicons/react/24/outline'

const stats = [
  { name: 'Total Images', stat: '71,897', icon: DocumentIcon },
  { name: 'Active Users', stat: '58', icon: UserGroupIcon },
  { name: 'Storage Used', stat: '24.5GB', icon: ChartBarIcon },
]

const recentActivity = [
  {
    id: 1,
    user: 'Dr. Smith',
    action: 'uploaded',
    subject: 'chest-xray-001.dcm',
    timestamp: '3 minutes ago',
  },
  {
    id: 2,
    user: 'Dr. Johnson',
    action: 'viewed',
    subject: 'mri-scan-123.dcm',
    timestamp: '12 minutes ago',
  },
  {
    id: 3,
    user: 'Dr. Williams',
    action: 'shared',
    subject: 'ct-scan-456.dcm',
    timestamp: '1 hour ago',
  },
]

export default function DashboardPage() {
  return (
    <div className="py-6">
      <div className="px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        
        {/* Stats */}
        <dl className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
          {stats.map((item) => (
            <div
              key={item.name}
              className="relative overflow-hidden rounded-lg bg-white px-4 pt-5 pb-12 shadow sm:px-6 sm:pt-6"
            >
              <dt>
                <div className="absolute rounded-md bg-primary-500 p-3">
                  <item.icon className="h-6 w-6 text-white" aria-hidden="true" />
                </div>
                <p className="ml-16 truncate text-sm font-medium text-gray-500">
                  {item.name}
                </p>
              </dt>
              <dd className="ml-16 flex items-baseline pb-6 sm:pb-7">
                <p className="text-2xl font-semibold text-gray-900">{item.stat}</p>
              </dd>
            </div>
          ))}
        </dl>

        {/* Recent Activity */}
        <h2 className="mt-8 text-lg font-medium leading-6 text-gray-900">
          Recent Activity
        </h2>
        <div className="mt-2 overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                  User
                </th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Action
                </th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Subject
                </th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Time
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {recentActivity.map((activity) => (
                <tr key={activity.id}>
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                    {activity.user}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {activity.action}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {activity.subject}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {activity.timestamp}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
} 