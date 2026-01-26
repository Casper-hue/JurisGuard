'use client'

import { useState, useEffect } from 'react'
import { ComplianceAlert } from '@/types/index'
import { useSearch } from '@/contexts/SearchContext'
import { Filter, Download, Share, Search, Globe, Calendar, Link } from 'lucide-react'

// Data interface
interface ComplianceData {
  alerts: ComplianceAlert[];
}

export default function CompliancePage() {
  const [complianceData, setComplianceData] = useState<ComplianceData | null>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [localSearchTerm, setLocalSearchTerm] = useState('')
  const [selectedAlert, setSelectedAlert] = useState<ComplianceAlert | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  const { searchQuery, searchResults, isSearching } = useSearch()

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch('/data/compliance-data.json')
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
        const data = await response.json()
        setComplianceData(data)
      } catch (error) {
        console.error('Failed to load compliance data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading compliance data...</p>
        </div>
      </div>
    )
  }

  if (!complianceData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-destructive">Failed to load compliance data</p>
        </div>
      </div>
    )
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500'
      case 'high': return 'bg-orange-500'
      case 'medium': return 'bg-yellow-500'
      case 'low': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  const getSeverityText = (severity: string) => {
    switch (severity) {
      case 'critical': return 'Critical'
      case 'high': return 'High'
      case 'medium': return 'Medium'
      case 'low': return 'Low'
      default: return 'Unknown'
    }
  }

  const handleViewDetails = (alert: ComplianceAlert) => {
    setSelectedAlert(alert)
    setShowDetails(true)
  }

  // Use search results or local data
  const alertsToDisplay = searchQuery && searchResults.length > 0 ? searchResults : complianceData.alerts
  
  const filteredAlerts = alertsToDisplay.filter(alert => {
    const matchesFilter = filter === 'all' || alert.severity === filter
    const matchesSearch = alert.title.toLowerCase().includes(localSearchTerm.toLowerCase()) ||
                         alert.summary.toLowerCase().includes(localSearchTerm.toLowerCase()) ||
                         alert.region.toLowerCase().includes(localSearchTerm.toLowerCase())
    return matchesFilter && matchesSearch
  })

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Regulations</h1>
        <p className="text-base text-muted-foreground">Monitor regulatory compliance alerts and updates</p>
      </div>

      {/* Search status display */}
      {searchQuery && searchResults.length > 0 && (
        <div className="bg-primary/20 border border-primary/30 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-primary" />
              <span className="text-sm text-primary">
                Showing {searchResults.length} results for "{searchQuery}"
              </span>
            </div>
            <button 
              onClick={() => window.location.reload()}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Clear search
            </button>
          </div>
        </div>
      )}

      {/* Search and filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Search regulations..."
            value={localSearchTerm}
            onChange={(e) => setLocalSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-md border border-border bg-input text-muted-foreground placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring focus:border-transparent"
          />
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>
        
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-3 py-2 rounded-md border border-border bg-input text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring focus:border-transparent text-sm"
        >
          <option value="all" className="text-muted-foreground">All Severities</option>
          <option value="critical" className="text-muted-foreground">Critical</option>
          <option value="high" className="text-muted-foreground">High</option>
          <option value="medium" className="text-muted-foreground">Medium</option>
          <option value="low" className="text-muted-foreground">Low</option>
        </select>
      </div>



      {/* Compliance alerts list */}
      <div className="p-6 rounded-xl bg-card border border-border">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-foreground">Regulatory Alerts</h2>
          <span className="text-sm text-muted-foreground">{filteredAlerts.length} alerts</span>
        </div>

        <div className="space-y-4">
          {filteredAlerts.map((alert) => (
            <div key={alert.id} className="p-6 rounded-xl bg-card/10 border border-border hover:bg-blue-900/99 hover:border-primary/20 transition-all duration-300 group">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                      {alert.title}
                    </h3>
                    <span className={`px-2 py-1 rounded text-xs ${getSeverityColor(alert.severity)} text-white`}>
                      {getSeverityText(alert.severity)}
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-3">
                    <div className="flex items-center gap-1">
                      <Globe className="h-3 w-3 text-muted-foreground" />
                      <span>{alert.region}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      <span>{new Date(alert.timestamp).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric'
                      })}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Link className="h-3 w-3 text-muted-foreground" />
                      <span>{alert.source_url ? 'Source Available' : 'No Source'}</span>
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-3">{alert.summary}</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  ID: {alert.id}
                </span>
                <button 
                  onClick={() => handleViewDetails(alert)}
                  className="text-xs text-primary hover:text-primary/80 transition-colors"
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredAlerts.length === 0 && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No regulatory alerts match your search criteria</p>
          </div>
        )}
      </div>

      {/* Details modal */}
      {showDetails && selectedAlert && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
               <h3 className="text-xl font-bold text-foreground">Regulation Details</h3>
               <button 
                 onClick={() => setShowDetails(false)}
                 className="text-muted-foreground hover:text-foreground transition-colors"
               >
                 ✕
               </button>
             </div>
            
            <div className="space-y-4">
              <div>
                <h4 className="text-lg font-semibold text-foreground mb-2">{selectedAlert.title}</h4>
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-3">
                  <div className="flex items-center gap-1">
                     <Globe className="h-3 w-3" />
                     <span>Region: {selectedAlert.region}</span>
                   </div>
                   <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>Published: {new Date(selectedAlert.timestamp).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}</span>
                    </div>
                  <div className={`px-2 py-1 rounded text-xs ${getSeverityColor(selectedAlert.severity)} text-white`}>
                    {getSeverityText(selectedAlert.severity)}
                  </div>
                  {selectedAlert.category && (
                    <div className="px-2 py-1 rounded text-xs bg-blue-500/20 text-blue-500">
                      {selectedAlert.category}
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                 <h5 className="font-medium text-foreground mb-2">Summary</h5>
                 <p className="text-sm text-muted-foreground">{selectedAlert.summary}</p>
               </div>
              
              {selectedAlert.source_url && (
                 <div>
                   <h5 className="font-medium text-foreground mb-2">Source</h5>
                   <div className="flex items-center gap-2">
                     <Link className="h-4 w-4 text-primary" />
                     <a 
                       href={selectedAlert.source_url} 
                       target="_blank" 
                       rel="noopener noreferrer"
                       className="text-primary hover:text-primary/80 transition-colors break-all"
                     >
                       {selectedAlert.source_url}
                     </a>
                   </div>
                   <p className="text-xs text-muted-foreground mt-1">Click the link to view the official document</p>
                 </div>
               )}
              
              <div>
                 <h5 className="font-medium text-foreground mb-2">Alert ID</h5>
                 <p className="text-sm text-muted-foreground">{selectedAlert.id}</p>
               </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              {selectedAlert.source_url && (
                <a 
                   href={selectedAlert.source_url}
                   target="_blank"
                   rel="noopener noreferrer"
                   className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                 >
                   View Official Document
                 </a>
               )}
               <button 
                 onClick={() => setShowDetails(false)}
                 className="px-4 py-2 border border-border rounded-md hover:bg-secondary transition-colors"
               >
                 Close
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}