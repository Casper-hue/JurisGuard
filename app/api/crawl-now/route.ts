// app/api/crawl-now/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // 在Vercel环境中，我们不能修改文件系统
  // 这个端点主要用于指示用户如何更新数据
  return NextResponse.json({ 
    success: false, 
    message: 'Data update must be performed via GitHub Actions or locally',
    instructions: 'Run "npm run crawl-data" locally and push changes to GitHub to trigger Vercel deployment'
  });
}