// lib/legal-api-client.js
// 法律数据API客户端，整合多个数据源

class LegalAPIClient {
  constructor() {
    // 配置多个API端点
    this.apis = {
      // CourtListener API - 美国法院案例
      courtlistener: {
        baseUrl: 'https://www.courtlistener.com/api/rest/v3/',
        key: process.env.COURTLISTENER_API_KEY || null,
        enabled: !!process.env.COURTLISTENER_API_KEY
      },
      
      // Regulations.gov API - 美国联邦法规
      regulations: {
        baseUrl: 'https://api.regulations.gov/v4/',
        key: process.env.REGULATIONS_API_KEY || null,
        enabled: !!process.env.REGULATIONS_API_KEY
      },
      
      // 模拟其他API端点
      // 在实际部署时，可以添加更多真实的API
    };
  }

  // 获取法院案例数据
  async fetchCourtCases(params = {}) {
    // 如果有有效的CourtListener API密钥，则使用它
    if (this.apis.courtlistener.enabled && this.apis.courtlistener.key) {
      try {
        const queryParams = new URLSearchParams({
          ...params,
          api_key: this.apis.courtlistener.key,
          format: 'json'
        });

        const response = await fetch(
          `${this.apis.courtlistener.baseUrl}opinions/?${queryParams}`
        );
        
        if (!response.ok) {
          throw new Error(`CourtListener API error: ${response.status}`);
        }
        
        const data = await response.json();
        return this.transformCourtCases(data.results || []);
      } catch (error) {
        console.error('Error fetching from CourtListener:', error);
        // 返回空数组，后续会使用备用数据源
        return [];
      }
    } else {
      // 没有API密钥时，返回模拟数据（实际项目中可以从其他来源获取）
      return this.getMockCourtCases();
    }
  }

  // 获取法规数据
  async fetchRegulations(params = {}) {
    // 如果有有效的Regulations.gov API密钥，则使用它
    if (this.apis.regulations.enabled && this.apis.regulations.key) {
      try {
        const queryParams = new URLSearchParams({
          ...params,
          apiKey: this.apis.regulations.key
        });

        const response = await fetch(
          `${this.apis.regulations.baseUrl}documents?${queryParams}`
        );
        
        if (!response.ok) {
          throw new Error(`Regulations API error: ${response.status}`);
        }
        
        const data = await response.json();
        return this.transformRegulations(data.data || []);
      } catch (error) {
        console.error('Error fetching from Regulations.gov:', error);
        return [];
      }
    } else {
      // 没有API密钥时，返回模拟数据
      return this.getMockRegulations();
    }
  }

  // 转换法院案例数据为内部格式
  transformCourtCases(apiResults) {
    return apiResults.map(item => ({
      id: item.id || `CASE-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      title: item.citation || item.caseName || 'Untitled Case',
      court: item.court?.full_name || item.court || 'Unknown Court',
      jurisdiction: item.court?.jurisdiction || 'Unknown',
      caseType: item.opinion_type || 'General',
      filingDate: item.date_filed || item.date_created || new Date().toISOString().split('T')[0],
      status: this.normalizeCaseStatus(item.status || 'active'),
      parties: item.parties || [item.attorney || 'Unknown'],
      description: item.description || item.snippet || 'No description available',
      impactLevel: this.estimateImpactLevel(item.citation_string || ''),
      source_url: item.absolute_url || item.html_url || null,
      outcome: item.outcome || null,
      key_issues: item.headnotes || [],
      timestamp: item.date_modified || item.date_created || new Date().toISOString(),
      region: this.extractRegionFromCourt(item.court?.full_name || item.court || '')
    }));
  }

  // 转换法规数据为内部格式
  transformRegulations(apiResults) {
    return apiResults.map(item => ({
      id: item.documentId || `REG-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      region: this.extractRegionFromAgency(item['agency acronym'] || ''),
      severity: this.estimateSeverity(item.documentType || 'RULE'),
      title: item.title || item.abstract || 'Untitled Regulation',
      summary: item.abstract || item.preamble || 'No summary available',
      timestamp: item.dates?.publicationDate || item.modified || new Date().toISOString(),
      source_url: item.url || null,
      category: item.documentType || 'General',
      jurisdiction: item.agencyName || 'Unknown',
      publishDate: item.dates?.publicationDate || new Date().toISOString().split('T')[0],
      regulationType: item.documentType || 'Rule',
      importanceLevel: this.estimateImportance(item.commentStartDate || ''),
    }));
  }

  // 模拟法院案例数据（当没有API密钥时使用）
  getMockCourtCases() {
    const mockCases = [
      {
        id: `CASE-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        title: `Smith v. Johnson - Privacy Rights Case`,
        court: 'Supreme Court of California',
        jurisdiction: 'California',
        caseType: 'Privacy',
        filingDate: '2024-01-15',
        status: 'decided',
        parties: ['Smith, Plaintiff', 'Johnson, Defendant'],
        description: 'Landmark case regarding digital privacy rights in the workplace',
        impactLevel: 'high',
        source_url: 'https://example-court-data.com/case/SMITH-JOHNSON',
        outcome: 'In favor of Plaintiff',
        key_issues: ['Digital Privacy', 'Employee Rights', 'Data Protection'],
        timestamp: new Date().toISOString(),
        region: 'California'
      },
      {
        id: `CASE-${Date.now()}-${Math.floor(Math.random() * 1000) + 1000}`,
        title: `State of New York v. TechCorp - Data Compliance`,
        court: 'New York Supreme Court',
        jurisdiction: 'New York',
        caseType: 'Data Compliance',
        filingDate: '2024-02-20',
        status: 'active',
        parties: ['State of New York', 'TechCorp Inc.'],
        description: 'Compliance case regarding state data protection regulations',
        impactLevel: 'medium',
        source_url: 'https://example-court-data.com/case/NY-TECHCORP',
        outcome: 'Pending',
        key_issues: ['Data Compliance', 'State Regulations', 'Corporate Liability'],
        timestamp: new Date().toISOString(),
        region: 'New York'
      }
    ];
    
    return mockCases;
  }

  // 模拟法规数据（当没有API密钥时使用）
  getMockRegulations() {
    const mockRegs = [
      {
        id: `REG-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        region: 'EU',
        severity: 'high',
        title: 'GDPR Amendment 2024 - Enhanced Consent Requirements',
        summary: 'Updated requirements for obtaining explicit consent for data processing under GDPR',
        timestamp: new Date().toISOString(),
        source_url: 'https://example-reg-data.com/reg/GDPR-AMENDMENT-2024',
        category: 'Data Protection',
        jurisdiction: 'European Union',
        publishDate: new Date().toISOString().split('T')[0],
        regulationType: 'GDPR Amendment',
        importanceLevel: 'critical',
      },
      {
        id: `REG-${Date.now()}-${Math.floor(Math.random() * 1000) + 1000}`,
        region: 'USA',
        severity: 'medium',
        title: 'Federal AI Governance Framework - Version 2.0',
        summary: 'Updated guidelines for ethical AI deployment in federal agencies',
        timestamp: new Date().toISOString(),
        source_url: 'https://example-reg-data.com/reg/AI-GOVERNANCE-V2',
        category: 'AI Governance',
        jurisdiction: 'United States',
        publishDate: new Date().toISOString().split('T')[0],
        regulationType: 'AI Guidelines',
        importanceLevel: 'high',
      }
    ];
    
    return mockRegs;
  }

  // 辅助方法：标准化案例状态
  normalizeCaseStatus(status) {
    const statusMap = {
      'active': 'active',
      'open': 'active',
      'ongoing': 'active',
      'settled': 'settled',
      'resolved': 'settled',
      'appealed': 'appealed',
      'under appeal': 'appealed',
      'closed': 'closed',
      'completed': 'closed',
      'decided': 'decided',
      'judged': 'decided'
    };
    
    const normalized = statusMap[status.toLowerCase()] || 'active';
    return normalized;
  }

  // 辅助方法：估算影响等级
  estimateImpactLevel(citation) {
    if (citation.toLowerCase().includes('supreme') || citation.toLowerCase().includes('constitutional')) {
      return 'critical';
    } else if (citation.toLowerCase().includes('court') || citation.toLowerCase().includes('federal')) {
      return 'high';
    } else {
      return 'medium';
    }
  }

  // 辅助方法：估算严重程度
  estimateSeverity(docType) {
    const highSeverityTypes = ['RULE', 'PROPOSED_RULE', 'FINAL_RULE', 'ORDER'];
    const mediumSeverityTypes = ['NOTICE', 'REQUEST', 'SPECIAL'];
    
    if (highSeverityTypes.some(type => docType.includes(type))) {
      return 'high';
    } else if (mediumSeverityTypes.some(type => docType.includes(type))) {
      return 'medium';
    } else {
      return 'low';
    }
  }

  // 辅助方法：估算重要性
  estimateImportance(dateStr) {
    const date = new Date(dateStr);
    const now = new Date();
    const daysDiff = (now - date) / (1000 * 60 * 60 * 24);
    
    if (daysDiff <= 30) {
      return 'high'; // Recent regulations are more important
    } else if (daysDiff <= 180) {
      return 'medium';
    } else {
      return 'low';
    }
  }

  // 辅助方法：从法院名称提取地区
  extractRegionFromCourt(courtName) {
    const courtRegions = {
      'california': 'California',
      'new york': 'New York',
      'texas': 'Texas',
      'florida': 'Florida',
      'illinois': 'Illinois',
      'supreme court': 'Federal',
      'federal': 'Federal',
      'district': 'Federal',
      'court of appeals': 'Federal',
      'circuit': 'Federal'
    };

    const lowerCourt = courtName.toLowerCase();
    for (const [key, value] of Object.entries(courtRegions)) {
      if (lowerCourt.includes(key)) {
        return value;
      }
    }
    
    return 'Unknown';
  }

  // 从机构缩写提取地区
  extractRegionFromAgency(agencyAcronym) {
    const agencyRegions = {
      'SEC': 'Federal',
      'FDA': 'Federal',
      'EPA': 'Federal',
      'FTC': 'Federal',
      'DOJ': 'Federal',
      'HHS': 'Federal'
    };
    
    return agencyRegions[agencyAcronym] || 'Federal';
  }

  // 统一获取数据方法
  async fetchData(dataType, params = {}) {
    if (dataType === 'cases') {
      return await this.fetchCourtCases(params);
    } else if (dataType === 'regulations') {
      return await this.fetchRegulations(params);
    } else {
      throw new Error(`Unsupported data type: ${dataType}`);
    }
  }
}

module.exports = LegalAPIClient;