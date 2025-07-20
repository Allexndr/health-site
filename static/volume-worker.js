// Web Worker для обработки объемных данных
// Использует всю мощность процессора для обработки рентгена

let volumeData = null;
let processedSlices = [];

// Обработка сообщений от основного потока
self.onmessage = function(e) {
    const { type, data } = e.data;
    
    switch (type) {
        case 'PROCESS_VOLUME':
            processVolume(data);
            break;
            
        case 'APPLY_FILTERS':
            applyFilters(data);
            break;
            
        default:
            self.postMessage({ type: 'ERROR', data: { error: 'Неизвестная команда' } });
    }
};

// Обработка полного объема
function processVolume(data) {
    try {
        const { rawData, width, height, depth } = data;
        
        // Декодируем base64 данные
        const binaryString = atob(rawData);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        
        // Пропускаем заголовок (64 байта)
        const headerSize = 64;
        const dataBytes = bytes.slice(headerSize);
        
        // Конвертируем в 16-bit данные
        const volumeArray = new Uint16Array(dataBytes.buffer);
        
        // Обрабатываем каждый срез
        const sliceSize = width * height;
        const slices = [];
        
        for (let sliceIndex = 0; sliceIndex < depth; sliceIndex++) {
            const startIndex = sliceIndex * sliceSize;
            const endIndex = startIndex + sliceSize;
            
            if (endIndex <= volumeArray.length) {
                const sliceData = volumeArray.slice(startIndex, endIndex);
                const processedSlice = processSlice(sliceData, width, height);
                slices.push(processedSlice);
                
                // Отправляем прогресс
                const progress = Math.round((sliceIndex + 1) / depth * 100);
                self.postMessage({
                    type: 'PROGRESS',
                    data: {
                        current: sliceIndex + 1,
                        total: depth,
                        percentage: progress
                    }
                });
            }
        }
        
        // Отправляем готовый объем
        self.postMessage({
            type: 'VOLUME_READY',
            data: { slices }
        });
        
    } catch (error) {
        self.postMessage({
            type: 'ERROR',
            data: { error: error.message }
        });
    }
}

// Обработка одного среза
function processSlice(sliceData, width, height) {
    // Находим минимум и максимум для нормализации
    let min = sliceData[0];
    let max = sliceData[0];
    
    for (let i = 1; i < sliceData.length; i++) {
        if (sliceData[i] < min) min = sliceData[i];
        if (sliceData[i] > max) max = sliceData[i];
    }
    
    // Нормализуем данные в диапазон 0-255
    const range = max - min;
    const processed = new Uint8Array(sliceData.length);
    
    if (range > 0) {
        for (let i = 0; i < sliceData.length; i++) {
            processed[i] = Math.round(((sliceData[i] - min) / range) * 255);
        }
    }
    
    return Array.from(processed);
}

// Применение фильтров
function applyFilters(filterData) {
    const { contrast, brightness, slices } = filterData;
    
    const filteredSlices = slices.map(slice => {
        return slice.map(pixel => {
            // Применяем контраст
            let adjusted = (pixel - 128) * contrast + 128;
            
            // Применяем яркость
            adjusted = adjusted * brightness;
            
            // Ограничиваем диапазон
            return Math.max(0, Math.min(255, Math.round(adjusted)));
        });
    });
    
    self.postMessage({
        type: 'FILTERS_READY',
        data: { filteredSlices }
    });
} 