$path = "c:\Users\rustava\Downloads\Проекты\tetis-blue-calc\index.html"
$html = Get-Content -Path $path -Raw -Encoding UTF8

# 1. Change width
$html = $html -replace 'class="flex-1 w-full flex flex-col p-4 md:p-6 lg:p-8 pt-20 max-w-full"', 'class="flex-1 w-full flex flex-col p-4 md:p-6 lg:p-8 pt-20 max-w-[1400px] mx-auto"'

# 2. Extract CRM
$crmRegex = '(?s)\n\s*<section class="neon-card-blue p-5 mt-6 relative rounded-2xl shadow-sm flex flex-col">.*?Тут появится текст для экспорта в CRM\.\.\."></textarea>\n\s*</section>'
if ($html -match $crmRegex) {
    $crmBlock = $matches[0]
    $crmBlock = $crmBlock -replace 'mt-6 ', ''
    $html = $html -replace $crmRegex, ''
} else {
    Write-Host "CRM not found"
    exit 1
}

# 3. Extract Сводная статистика
$statsRegex = '(?s)\n\s*<!-- Dynamic Stats Summary Panel -->.*?<span class="text-2xl sm:text-3xl font-black text-amber-300 mt-1 block relative z-10 drop-shadow-lg" id="statBday">0</span>\n\s*</div>\n\s*</div>\n\s*</section>'
if ($html -match $statsRegex) {
    $statsBlock = $matches[0]
    $html = $html -replace $statsRegex, ''
} else {
    Write-Host "Stats not found"
    exit 1
}

# 4. Insert before Итоговый расчет
$insertRegex = '(?s)\n\s*(?=<!-- Calculated Estimate Summary)'
if ($html -match $insertRegex) {
    $replacement = $statsBlock + "`n`n                <!-- Export CRM Panel -->" + $crmBlock + "`n`n                "
    $html = $html -replace $insertRegex, $replacement
} else {
    Write-Host "Insert point not found"
    exit 1
}

[System.IO.File]::WriteAllText($path, $html, [System.Text.Encoding]::UTF8)
Write-Host "Successfully reordered blocks"
