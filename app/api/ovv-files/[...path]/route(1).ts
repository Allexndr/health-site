import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const filePath = params.path.join('/')
    const fullPath = path.join(process.cwd(), 'Anel Aiyanovna Ibragimova_20250718102232.CT', filePath)
    
    // Проверяем, что файл существует
    try {
      await fs.access(fullPath)
    } catch {
      return new NextResponse('Файл не найден', { status: 404 })
    }
    
    // Определяем тип содержимого
    let contentType = 'application/octet-stream'
    
    if (filePath.endsWith('.xml')) {
      contentType = 'application/xml'
    } else if (filePath.endsWith('.txt')) {
      contentType = 'text/plain; charset=utf-8'
    } else if (filePath.endsWith('.vol')) {
      contentType = 'application/octet-stream'
    } else if (filePath.endsWith('.dat')) {
      contentType = 'application/octet-stream'
    }
    
    // Читаем файл
    const fileBuffer = await fs.readFile(fullPath)
    
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Length': fileBuffer.length.toString(),
        'Cache-Control': 'public, max-age=3600'
      }
    })
    
  } catch (error) {
    console.error('Ошибка обслуживания файла OneVolumeViewer:', error)
    return new NextResponse('Внутренняя ошибка сервера', { status: 500 })
  }
} 
 
 
 
 