"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Loader2, RefreshCw, Trash2, Edit, Eye, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { fetchClients, deleteClient } from "@/services/client"
import type { Client } from "@/services/interface"

interface ClientsPageProps {
  onBack: () => void
}

export function ClientsPage({ onBack }: ClientsPageProps) {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [deletingId, setDeletingId] = useState<string | number | null>(null)

  // Load clients on component mount
  useEffect(() => {
    loadClients()
  }, [])

  const loadClients = async () => {
    setLoading(true)
    setError(null)
    try {
      const clientsData = await fetchClients()
      if (clientsData) {
        setClients(clientsData)
      } else {
        setError("Failed to fetch clients")
      }
    } catch (err) {
      console.error("Error loading clients:", err)
      setError("An error occurred while loading clients")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteClient = async (clientId: string | number) => {
    if (!confirm("Are you sure you want to delete this client?")) {
      return
    }

    setDeletingId(clientId)
    try {
      const success = await deleteClient(clientId)
      if (success) {
        // Remove the deleted client from the state
        setClients(clients.filter(client => client.id !== clientId))
      } else {
        setError("Failed to delete client")
      }
    } catch (err) {
      console.error("Error deleting client:", err)
      setError("An error occurred while deleting the client")
    } finally {
      setDeletingId(null)
    }
  }

  // Format date helper function
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "N/A"
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return "Invalid Date"
    }
  }

  // Filter clients based on search term
  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.id.toString().includes(searchTerm)
  )

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="flex items-center justify-between p-6">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Clients</h1>
              <p className="text-gray-600 mt-1">Manage your client accounts and configurations</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Input
              placeholder="Search clients by name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-80"
            />
            <Button variant="outline" onClick={loadClients} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button className="bg-purple-600 hover:bg-purple-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Client
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center justify-between">
            <span>{error}</span>
            <button 
              onClick={() => setError(null)} 
              className="ml-2 text-red-500 hover:text-red-700 text-xl leading-none"
            >
              ×
            </button>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-96">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-12 w-12 animate-spin text-purple-600" />
              <p className="text-lg text-gray-600">Loading clients...</p>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
            {/* Stats Header */}
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 border-b px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-8">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Clients</p>
                    <p className="text-2xl font-bold text-gray-900">{clients.length}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active</p>
                    <p className="text-2xl font-bold text-green-600">{clients.length}</p>
                  </div>
                  {searchTerm && (
                    <div>
                      <p className="text-sm font-medium text-gray-600">Filtered Results</p>
                      <p className="text-2xl font-bold text-blue-600">{filteredClients.length}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left p-6 font-semibold text-gray-700 text-sm uppercase tracking-wide">ID</th>
                    <th className="text-left p-6 font-semibold text-gray-700 text-sm uppercase tracking-wide">Client Name</th>
                    <th className="text-left p-6 font-semibold text-gray-700 text-sm uppercase tracking-wide">Created At</th>
                    <th className="text-left p-6 font-semibold text-gray-700 text-sm uppercase tracking-wide">Updated At</th>
                    <th className="text-left p-6 font-semibold text-gray-700 text-sm uppercase tracking-wide">Status</th>
                    <th className="text-right p-6 font-semibold text-gray-700 text-sm uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredClients.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center p-12">
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                            <Eye className="h-8 w-8 text-gray-400" />
                          </div>
                          <p className="text-lg font-medium text-gray-900">
                            {searchTerm ? "No clients found" : "No clients yet"}
                          </p>
                          <p className="text-gray-500">
                            {searchTerm 
                              ? `No clients match "${searchTerm}". Try adjusting your search.`
                              : "Get started by creating your first client."
                            }
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredClients.map((client, index) => (
                      <tr key={client.id} className="hover:bg-gray-50 transition-colors">
                        <td className="p-6">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                            #{client.id}
                          </span>
                        </td>
                        <td className="p-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                              <span className="text-purple-600 font-semibold text-sm">
                                {client.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">{client.name}</p>
                              <p className="text-sm text-gray-500">Client Account</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-6">
                          <div>
                            <p className="font-medium text-gray-900">{formatDate(client.created_at)}</p>
                            <p className="text-sm text-gray-500">Created</p>
                          </div>
                        </td>
                        <td className="p-6">
                          <div>
                            <p className="font-medium text-gray-900">{formatDate(client.updated_at)}</p>
                            <p className="text-sm text-gray-500">Last Modified</p>
                          </div>
                        </td>
                        <td className="p-6">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                            <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                            Active
                          </span>
                        </td>
                        <td className="p-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-9 w-9 p-0 hover:bg-blue-50 hover:text-blue-600"
                              title="View Client Details"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-9 w-9 p-0 hover:bg-amber-50 hover:text-amber-600"
                              title="Edit Client"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-9 w-9 p-0 hover:bg-red-50 hover:text-red-600"
                              title="Delete Client"
                              onClick={() => handleDeleteClient(client.id)}
                              disabled={deletingId === client.id}
                            >
                              {deletingId === client.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            {filteredClients.length > 0 && (
              <div className="bg-gray-50 px-6 py-4 border-t">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Showing <span className="font-medium">{filteredClients.length}</span> of{" "}
                    <span className="font-medium">{clients.length}</span> clients
                  </div>
                  {searchTerm && (
                    <div className="text-sm text-gray-500">
                      Filtered by: <span className="font-medium">"{searchTerm}"</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}