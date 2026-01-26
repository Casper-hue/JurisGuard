'use client'

import { useState, useEffect } from 'react'
import { Scale, Search, Filter, Calendar, MapPin, Users, TrendingUp, Link } from 'lucide-react'

interface PublicCase {
  id: string
  title: string
  court: string
  jurisdiction: string
  caseType: string
  filingDate: string
  status: 'active' | 'settled' | 'appealed' | 'closed' | 'decided'
  parties: string[]
  description: string
  impactLevel: 'high' | 'medium' | 'low' | 'critical'
  source_url?: string
  outcome?: string
  key_issues?: string[]
}

export default function CasesPage() {
  const [cases, setCases] = useState<PublicCase[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCase, setSelectedCase] = useState<PublicCase | null>(null)
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch('/data/cases-data.json')
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
        const data = await response.json()
        setCases(data.cases)
      } catch (error) {
        console.error('Failed to load cases data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [jurisdictionFilter, setJurisdictionFilter] = useState('all')

  const handleViewDetails = (caseItem: PublicCase) => {
    setSelectedCase(caseItem)
    setShowDetails(true)
  }

  const filteredCases = cases.filter(caseItem => {
    const matchesSearch = caseItem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         caseItem.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         caseItem.court.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || caseItem.status === statusFilter
    const matchesJurisdiction = jurisdictionFilter === 'all' || caseItem.jurisdiction === jurisdictionFilter
    
    return matchesSearch && matchesStatus && matchesJurisdiction
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-500'
      case 'settled': return 'bg-blue-500/20 text-blue-500'
      case 'appealed': return 'bg-yellow-500/20 text-yellow-500'
      case 'closed': return 'bg-gray-500/20 text-gray-500'
      default: return 'bg-gray-500/20 text-gray-500'
    }
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-500/20 text-red-500'
      case 'medium': return 'bg-yellow-500/20 text-yellow-500'
      case 'low': return 'bg-green-500/20 text-green-500'
      default: return 'bg-gray-500/20 text-gray-500'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading cases data...</p>
        </div>
      </div>
    )
  }

  if (cases.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-destructive">Failed to load cases data</p>
          <p className="text-sm text-muted-foreground mt-2">Please check if the data file exists</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Public Cases</h1>
        <p className="text-base text-muted-foreground">Track significant legal cases and their compliance implications</p>
      </div>

      {/* 搜索和筛选 */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search cases by title, description, or court..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-md border border-border bg-input text-muted-foreground placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring focus:border-transparent"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>
        
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 rounded-md border border-border bg-input text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring focus:border-transparent text-sm"
        >
          <option value="all" className="text-muted-foreground">All Status</option>
          <option value="active" className="text-muted-foreground">Active</option>
          <option value="settled" className="text-muted-foreground">Settled</option>
          <option value="appealed" className="text-muted-foreground">Appealed</option>
          <option value="closed" className="text-muted-foreground">Closed</option>
        </select>

        <select
          value={jurisdictionFilter}
          onChange={(e) => setJurisdictionFilter(e.target.value)}
          className="px-3 py-2 rounded-md border border-border bg-input text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring focus:border-transparent text-sm"
        >
          <option value="all" className="text-muted-foreground">All Jurisdictions</option>
          <option value="United States" className="text-muted-foreground">United States</option>
          <option value="European Union" className="text-muted-foreground">European Union</option>
          <option value="United Kingdom" className="text-muted-foreground">United Kingdom</option>
          <option value="Australia" className="text-muted-foreground">Australia</option>
          <option value="California" className="text-muted-foreground">California</option>
        </select>
      </div>

      {/* 案件列表 */}
      <div className="space-y-4">
        {filteredCases.map((caseItem) => (
          <div key={caseItem.id} className="p-6 rounded-xl bg-card border border-border hover:bg-blue-900/99 hover:border-primary/20 transition-colors group">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                    {caseItem.title}
                  </h3>
                  <span className={`px-2 py-1 rounded text-xs ${getImpactColor(caseItem.impactLevel)}`}>
                    {caseItem.impactLevel.toUpperCase()}
                  </span>
                </div>
                
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-3">
                  <div className="flex items-center gap-1">
                    <Scale className="h-3 w-3 text-muted-foreground" />
                    <span>{caseItem.court}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-muted-foreground" />
                    <span>{caseItem.jurisdiction}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-muted-foreground" />
                    <span>{new Date(caseItem.filingDate).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'short', 
                      day: 'numeric'
                    })}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3 text-muted-foreground" />
                    <span>{caseItem.parties.join(' v. ')}</span>
                  </div>
                  {caseItem.source_url && (
                    <div className="flex items-center gap-1">
                      <Link className="h-3 w-3 text-muted-foreground" />
                      <span>Source Available</span>
                    </div>
                  )}
                </div>
                
                <p className="text-sm text-muted-foreground mb-4">{caseItem.description}</p>
                
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-1 rounded text-xs ${getStatusColor(caseItem.status)}`}>
                    {caseItem.status.charAt(0).toUpperCase() + caseItem.status.slice(1)}
                  </span>
                  <span className="text-xs text-muted-foreground">{caseItem.caseType}</span>
                </div>
                
                <div className="flex items-center justify-between mt-4">
                  <span className="text-xs text-muted-foreground">
                    ID: {caseItem.id}
                  </span>
                  <button 
                    onClick={() => handleViewDetails(caseItem)}
                    className="text-xs text-primary hover:text-primary/80 transition-colors"
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredCases.length === 0 && (
        <div className="text-center py-12">
          <Scale className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No cases found matching your criteria</p>
        </div>
      )}

      {/* Case Details Modal */}
      {showDetails && selectedCase && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-foreground">Case Details</h3>
              <button 
                onClick={() => setShowDetails(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <h4 className="text-lg font-semibold text-foreground mb-2">{selectedCase.title}</h4>
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-3">
                  <div className="flex items-center gap-1">
                    <Scale className="h-3 w-3" />
                    <span>Court: {selectedCase.court}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    <span>Jurisdiction: {selectedCase.jurisdiction}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>Filed: {new Date(selectedCase.filingDate).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric'
                    })}</span>
                  </div>
                  <div className={`px-2 py-1 rounded text-xs ${getImpactColor(selectedCase.impactLevel)}`}>
                    {selectedCase.impactLevel.toUpperCase()}
                  </div>
                  <div className={`px-2 py-1 rounded text-xs ${getStatusColor(selectedCase.status)}`}>
                    {selectedCase.status.charAt(0).toUpperCase() + selectedCase.status.slice(1)}
                  </div>
                </div>
              </div>
              
              <div>
                <h5 className="font-medium text-foreground mb-2">Parties</h5>
                <p className="text-sm text-muted-foreground">{selectedCase.parties.join(' v. ')}</p>
              </div>
              
              <div>
                <h5 className="font-medium text-foreground mb-2">Description</h5>
                <p className="text-sm text-muted-foreground">{selectedCase.description}</p>
              </div>
              
              {selectedCase.outcome && (
                <div>
                  <h5 className="font-medium text-foreground mb-2">Outcome</h5>
                  <p className="text-sm text-muted-foreground">{selectedCase.outcome}</p>
                </div>
              )}
              
              {selectedCase.key_issues && selectedCase.key_issues.length > 0 && (
                <div>
                  <h5 className="font-medium text-foreground mb-2">Key Issues</h5>
                  <div className="flex flex-wrap gap-2">
                    {selectedCase.key_issues.map((issue, index) => (
                      <span key={index} className="px-2 py-1 rounded text-xs bg-blue-500/20 text-blue-500">
                        {issue}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {selectedCase.source_url && (
                <div>
                  <h5 className="font-medium text-foreground mb-2">Source</h5>
                  <div className="flex items-center gap-2">
                    <Link className="h-4 w-4 text-primary" />
                    <a 
                      href={selectedCase.source_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:text-primary/80 transition-colors break-all"
                    >
                      {selectedCase.source_url}
                    </a>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Click the link to view the official case document</p>
                </div>
              )}
              
              <div>
                <h5 className="font-medium text-foreground mb-2">Case ID</h5>
                <p className="text-sm text-muted-foreground">{selectedCase.id}</p>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              {selectedCase.source_url && (
                <a 
                  href={selectedCase.source_url}
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