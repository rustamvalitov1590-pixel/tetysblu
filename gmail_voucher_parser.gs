/**
 * Скрипт для автоматического чтения почты и отметки ваучеров в Supabase.
 * Инструкция по установке будет предоставлена отдельно.
 */

// ================= НАСТРОЙКИ =================
const SUPABASE_URL = 'https://zlnxvraopnwyfebfhmdj.supabase.co';
const SUPABASE_KEY = 'sb_publishable_2q7uufBD_85Esjf-1Mwrvg_hItngDPG'; // Используйте ваш anon_key или service_role key

// Настройки поиска писем
// Укажите email аквапарка, с которого приходят ваучеры
const SEARCH_QUERY = 'from:tickets@aquapark.com is:unread'; 

// =============================================

function processNewVouchers() {
  const threads = GmailApp.search(SEARCH_QUERY, 0, 10);
  
  for (let i = 0; i < threads.length; i++) {
    const messages = threads[i].getMessages();
    
    for (let j = 0; j < messages.length; j++) {
      const message = messages[j];
      
      if (message.isUnread()) {
        const subject = message.getSubject();
        const body = message.getPlainBody();
        
        // Попытка извлечь данные (Имя, Дата)
        const extractedData = extractDataFromEmail(subject, body);
        
        if (extractedData.name && extractedData.date) {
          Logger.log(`Найдено: ${extractedData.name} на ${extractedData.date}, Отмена: ${extractedData.isCancellation}`);
          
          const success = updateSupabase(extractedData.name, extractedData.date, !extractedData.isCancellation);
          
          if (success) {
            // Помечаем письмо как прочитанное, чтобы не обрабатывать повторно
            message.markRead();
          } else {
            Logger.log(`Не удалось обновить запись для ${extractedData.name}`);
          }
        } else {
          Logger.log(`Не удалось распознать Имя или Дату в письме: ${subject}`);
          // Можно тоже пометить прочитанным, если формат совсем неизвестен
          // message.markRead(); 
        }
      }
    }
  }
}

/**
 * Функция для извлечения имени и даты из текста письма или темы.
 * ВНИМАНИЕ: Вам нужно будет подкорректировать регулярные выражения 
 * под реальный текст писем, которые приходят от аквапарка.
 */
function extractDataFromEmail(subject, body) {
  let name = null;
  let date = null;
  let isCancellation = false;

  // 1. Проверяем, является ли это отменой
  if (subject.toLowerCase().includes('cancel') || subject.toLowerCase().includes('отмена') || body.toLowerCase().includes('отмена бронирования')) {
    isCancellation = true;
  }

  // 2. Ищем дату (Пример: 2026-08-20 или 20.08.2026)
  const dateMatch = body.match(/Дата:\s*(\d{2}\.\d{2}\.\d{4}|\d{4}-\d{2}-\d{2})/i) || subject.match(/(\d{2}\.\d{2}\.\d{4}|\d{4}-\d{2}-\d{2})/i);
  if (dateMatch) {
    // Приводим дату к формату YYYY-MM-DD для поиска в БД
    let rawDate = dateMatch[1];
    if (rawDate.includes('.')) {
      const parts = rawDate.split('.');
      date = `${parts[2]}-${parts[1]}-${parts[0]}`;
    } else {
      date = rawDate;
    }
  }

  // 3. Ищем имя (Пример: "Турист: Ivanov Ivan" или в теме)
  // Предположим, имя пишется после слова "Имя:" или "Guest:"
  const nameMatch = body.match(/(?:Гость|Guest|Имя):\s*([A-Za-zА-Яа-я\s]+)/i);
  if (nameMatch) {
    name = nameMatch[1].trim();
  }

  // Заглушка, если даты нет, но мы хотим искать хотя бы по имени
  // date = date || 'YYYY-MM-DD';

  return { name: name, date: date, isCancellation: isCancellation };
}

/**
 * Функция для запроса к Supabase и обновления статуса
 */
function updateSupabase(clientName, visitDate, newVoucherStatus) {
  const url = `${SUPABASE_URL}/rest/v1/calculations?visit_date=eq.${visitDate}&select=id,tourists`;
  
  const options = {
    method: 'GET',
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`
    },
    muteHttpExceptions: true
  };
  
  const response = UrlFetchApp.fetch(url, options);
  if (response.getResponseCode() !== 200) {
    Logger.log("Ошибка при получении данных: " + response.getContentText());
    return false;
  }
  
  const calculations = JSON.parse(response.getContentText());
  
  // Ищем совпадение по имени среди всех заявок на эту дату
  let targetId = null;
  const nameToSearch = clientName.toLowerCase();

  for (const calc of calculations) {
    const tourists = calc.tourists || [];
    for (const tourist of tourists) {
      if (tourist.fullName && tourist.fullName.toLowerCase().includes(nameToSearch)) {
        targetId = calc.id;
        break;
      }
    }
    if (targetId) break;
  }
  
  if (targetId) {
    // Нашли! Обновляем статус
    const updateUrl = `${SUPABASE_URL}/rest/v1/calculations?id=eq.${targetId}`;
    const payload = {
      voucher_status: newVoucherStatus
    };
    
    if (newVoucherStatus === false) {
       // Если это отмена, возможно, нужно изменить и общий статус заявки
       // payload.status = 'Отменен'; 
    }
    
    const patchOptions = {
      method: 'PATCH',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    };
    
    const updateResponse = UrlFetchApp.fetch(updateUrl, patchOptions);
    if (updateResponse.getResponseCode() >= 200 && updateResponse.getResponseCode() < 300) {
      Logger.log(`Успешно обновлена заявка ID ${targetId}`);
      return true;
    } else {
      Logger.log("Ошибка при обновлении: " + updateResponse.getContentText());
      return false;
    }
  }
  
  Logger.log(`Не найдено ни одной заявки на ${visitDate} с именем ${clientName}`);
  return false;
}
