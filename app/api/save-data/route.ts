import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { data, dataType } = body

    if (!data || !dataType) {
      return NextResponse.json(
        { success: false, error: '缺少必要参数' },
        { status: 400 }
      )
    }

    let filePath: string
    let dataKey: string

    if (dataType === 'case') {
      filePath = path.join(process.cwd(), 'data', 'cases-data.json')
      dataKey = 'cases'
    } else if (dataType === 'regulation') {
      filePath = path.join(process.cwd(), 'data', 'compliance-data.json')
      dataKey = 'alerts'
    } else {
      return NextResponse.json(
        { success: false, error: '不支持的数据类型' },
        { status: 400 }
      )
    }

    // 读取现有数据或创建新文件
    let jsonData: any
    try {
      const fileContent = await fs.readFile(filePath, 'utf-8')
      jsonData = JSON.parse(fileContent)
    } catch (error) {
      // 文件不存在，创建新数据结构
      jsonData = { [dataKey]: [] }
    }

    // 添加新数据
    jsonData[dataKey].push(data)

    // 确保目录存在
    await fs.mkdir(path.dirname(filePath), { recursive: true })
    
    // 写回文件
    await fs.writeFile(filePath, JSON.stringify(jsonData, null, 2))
    
    // 同时保存到public/data目录，确保UI能立即显示
    let publicFilePath: string
    if (dataType === 'case') {
      publicFilePath = path.join(process.cwd(), 'public', 'data', 'cases-data.json')
    } else {
      publicFilePath = path.join(process.cwd(), 'public', 'data', 'compliance-data.json')
    }
    
    // 确保public/data目录存在
    await fs.mkdir(path.dirname(publicFilePath), { recursive: true })
    await fs.writeFile(publicFilePath, JSON.stringify(jsonData, null, 2))

    return NextResponse.json({
      success: true,
      message: '数据保存成功',
      data: data
    })

  } catch (error) {
    console.error('保存数据失败:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: `保存失败: ${error instanceof Error ? error.message : '未知错误'}` 
      },
      { status: 500 }
    )
  }
}