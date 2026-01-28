import fs from 'fs/promises';
import path from 'path';

async function updateIds() {
  const basePath = path.join(process.cwd(), 'public', 'data');
  
  // 更新compliance-data.json中的ID
  const compliancePath = path.join(basePath, 'compliance-data.json');
  let complianceData = JSON.parse(await fs.readFile(compliancePath, 'utf-8'));
  
  let regCounter = 1;
  complianceData.alerts = complianceData.alerts.map((alert: any) => {
    // 无论如何都更新ID以确保使用三位数格式
    const newId = `REG-${new Date().getFullYear()}-${regCounter.toString().padStart(3, '0')}`;
    regCounter++;
    
    return {
      ...alert,
      id: newId
    };
  });
  
  await fs.writeFile(compliancePath, JSON.stringify(complianceData, null, 2));
  console.log(`Updated ${complianceData.alerts.length} compliance records to new ID format`);
  
  // 更新cases-data.json中的ID
  const casesPath = path.join(basePath, 'cases-data.json');
  let casesData = JSON.parse(await fs.readFile(casesPath, 'utf-8'));
  
  let casCounter = 1;
  casesData.cases = casesData.cases.map((caseItem: any) => {
    // 无论如何都更新ID以确保使用三位数格式
    const newId = `CAS-${new Date().getFullYear()}-${casCounter.toString().padStart(3, '0')}`;
    casCounter++;
    
    return {
      ...caseItem,
      id: newId
    };
  });
  
  await fs.writeFile(casesPath, JSON.stringify(casesData, null, 2));
  console.log(`Updated ${casesData.cases.length} case records to new ID format`);
  
  // 更新documents-data.json中的ID
  const documentsPath = path.join(basePath, 'documents-data.json');
  let documentsData = JSON.parse(await fs.readFile(documentsPath, 'utf-8'));
  
  let docCounter = 1;
  documentsData.documents = documentsData.documents.map((doc: any) => {
    // 无论如何都更新ID以确保使用三位数格式
    const newId = `DOC-${new Date().getFullYear()}-${docCounter.toString().padStart(3, '0')}`;
    docCounter++;
    
    return {
      ...doc,
      id: newId
    };
  });
  
  await fs.writeFile(documentsPath, JSON.stringify(documentsData, null, 2));
  console.log(`Updated ${documentsData.documents.length} document records to new ID format`);
  
  console.log('All IDs have been updated to the new unified format!');
}

updateIds().catch(console.error);