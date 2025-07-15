'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/hooks/useAuth'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Modal } from '@/components/ui/Modal'
import type { UserRole } from '@/lib/auth'

interface Clinic {
  id: string
  name: string
  address: string
  phone: string
  users: User[]
}

interface User {
  id: string
  name: string
  email: string
  role: UserRole
}

// Mock data for MVP
const mockClinics: Clinic[] = [
  {
    id: '1',
    name: 'Main Street Medical',
    address: '123 Main St, City, State 12345',
    phone: '(555) 123-4567',
    users: [
      {
        id: '1',
        name: 'Dr. Smith',
        email: 'dr.smith@example.com',
        role: 'doctor',
      },
      {
        id: '2',
        name: 'Jane Doe',
        email: 'jane.doe@example.com',
        role: 'staff',
      },
    ],
  },
  {
    id: '2',
    name: 'Downtown Imaging Center',
    address: '456 Oak Ave, City, State 12345',
    phone: '(555) 987-6543',
    users: [
      {
        id: '3',
        name: 'Dr. Johnson',
        email: 'dr.johnson@example.com',
        role: 'doctor',
      },
    ],
  },
]

export default function ClinicsPage() {
  const { user } = useAuth()
  const [clinics] = useState<Clinic[]>(mockClinics)
  const [showAddUserModal, setShowAddUserModal] = useState(false)
  const [selectedClinic, setSelectedClinic] = useState<Clinic | null>(null)
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'staff' as UserRole,
  })

  const handleAddUser = async () => {
    // TODO: Implement user creation
    console.log('Adding user:', { clinic: selectedClinic?.id, user: newUser })
    setShowAddUserModal(false)
  }

  return (
    <div className="py-6">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-2xl font-semibold text-gray-900">Clinics</h1>
            <p className="mt-2 text-sm text-gray-700">
              Manage your clinics and their users
            </p>
          </div>
          {user?.role === 'admin' && (
            <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
              <Button>Add Clinic</Button>
            </div>
          )}
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {clinics.map((clinic) => (
            <Card key={clinic.id}>
              <CardHeader>
                <CardTitle>{clinic.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="grid grid-cols-1 gap-y-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Address</dt>
                    <dd className="mt-1 text-sm text-gray-900">{clinic.address}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Phone</dt>
                    <dd className="mt-1 text-sm text-gray-900">{clinic.phone}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Users</dt>
                    <dd className="mt-2">
                      <ul className="divide-y divide-gray-200">
                        {clinic.users.map((user) => (
                          <li key={user.id} className="py-3">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                                <p className="text-sm text-gray-500">{user.email}</p>
                              </div>
                              <span className="inline-flex items-center rounded-full bg-primary-100 px-2.5 py-0.5 text-xs font-medium text-primary-800">
                                {user.role}
                              </span>
                            </div>
                          </li>
                        ))}
                      </ul>
                      {(user?.role === 'admin' || user?.role === 'doctor') && (
                        <Button
                          variant="outline"
                          className="mt-4"
                          onClick={() => {
                            setSelectedClinic(clinic)
                            setShowAddUserModal(true)
                          }}
                        >
                          Add User
                        </Button>
                      )}
                    </dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Add User Modal */}
      <Modal
        isOpen={showAddUserModal}
        onClose={() => setShowAddUserModal(false)}
        title={`Add User to ${selectedClinic?.name}`}
      >
        <div className="mt-4 space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Name
            </label>
            <Input
              id="name"
              value={newUser.name}
              onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <Input
              id="email"
              type="email"
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
            />
          </div>
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700">
              Role
            </label>
            <Select
              options={[
                { value: 'doctor', label: 'Doctor' },
                { value: 'staff', label: 'Staff' },
              ]}
              value={newUser.role}
              onChange={(value) => setNewUser({ ...newUser, role: value as UserRole })}
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <Button variant="outline" onClick={() => setShowAddUserModal(false)}>
            Cancel
          </Button>
          <Button onClick={handleAddUser}>Add User</Button>
        </div>
      </Modal>
    </div>
  )
} 