const http = require('http');

// 测试API端点
function testApiEndpoint() {
  const url = 'http://localhost:3000/api/download?docId=DOC-20260129-001';
  
  http.get(url, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('Status Code:', res.statusCode);
      console.log('Response Headers:', res.headers);
      console.log('First 300 characters of response:');
      console.log(data.substring(0, 300));
      
      // 检查是否包含真实内容（而不是元数据）
      if (data.includes('## Overview') && data.includes('California Consumer Privacy Act')) {
        console.log('\n✓ SUCCESS: API returns actual document content');
      } else if (data.includes('JURISGUARD LEGAL DOCUMENT')) {
        console.log('\n✗ ERROR: API returns metadata instead of actual content');
      } else {
        console.log('\n? UNKNOWN: Unexpected response format');
      }
    });
  }).on('error', (err) => {
    console.error('Error:', err.message);
  });
}

testApiEndpoint();