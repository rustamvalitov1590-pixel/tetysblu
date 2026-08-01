$path = "c:\Users\rustava\Downloads\Проекты\tetis-blue-calc\index.html"
$html = [System.IO.File]::ReadAllText($path, [System.Text.Encoding]::UTF8)

# Find CRM bounds
$crmStart = '<section class="neon-card-blue p-5 mt-6 relative rounded-2xl shadow-sm flex flex-col">'
$crmEnd = 'id="exportData"'
$crmEndTag = '</section>'

$crmIndex = $html.IndexOf($crmStart)
if ($crmIndex -lt 0) { Write-Host "CRM Start not found"; exit 1 }
$crmEndSearch = $html.IndexOf($crmEnd, $crmIndex)
$crmEndIndex = $html.IndexOf($crmEndTag, $crmEndSearch) + $crmEndTag.Length

$crmBlock = $html.Substring($crmIndex, $crmEndIndex - $crmIndex)
$html = $html.Remove($crmIndex, $crmEndIndex - $crmIndex)
$crmBlock = $crmBlock.Replace('mt-6 ', '')

# Find Stats bounds
$statsStart = '<!-- Dynamic Stats Summary Panel -->'
$statsEndTag = '</section>'
$statsIndex = $html.IndexOf($statsStart)
if ($statsIndex -lt 0) { Write-Host "Stats Start not found"; exit 1 }

$statsEndSearch = $html.IndexOf('id="statBday"', $statsIndex)
$statsEndIndex = $html.IndexOf($statsEndTag, $statsEndSearch) + $statsEndTag.Length

$statsBlock = $html.Substring($statsIndex, $statsEndIndex - $statsIndex)
$html = $html.Remove($statsIndex, $statsEndIndex - $statsIndex)

# Insert before Итоговый расчет
$insertStart = '<!-- Calculated Estimate Summary'
$insertIndex = $html.IndexOf($insertStart)
if ($insertIndex -lt 0) { Write-Host "Insert point not found"; exit 1 }

$before = $html.Substring(0, $insertIndex)
$after = $html.Substring($insertIndex)

$newHtml = $before + $statsBlock + "`n`n                <!-- Export CRM Panel -->`n                " + $crmBlock + "`n`n                " + $after

[System.IO.File]::WriteAllText($path, $newHtml, [System.Text.Encoding]::UTF8)
Write-Host "Success"
