const fs = require('fs');
const path = require('path');

// 测试API端点逻辑
async function testApiEndpoint() {
  // 读取文档数据
  const dataPath = path.join(process.cwd(), 'data', 'documents-data.json');
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  
  // 查找指定文档
  const docId = 'DOC-20260129-001';
  const document = data.documents.find((doc) => doc.id === docId);
  
  if (!document) {
    console.log('Document not found');
    return;
  }

  console.log('Document found:', document.title);
  console.log('Has content field:', !!document.content);
  
  // 优先返回文档的实际内容，如果没有内容则返回元数据
  const content = document.content || `JURISGUARD LEGAL DOCUMENT\n\n` +
    `Title: ${document.title}\n` +
    `ID: ${document.id}\n`;
  
  console.log('Content length:', content.length);
  console.log('First 200 chars of content:', content.substring(0, 200));
  
  if (document.content) {
    console.log('\nUsing actual document content');
  } else {
    console.log('\nUsing fallback metadata');
  }
}

testApiEndpoint();