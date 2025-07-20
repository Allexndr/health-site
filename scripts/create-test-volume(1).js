const fs = require('fs')
const path = require('path')

// Создаем тестовый .vol файл для демонстрации
function createTestVolume() {
  const width = 64
  const height = 64
  const depth = 64
  const headerSize = 1024
  
  // Создаем заголовок (1024 байта)
  const header = new Uint8Array(headerSize)
  
  // Заполняем заголовок нулями (в реальном файле здесь были бы метаданные)
  for (let i = 0; i < headerSize; i++) {
    header[i] = 0
  }
  
  // Создаем объемные данные (16-bit)
  const totalVoxels = width * height * depth
  const volumeData = new Uint16Array(totalVoxels)
  
  // Создаем простую геометрическую форму (сферу в центре)
  const centerX = width / 2
  const centerY = height / 2
  const centerZ = depth / 2
  const radius = Math.min(width, height, depth) / 3
  
  for (let z = 0; z < depth; z++) {
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const index = z * width * height + y * width + x
        
        // Вычисляем расстояние от центра
        const dx = x - centerX
        const dy = y - centerY
        const dz = z - centerZ
        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz)
        
        // Создаем сферу с градиентом
        if (distance <= radius) {
          const normalizedDistance = distance / radius
          const intensity = Math.round((1 - normalizedDistance) * 65535)
          volumeData[index] = intensity
        } else {
          volumeData[index] = 0
        }
      }
    }
  }
  
  // Объединяем заголовок и данные
  const combinedData = new Uint8Array(headerSize + volumeData.byteLength)
  combinedData.set(header, 0)
  combinedData.set(new Uint8Array(volumeData.buffer), headerSize)
  
  // Создаем папку demo если её нет
  const demoDir = path.join(__dirname, '..', 'public', 'demo')
  if (!fs.existsSync(demoDir)) {
    fs.mkdirSync(demoDir, { recursive: true })
  }
  
  // Сохраняем файл
  const outputPath = path.join(demoDir, 'test_volume.vol')
  fs.writeFileSync(outputPath, combinedData)
  
  console.log(`Тестовый .vol файл создан: ${outputPath}`)
  console.log(`Размеры: ${width}×${height}×${depth}`)
  console.log(`Размер файла: ${(combinedData.length / (1024 * 1024)).toFixed(2)} MB`)
  
  return outputPath
}

// Создаем также ZIP архив с тестовым файлом
function createTestZip() {
  const JSZip = require('jszip')
  const fs = require('fs')
  const path = require('path')
  
  const zip = new JSZip()
  const volPath = path.join(__dirname, '..', 'public', 'demo', 'test_volume.vol')
  
  if (fs.existsSync(volPath)) {
    const volData = fs.readFileSync(volPath)
    zip.file('test_volume.vol', volData)
    
    // Добавляем метаданные
    const metadata = {
      dimensions: [64, 64, 64],
      spacing: [0.125, 0.125, 0.125],
      dataType: 'uint16',
      description: 'Тестовый объем для демонстрации'
    }
    zip.file('metadata.json', JSON.stringify(metadata, null, 2))
    
    const outputPath = path.join(__dirname, '..', 'public', 'demo', 'test_archive.zip')
    zip.generateAsync({ type: 'nodebuffer' }).then(buffer => {
      fs.writeFileSync(outputPath, buffer)
      console.log(`Тестовый ZIP архив создан: ${outputPath}`)
    })
  }
}

// Запускаем создание тестовых файлов
if (require.main === module) {
  try {
    createTestVolume()
    createTestZip()
    console.log('Тестовые файлы успешно созданы!')
  } catch (error) {
    console.error('Ошибка при создании тестовых файлов:', error)
  }
}

module.exports = { createTestVolume, createTestZip } 