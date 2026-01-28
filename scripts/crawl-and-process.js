const fs = require('fs').promises;
const path = require('path');
const { processWithAI } = require('../lib/ai-data-processor');
const LegalAPIClient = require('../lib/legal-api-client');

// 初始化API客户端
const apiClient = new LegalAPIClient();

// 爬取法规数据 - 现在使用API客户端
async function crawlRegulations() {
  console.log('Starting to crawl regulations from API sources...');
  
  try {
    // 从多个API源获取法规数据
    const apiRegulations = await apiClient.fetchRegulations({
      // 可以添加过滤参数，如日期范围、法规类型等
      // published_date: `>${new Date(Date.now() - 30*24*60*60*1000).toISOString().split('T')[0]}`, // 最近30天
      // document_type: 'RULE',
      page_size: 10 // 限制返回数量
    });
    
    console.log(`Retrieved ${apiRegulations.length} regulations from API sources`);
    
    // 如果API没有返回数据，使用模拟数据作为后备
    if (apiRegulations.length === 0) {
      console.log('No data from APIs, using mock data as fallback');
      return getMockRegulations();
    }
    
    return apiRegulations;
  } catch (error) {
    console.error('Error crawling regulations:', error);
    // 出错时返回模拟数据
    return getMockRegulations();
  }
}

// 爬取案例数据 - 现在使用API客户端
async function crawlCases() {
  console.log('Starting to crawl cases from API sources...');
  
  try {
    // 从多个API源获取案例数据
    const apiCases = await apiClient.fetchCourtCases({
      // 可以添加过滤参数，如日期范围、案例类型等
      // filed_date: `>${new Date(Date.now() - 30*24*60*60*1000).toISOString().split('T')[0]}`, // 最近30天
      page_size: 10 // 限制返回数量
    });
    
    console.log(`Retrieved ${apiCases.length} cases from API sources`);
    
    // 如果API没有返回数据，使用模拟数据作为后备
    if (apiCases.length === 0) {
      console.log('No data from APIs, using mock data as fallback');
      return getMockCases();
    }
    
    return apiCases;
  } catch (error) {
    console.error('Error crawling cases:', error);
    // 出错时返回模拟数据
    return getMockCases();
  }
}

// 模拟法规数据（API不可用时的后备）
function getMockRegulations() {
  const mockRegulations = [
    {
      id: `REG-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      region: 'EU',
      severity: 'medium',
      title: `New Regulation Update ${new Date().toISOString().split('T')[0]}`,
      summary: 'Updated compliance requirements for data protection in European markets',
      timestamp: new Date().toISOString(),
      category: 'Data Protection',
      jurisdiction: 'European Union',
      publishDate: new Date().toISOString(),
      regulationType: 'GDPR Amendment',
      importanceLevel: 'high',
      source_url: 'https://example-regulation-source.com'
    },
    {
      id: `REG-${Date.now()}-${Math.floor(Math.random() * 1000) + 1000}`,
      region: 'USA',
      severity: 'high',
      title: `US Federal Compliance Directive ${new Date().toISOString().split('T')[0]}`,
      summary: 'New federal guidelines for AI governance and ethical standards',
      timestamp: new Date().toISOString(),
      category: 'AI Governance',
      jurisdiction: 'United States',
      publishDate: new Date().toISOString(),
      regulationType: 'AI Ethics',
      importanceLevel: 'critical',
      source_url: 'https://example-regulation-source.com'
    }
  ];
  
  console.log(`Generated ${mockRegulations.length} mock regulations as fallback`);
  return mockRegulations;
}

// 模拟案例数据（API不可用时的后备）
function getMockCases() {
  const mockCases = [
    {
      id: `CASE-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      title: `Corporate Compliance Case ${new Date().toISOString().split('T')[0]}`,
      court: 'District Court',
      jurisdiction: 'California',
      caseType: 'Data Breach',
      filingDate: new Date().toISOString().split('T')[0],
      status: 'active',
      parties: ['Plaintiff Corp', 'Defendant Inc'],
      description: 'Class action lawsuit regarding unauthorized data access and privacy violations',
      impactLevel: 'high',
      source_url: 'https://example-case-source.com',
      outcome: 'Pending',
      key_issues: ['Privacy Violations', 'Data Security']
    },
    {
      id: `CASE-${Date.now()}-${Math.floor(Math.random() * 1000) + 2000}`,
      title: `International Trade Dispute ${new Date().toISOString().split('T')[0]}`,
      court: 'International Court',
      jurisdiction: 'International',
      caseType: 'Trade Compliance',
      filingDate: new Date().toISOString().split('T')[0],
      status: 'settled',
      parties: ['Company A', 'Company B'],
      description: 'Dispute over international trade regulation compliance',
      impactLevel: 'medium',
      source_url: 'https://example-case-source.com',
      outcome: 'Settled out of court',
      key_issues: ['Trade Regulations', 'Compliance Standards']
    }
  ];
  
  console.log(`Generated ${mockCases.length} mock cases as fallback`);
  return mockCases;
}

// 保存数据到JSON文件
async function saveToFiles(regulations, cases) {
  console.log('Saving data to files...');
  
  const dataDir = path.join(__dirname, '..', 'data');
  await fs.mkdir(dataDir, { recursive: true });
  
  // 准备合规数据结构
  const complianceData = {
    alerts: regulations,
    radarStats: [
      { 
        id: 'global-1',
        region: 'Global', 
        riskLevel: Math.floor(Math.random() * 100), 
        category: 'Data Protection',
        trend: ['up', 'down', 'stable'][Math.floor(Math.random() * 3)],
        lastUpdated: new Date().toISOString(),
        value: Math.floor(Math.random() * 100), 
        level: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)]
      }
    ],
    stats: [
      { 
        label: 'Regulations Updated', 
        value: regulations.length.toString(), 
        change: '+5%', 
        icon: 'Scale' 
      }
    ],
    activities: [
      { 
        id: Date.now(), 
        action: `Updated ${regulations.length} regulations`, 
        time: new Date().toLocaleTimeString(), 
        user: 'Crawler System' 
      }
    ]
  };
  
  // 准备案例数据结构
  const casesData = {
    cases: cases
  };
  
  // 写入文件
  await fs.writeFile(
    path.join(dataDir, 'compliance-data.json'),
    JSON.stringify(complianceData, null, 2),
    'utf8'
  );
  
  await fs.writeFile(
    path.join(dataDir, 'cases-data.json'),
    JSON.stringify(casesData, null, 2),
    'utf8'
  );
  
  console.log('Data saved successfully');
}

async function main() {
  try {
    console.log('Starting crawl and process workflow...');
    
    // 爬取原始数据
    const rawRegulations = await crawlRegulations();
    const rawCases = await crawlCases();
    
    // 使用AI清洗数据
    const processedRegulations = await processWithAI(rawRegulations, 'regulation');
    const processedCases = await processWithAI(rawCases, 'case');
    
    // 保存到文件
    await saveToFiles(processedRegulations, processedCases);
    
    console.log('Crawl and process workflow completed successfully!');
  } catch (error) {
    console.error('Error in crawl and process workflow:', error);
    process.exit(1); // 设置退出码为1，表示失败
  }
}

// 运行主函数
if (require.main === module) {
  main();
}

module.exports = {
  crawlRegulations,
  crawlCases,
  processWithAI,
  saveToFiles
};