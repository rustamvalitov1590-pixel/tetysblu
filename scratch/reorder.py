import re

path = r"c:\Users\rustava\Downloads\Проекты\tetis-blue-calc\index.html"
with open(path, "r", encoding="utf-8") as f:
    html = f.read()

# 1. Change max-w-full to max-w-7xl mx-auto
html = html.replace('class="flex-1 w-full flex flex-col p-4 md:p-6 lg:p-8 pt-20 max-w-full"', 'class="flex-1 w-full flex flex-col p-4 md:p-6 lg:p-8 pt-20 max-w-[1400px] mx-auto"')

# 2. Extract CRM
crm_pattern = re.compile(r'\n\s*<section class="neon-card-blue p-5 mt-6 relative rounded-2xl shadow-sm flex flex-col">[\s\S]*?Тут появится текст для экспорта в CRM\.\.\."></textarea>\n\s*</section>')
crm_match = crm_pattern.search(html)
if not crm_match:
    print("CRM not found")
    exit(1)
crm_block = crm_match.group(0).replace('mt-6 ', '')
html = crm_pattern.sub('', html)

# 3. Extract Сводная статистика
stats_pattern = re.compile(r'\n\s*<!-- Dynamic Stats Summary Panel -->[\s\S]*?<span class="text-2xl sm:text-3xl font-black text-amber-300 mt-1 block relative z-10 drop-shadow-lg" id="statBday">0</span>\n\s*</div>\n\s*</div>\n\s*</section>')
stats_match = stats_pattern.search(html)
if not stats_match:
    print("Stats not found")
    exit(1)
stats_block = stats_match.group(0)
html = stats_pattern.sub('', html)

# 4. Insert before Итоговый расчет
insert_pattern = re.compile(r'\n\s*(?=<!-- Calculated Estimate Summary)')
if not insert_pattern.search(html):
    print("Insert point not found")
    exit(1)

html = insert_pattern.sub(stats_block + '\n\n                <!-- Export CRM Panel -->' + crm_block + '\n\n                ', html, count=1)

with open(path, "w", encoding="utf-8") as f:
    f.write(html)

print("Successfully reordered blocks")
