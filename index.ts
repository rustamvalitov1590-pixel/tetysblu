<!DOCTYPE html>
<html lang="ru">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <meta name="theme-color" content="#03182f">
    <link rel="manifest" href="manifest.json">
    <title>Tetys Blue | Caspian Dream Park Calculator</title>

    <!-- Tetysblu Favicons -->
    <link rel="icon" type="image/png" sizes="32x32" href="https://tetysblu.com/src/favicon/favicon-32x32.png">
    <link rel="icon" type="image/png" sizes="16x16" href="https://tetysblu.com/src/favicon/favicon-16x16.png">
    <link rel="apple-touch-icon" sizes="180x180" href="https://tetysblu.com/src/favicon/apple-icon-180x180.png">

    <script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/exceljs/4.3.0/exceljs.min.js"></script>
    <script src="https://cdn.tailwindcss.com"></script>

    <!-- Premium Google Fonts -->
    <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Manrope:wght@500;700;800&display=swap"
        rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">

    <script>
        tailwind.config = {
            theme: {
                extend: {
                    fontFamily: {
                        sans: ['Inter', 'sans-serif'],
                    },
                    colors: {
                        brand: {
                            blue: '#0076ba',     /* Tetysblu Brand Main Blue */
                            sky: '#0ea5e9',      /* Caspian Aqua Sky Blue */
                            sand: '#fef3c7',     /* Caspian Gold Beach Sand */
                            dark: '#0f172a'      /* Slate 900 for dark texts */
                        }
                    }
                }
            }
        }
    </script>

    <style>
        /* ============================================================
           TETYS BLUE — Design tokens
           Concept: "dive in, then work in daylight". The login screen
           is an immersive, dark underwater moment; once inside, the
           workspace switches to a bright, high-contrast surface built
           for a cashier's screen in direct sun. A day/night toggle
           (#themeToggleBtn) lets staff switch the workspace itself
           to a calmer dark mode for evening shifts.
           ============================================================ */
        :root {
            --ink: #0B2A43;
            --ink-soft: #4B6478;
            --ink-faint: #7C93A3;
            --surface: #FFFFFF;
            --surface-soft: #F3F8FB;
            --canvas-a: #E9F3FA;
            --canvas-b: #F8FBFD;
            --brand: #0076BA;
            --brand-dark: #02649C;
            --aqua: #00B4D8;
            --coral: #FF6F51;
            --sun: #F2A900;
            --line: #D8E6EF;
            --line-soft: #E8F1F7;
            --shadow-card: 0 10px 25px -10px rgba(11, 42, 67, 0.16);
            --shadow-lift: 0 18px 34px -12px rgba(11, 42, 67, 0.22);
            --radius-lg: 22px;
            --radius-md: 14px;
            --radius-sm: 10px;
        }

        body.dark-mode {
            --ink: #EAF3FA;
            --ink-soft: #93B0C4;
            --ink-faint: #62839A;
            --surface: #0E2740;
            --surface-soft: #0A1F35;
            --canvas-a: #071C30;
            --canvas-b: #0A2338;
            --brand: #2EA8E6;
            --brand-dark: #1C8AC2;
            --aqua: #22D3EE;
            --coral: #FF8266;
            --sun: #FFC24D;
            --line: rgba(255, 255, 255, 0.12);
            --line-soft: rgba(255, 255, 255, 0.07);
            --shadow-card: 0 10px 25px -10px rgba(0, 0, 0, 0.4);
            --shadow-lift: 0 18px 34px -12px rgba(0, 0, 0, 0.5);
        }

        @media (prefers-reduced-motion: reduce) {

            *,
            *::before,
            *::after {
                animation-duration: 0.001ms !important;
                animation-iteration-count: 1 !important;
                transition-duration: 0.001ms !important;
                scroll-behavior: auto !important;
            }
        }

        /* ------------------------------------------------------------
           Typography — Manrope carries numbers & headings (a display
           face with a bit of character), Inter carries dense UI/data.
           -apple-system/BlinkMacSystemFont lead every stack so real
           iOS/macOS devices render native SF Pro automatically.
           ------------------------------------------------------------ */
        #appContent {
            font-family: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif;
        }

        .font-display,
        #totalPrice,
        #statAdl,
        #statChld,
        #statInf,
        #statPens,
        #statInv,
        #statBday {
            font-family: -apple-system, BlinkMacSystemFont, 'Manrope', 'Inter', sans-serif;
            font-variant-numeric: tabular-nums;
            letter-spacing: -0.01em;
        }

        /* ------------------------------------------------------------
           Motion system — iOS-flavoured: a snappy "spring" for taps
           and toggles, a smoother glide for cards entering/leaving.
           ------------------------------------------------------------ */
        :root {
            --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
            --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
        }

        #appContent button,
        #appContent .hover-lift,
        #appContent .glow-btn-cyan,
        #appContent select.glass-input,
        #appContent .tourist-row {
            transition: transform 0.18s var(--ease-spring),
                box-shadow 0.25s var(--ease-out),
                background-color 0.2s ease,
                border-color 0.2s ease,
                color 0.2s ease !important;
        }

        #appContent button:active {
            transform: scale(0.96) !important;
        }

        #appContent button:disabled:active {
            transform: none !important;
        }

        /* ------------------------------------------------------------
           Page canvas
           ------------------------------------------------------------ */
        body {
            overflow-x: hidden;
        }

        body.daylight-bg {
            background: linear-gradient(180deg, var(--canvas-a) 0%, var(--canvas-b) 55%, var(--canvas-b) 100%) fixed;
            color: var(--ink);
        }

        /* The dark underwater gradient used on the login screen (and on
           <body> before login) — kept as its own, always-dark identity. */
        .underwater-bg {
            background: radial-gradient(circle at 50% -20%, rgba(0, 180, 216, 0.6) 0%, rgba(3, 40, 77, 1) 70%, rgba(1, 15, 33, 1) 100%);
            position: relative;
            overflow: hidden;
        }

        .light-rays {
            position: absolute;
            top: -50%;
            left: 0;
            right: 0;
            bottom: 0;
            background: repeating-linear-gradient(10deg,
                    rgba(255, 255, 255, 0.05) 0px,
                    rgba(255, 255, 255, 0.05) 100px,
                    transparent 100px,
                    transparent 200px);
            filter: blur(40px);
            opacity: 0.6;
            animation: wave-light 15s infinite alternate ease-in-out;
            pointer-events: none;
        }

        .glass-orb {
            background: radial-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.03) 100%);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.3);
            box-shadow:
                0 0 50px rgba(0, 220, 255, 0.2),
                inset 0 0 40px rgba(255, 255, 255, 0.1),
                inset 0 0 10px rgba(255, 255, 255, 0.2);
        }

        .glass-bubble {
            background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.02) 100%);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            border: 1px solid rgba(255, 255, 255, 0.25);
            box-shadow:
                0 10px 30px rgba(0, 0, 0, 0.2),
                inset 0 2px 10px rgba(255, 255, 255, 0.15);
            animation: float 6s infinite ease-in-out;
        }

        .underwater-input {
            background: rgba(255, 255, 255, 0.08);
            border: 1px solid rgba(255, 255, 255, 0.3);
            color: white;
            backdrop-filter: blur(8px);
            transition: all 0.3s ease;
        }

        .underwater-input::placeholder {
            color: rgba(255, 255, 255, 0.6);
        }

        .underwater-input:focus {
            outline: none;
            background: rgba(255, 255, 255, 0.15);
            border-color: rgba(255, 255, 255, 0.7);
            box-shadow: 0 0 15px rgba(255, 255, 255, 0.2);
        }

        .text-glow {
            text-shadow: 0 0 10px rgba(255, 255, 255, 0.5), 0 0 20px rgba(0, 220, 255, 0.4);
        }

        #themeIcon.theme-icon-active {
            color: var(--sun) !important;
        }

        /* ------------------------------------------------------------
           Signature element — "the tide line": a thin animated wave
           marking the threshold between the underwater arrival screen
           and the daylight workspace. Sits under the header.
           ------------------------------------------------------------ */
        .tide-line {
            position: relative;
            height: 6px;
            margin: 10px 0 0;
            overflow: hidden;
            border-radius: 999px;
            background: var(--line-soft);
        }

        .tide-line::after {
            content: '';
            position: absolute;
            inset: 0;
            width: 200%;
            background: repeating-linear-gradient(90deg,
                    var(--aqua) 0, var(--aqua) 40px,
                    var(--brand) 40px, var(--brand) 80px);
            opacity: 0.55;
            animation: tide-drift 9s linear infinite;
        }

        @keyframes tide-drift {
            from {
                transform: translateX(0);
            }

            to {
                transform: translateX(-80px);
            }
        }

        /* ------------------------------------------------------------
           Dashboard surfaces (scoped to #appContent so the login
           screen keeps its own dark identity untouched)
           ------------------------------------------------------------ */
        #appContent header {
            background: rgba(255, 255, 255, 0.72) !important;
            border: 1px solid var(--line) !important;
            box-shadow: var(--shadow-card);
        }

        body.dark-mode #appContent header {
            background: rgba(14, 39, 64, 0.72) !important;
        }

        #appContent .glass-panel,
        #appContent .glass-panel-light,
        #appContent .dark-glass-panel,
        #appContent .neon-card-blue,
        #appContent .neon-card-green,
        #appContent .neon-card-amber,
        #appContent .neon-card-rose,
        #appContent .tourist-row,
        #appContent .glass-stat-box {
            background: var(--surface) !important;
            border: 1px solid var(--line) !important;
            box-shadow: var(--shadow-card) !important;
            color: var(--ink) !important;
            border-radius: var(--radius-lg) !important;
            backdrop-filter: none !important;
            -webkit-backdrop-filter: none !important;
            transition: transform 0.25s var(--ease-out), box-shadow 0.25s var(--ease-out), border-color 0.25s ease;
            position: relative;
        }

        #appContent .glass-panel::before,
        #appContent .neon-card-blue::before,
        #appContent .glass-stat-box::before {
            content: '';
            position: absolute;
            top: 0;
            left: 12%;
            right: 12%;
            height: 1px;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.9), transparent);
            pointer-events: none;
        }

        body.dark-mode #appContent .glass-panel::before,
        body.dark-mode #appContent .neon-card-blue::before,
        body.dark-mode #appContent .glass-stat-box::before {
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.12), transparent);
        }

        #appContent .glass-panel:hover,
        #appContent .neon-card-blue:hover,
        #appContent .tourist-row:hover,
        #appContent .glass-stat-box:hover {
            transform: translateY(-2px);
            box-shadow: var(--shadow-lift) !important;
            border-color: var(--aqua) !important;
        }

        #appContent .glass-input,
        #appContent .underwater-input {
            background: var(--surface) !important;
            border: 1.5px solid var(--line) !important;
            border-radius: var(--radius-sm) !important;
            color: var(--ink) !important;
            font-weight: 500 !important;
            transition: all 0.2s ease !important;
        }

        #appContent .glass-input:focus {
            outline: none !important;
            border-color: var(--aqua) !important;
            box-shadow: 0 0 0 4px rgba(0, 180, 216, 0.18) !important;
        }

        #appContent .glass-input::placeholder {
            color: var(--ink-faint) !important;
        }

        /* Force Tailwind text/bg utility classes used throughout the
           dashboard (authored for a dark glass background) onto the
           light-surface token palette. */
        #appContent .text-white,
        #appContent .text-slate-100,
        #appContent .text-slate-200,
        #appContent .text-slate-300 {
            color: var(--ink) !important;
        }

        #appContent .text-slate-400 {
            color: var(--ink-soft) !important;
        }

        #appContent .text-cyan-100,
        #appContent .text-cyan-200,
        #appContent .text-cyan-300,
        #appContent .text-cyan-400,
        #appContent .text-teal-100,
        #appContent .text-teal-200,
        #appContent .text-teal-300,
        #appContent .text-teal-400 {
            color: #0f766e !important;
        }

        #appContent .text-blue-100,
        #appContent .text-blue-200,
        #appContent .text-blue-300,
        #appContent .text-blue-400 {
            color: var(--brand-dark) !important;
        }

        #appContent .text-emerald-100,
        #appContent .text-emerald-200,
        #appContent .text-emerald-300,
        #appContent .text-emerald-400,
        #appContent .text-green-100,
        #appContent .text-green-200,
        #appContent .text-green-300,
        #appContent .text-green-400 {
            color: #047857 !important;
        }

        #appContent .text-purple-100,
        #appContent .text-purple-200,
        #appContent .text-purple-300,
        #appContent .text-purple-400 {
            color: #6d28d9 !important;
        }

        #appContent .text-rose-100,
        #appContent .text-rose-200,
        #appContent .text-rose-300,
        #appContent .text-rose-400 {
            color: #be123c !important;
        }

        #appContent .text-amber-100,
        #appContent .text-amber-200,
        #appContent .text-amber-300,
        #appContent .text-amber-400,
        #appContent .text-yellow-100,
        #appContent .text-yellow-200,
        #appContent .text-yellow-300,
        #appContent .text-yellow-400 {
            color: #b45309 !important;
        }

        #appContent .glass-orb,
        #appContent .glass-bubble {
            background: var(--surface) !important;
            border: 1px solid var(--line) !important;
            box-shadow: var(--shadow-card) !important;
        }

        #appContent .text-glow {
            text-shadow: none !important;
        }

        #appContent .light-rays {
            display: none !important;
        }

        #appContent .bg-white\/10 {
            background-color: var(--surface-soft) !important;
        }

        #appContent .bg-white\/5 {
            background-color: var(--surface-soft) !important;
        }

        #appContent .bg-white\/20 {
            background-color: var(--line-soft) !important;
        }

        #appContent .bg-black\/30 {
            background-color: var(--surface-soft) !important;
        }

        #appContent .border-white\/20 {
            border-color: var(--line) !important;
        }

        #appContent .border-white\/10,
        #appContent .border-white\/5 {
            border-color: var(--line-soft) !important;
        }

        #appContent .border-white\/50 {
            border-color: var(--line) !important;
        }

        #appContent .hover\:bg-white\/20:hover,
        #appContent .hover\:bg-white\/10:hover,
        #appContent .hover\:bg-white\/5:hover {
            background-color: var(--line-soft) !important;
        }

        #appContent .hover\:border-white\/20:hover {
            border-color: var(--aqua) !important;
        }

        /* Only the neutral (slate-based) hover:text-white targets flip to ink —
           colored buttons (rose/red/amber/blue solid-hover) correctly keep
           white text on hover and must NOT be touched here. */
        #appContent .text-slate-300.hover\:text-white:hover,
        #appContent .text-slate-400.hover\:text-white:hover,
        #appContent #themeToggleBtn.hover\:text-white:hover {
            color: var(--ink) !important;
        }

        #appContent nav.fixed.bottom-0 {
            background-color: var(--surface) !important;
            border-top-color: var(--line) !important;
        }

        #appContent .bg-black\/20,
        #appContent .bg-black\/40,
        #appContent .bg-black\/50,
        #appContent .bg-black\/60 {
            background-color: var(--surface-soft) !important;
        }

        #appContent #navCalcBtn.bg-white\/10 {
            background: var(--line-soft) !important;
            border: 1px solid var(--line) !important;
        }

        /* Nav buttons */
        #appContent #navCalcBtn,
        #appContent #navDashboardBtn,
        #appContent #navDatabaseBtn,
        #appContent a[href="client.html"] {
            color: var(--ink-soft) !important;
        }

        /* ------------------------------------------------------------
           Dark-mode counterparts (toggle button inside the dashboard).
           Tokens already flip via `body.dark-mode` above; these just
           correct a few spots where a hard-coded light value would
           otherwise win.
           ------------------------------------------------------------ */
        body.dark-mode #appContent .glass-input,
        body.dark-mode #appContent select.glass-input option {
            background-color: var(--surface-soft) !important;
            border-color: var(--line) !important;
            color: var(--ink) !important;
        }

        body.dark-mode #appContent #authScreen {
            /* no-op guard, kept for clarity */
        }

        /* ------------------------------------------------------------
           Glow buttons, pills, gradients, stat boxes — reusable across
           both themes via tokens.
           ------------------------------------------------------------ */
        .glow-btn-cyan {
            background: linear-gradient(135deg, var(--aqua) 0%, var(--brand) 100%) !important;
            border: 1px solid rgba(34, 211, 238, 0.5) !important;
            color: white !important;
            font-weight: 700 !important;
            letter-spacing: 0.03em;
            transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1) !important;
            border-radius: var(--radius-sm) !important;
            box-shadow: 0 6px 18px rgba(0, 180, 216, 0.35) !important;
        }

        .glow-btn-cyan:hover {
            box-shadow: 0 10px 24px rgba(0, 180, 216, 0.5) !important;
            transform: translateY(-2px);
        }

        .hover-lift {
            transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1) !important;
        }

        .hover-lift:hover {
            transform: translateY(-2px) !important;
            box-shadow: var(--shadow-lift) !important;
        }

        .hover-lift:active {
            transform: translateY(0) !important;
        }

        .hide-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }

        .hide-scrollbar::-webkit-scrollbar {
            display: none;
        }

        .pill-emerald {
            background-color: #10b981 !important;
            color: white !important;
            font-weight: bold;
            border-radius: 999px;
        }

        .pill-cyan {
            background-color: var(--aqua) !important;
            color: white !important;
            font-weight: bold;
            border-radius: 999px;
        }

        .pill-amber {
            background-color: var(--sun) !important;
            color: white !important;
            font-weight: bold;
            border-radius: 999px;
        }

        .pill-rose {
            background-color: #f43f5e !important;
            color: white !important;
            font-weight: bold;
            border-radius: 999px;
        }

        .pill-slate {
            background-color: #64748b !important;
            color: white !important;
            font-weight: bold;
            border-radius: 999px;
        }

        .glass-stat-box {
            position: relative;
            overflow: hidden;
        }

        /* ------------------------------------------------------------
           Analytics — editorial "graphs template" style: white cards,
           big regular-weight numbers, small dot-legends, thick rounded
           donut rings. Uses the same design tokens as the rest of the
           app, so it follows the light/dark toggle automatically.
           ------------------------------------------------------------ */
        #appContent .kpi-card {
            background: var(--surface);
            border: 1px solid var(--line);
            border-radius: var(--radius-lg);
            box-shadow: var(--shadow-card);
            padding: 22px 24px;
            transition: transform 0.25s var(--ease-out), box-shadow 0.25s var(--ease-out);
        }

        #appContent .kpi-card:hover {
            transform: translateY(-2px);
            box-shadow: var(--shadow-lift);
        }

        #appContent .kpi-dot {
            width: 9px;
            height: 9px;
            border-radius: 999px;
            display: inline-block;
        }

        #appContent .kpi-icon {
            color: var(--ink-faint);
            font-size: 15px;
        }

        #appContent .kpi-label {
            font-size: 12px;
            font-weight: 600;
            color: var(--ink-soft);
            margin-bottom: 6px;
        }

        #appContent .kpi-value {
            font-family: -apple-system, BlinkMacSystemFont, 'Manrope', 'Inter', sans-serif;
            font-variant-numeric: tabular-nums;
            font-size: 26px;
            font-weight: 800;
            letter-spacing: -0.02em;
            color: var(--ink);
            margin-bottom: 14px;
            line-height: 1.15;
        }

        #appContent .kpi-unit {
            font-size: 14px;
            font-weight: 700;
            color: var(--ink-soft);
        }

        #appContent .kpi-pill {
            display: inline-block;
            font-size: 10.5px;
            font-weight: 700;
            padding: 3px 10px;
            border-radius: 999px;
        }

        #appContent .chart-card {
            background: var(--surface);
            border: 1px solid var(--line);
            border-radius: var(--radius-lg);
            box-shadow: var(--shadow-card);
            padding: 22px 24px;
        }

        #appContent .chart-card-title {
            font-size: 13px;
            font-weight: 700;
            color: var(--ink);
        }

        #appContent .chart-card-subtitle {
            font-size: 11px;
            font-weight: 600;
            color: var(--ink-soft);
        }

        /* Skeleton loading shimmer */
        @keyframes shimmer {
            0% {
                background-position: -1000px 0;
            }

            100% {
                background-position: 1000px 0;
            }
        }

        .skeleton {
            animation: shimmer 2s infinite linear;
            background: linear-gradient(to right, rgba(0, 0, 0, 0.04) 4%, rgba(0, 0, 0, 0.08) 25%, rgba(0, 0, 0, 0.04) 36%);
            background-size: 1000px 100%;
        }

        .skeleton-light {
            animation: shimmer 2s infinite linear;
            background: linear-gradient(to right, #f1f5f9 4%, #e2e8f0 25%, #f1f5f9 36%);
            background-size: 1000px 100%;
        }

        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(10px);
            }

            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        .animate-fade-in-up {
            animation: fadeInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        /* Custom scrollbar */
        ::-webkit-scrollbar {
            width: 6px;
            height: 6px;
        }

        ::-webkit-scrollbar-track {
            background: transparent;
        }

        ::-webkit-scrollbar-thumb {
            background: #cbd5e1;
            border-radius: 10px;
        }

        ::-webkit-scrollbar-thumb:hover {
            background: #94a3b8;
        }

        body.dark-mode ::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.15);
        }

        body.dark-mode ::-webkit-scrollbar-thumb:hover {
            background: rgba(255, 255, 255, 0.25);
        }

        @keyframes float {

            0%,
            100% {
                transform: translateY(0) rotate(0deg);
            }

            50% {
                transform: translateY(-15px) rotate(2deg);
            }
        }

        @keyframes wave-light {
            0% {
                transform: translateX(-5%) skewX(-5deg);
                opacity: 0.4;
            }

            100% {
                transform: translateX(5%) skewX(5deg);
                opacity: 0.7;
            }
        }

        @keyframes bubble-rise {
            0% {
                transform: translateY(100px) scale(0.5);
                opacity: 0;
            }

            50% {
                opacity: 0.8;
            }

            100% {
                transform: translateY(-100px) scale(1.2);
                opacity: 0;
            }
        }

        /* iOS Safari Native Date Input Override to fix centering */
        .date-left-align::-webkit-date-and-time-value {
            text-align: left !important;
        }

        .date-left-align::-webkit-datetime-edit {
            text-align: left !important;
            padding: 0;
        }

        input[type="date"]::-webkit-date-and-time-value {
            text-align: left !important;
        }

        input[type="date"]::-webkit-datetime-edit {
            text-align: left !important;
            display: block;
            padding: 0;
        }

        /* Micro-animations & toasts */
        @keyframes toast-slide-up {
            0% {
                transform: translate(-50%, 20px) scale(0.95);
                opacity: 0;
            }

            15% {
                transform: translate(-50%, 0) scale(1);
                opacity: 1;
            }

            85% {
                transform: translate(-50%, 0) scale(1);
                opacity: 1;
            }

            100% {
                transform: translate(-50%, 20px) scale(0.95);
                opacity: 0;
            }
        }

        .toast-notification {
            position: fixed;
            bottom: 30px;
            left: 50%;
            transform: translateX(-50%);
            z-index: 9999;
            pointer-events: none;
            animation: toast-slide-up 3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes row-fade-in {
            from {
                opacity: 0;
                transform: translateY(-10px) scale(0.98);
            }

            to {
                opacity: 1;
                transform: translateY(0) scale(1);
            }
        }

        .animate-row-in {
            animation: row-fade-in 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes row-fade-out {
            from {
                opacity: 1;
                transform: translateY(0) scale(0.98);
            }

            to {
                opacity: 0;
                transform: translateX(20px) scale(0.95);
            }
        }

        .animate-row-out {
            animation: row-fade-out 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes shake {

            0%,
            100% {
                transform: translateX(0);
            }

            20%,
            60% {
                transform: translateX(-6px);
            }

            40%,
            80% {
                transform: translateX(6px);
            }
        }

        @keyframes popIn {
            from {
                opacity: 0;
                transform: scale(0.98);
            }

            to {
                opacity: 1;
                transform: scale(1);
            }
        }
    </style>
</head>

<body class="min-h-screen relative flex flex-col underwater-bg">


    <!-- Underwater Auth Screen (Marine Glassmorphism) -->
    <div id="authScreen"
        class="fixed inset-0 z-[5000] flex items-center justify-center p-4 underwater-bg transition-opacity duration-300">
        <!-- Floating Light Rays -->
        <div class="light-rays"></div>

        <!-- Random tiny background bubbles -->
        <div class="absolute inset-0 pointer-events-none overflow-hidden">
            <div class="absolute w-3 h-3 bg-white/20 rounded-full left-1/4 bottom-0"
                style="animation: bubble-rise 4s infinite ease-in;"></div>
            <div class="absolute w-5 h-5 bg-white/10 rounded-full left-1/2 bottom-10"
                style="animation: bubble-rise 6s infinite ease-in 1s;"></div>
            <div class="absolute w-2 h-2 bg-white/20 rounded-full right-1/4 bottom-20"
                style="animation: bubble-rise 5s infinite ease-in 2s;"></div>
        </div>

        <!-- Floating Decorative Bubbles (Left Side) -->
        <div class="absolute left-4 md:left-20 top-1/4 glass-bubble rounded-full p-4 hidden sm:flex items-center justify-center text-cyan-300"
            style="width: 80px; height: 80px; animation-delay: 0s;">
            <i class="fa-solid fa-ticket text-3xl opacity-80"></i>
        </div>
        <div class="absolute left-10 md:left-32 bottom-1/4 glass-bubble rounded-full p-3 hidden sm:flex items-center justify-center text-cyan-300"
            style="width: 100px; height: 100px; animation: float-delay-1 7s infinite ease-in-out; animation-delay: 1s;">
            <i class="fa-solid fa-tornado text-4xl opacity-80"></i>
        </div>

        <!-- Floating Decorative Bubbles (Right Side) -->
        <div class="absolute right-10 md:right-32 top-1/3 glass-bubble rounded-full flex flex-col items-center justify-center text-white hidden sm:flex"
            style="width: 110px; height: 110px; animation: float-delay-2 8s infinite ease-in-out;">
            <span class="text-[8px] uppercase tracking-widest opacity-80">Park Capacity</span>
            <div class="relative mt-1">
                <svg class="w-12 h-12 transform -rotate-90">
                    <circle cx="24" cy="24" r="20" stroke="rgba(255,255,255,0.1)" stroke-width="3" fill="none"></circle>
                    <circle cx="24" cy="24" r="20" stroke="#ff5252" stroke-width="3" fill="none" stroke-dasharray="125"
                        stroke-dashoffset="30"></circle>
                </svg>
                <span class="absolute inset-0 flex items-center justify-center text-sm font-bold">78%</span>
            </div>
        </div>

        <!-- Central Glowing Glass Orb -->
        <div
            class="glass-orb relative z-10 w-[90vw] max-w-[420px] aspect-square rounded-full flex flex-col items-center justify-center p-8 md:p-10">
            <div class="text-center mb-6 w-full">
                <!-- Tetys Blue Logo Area -->
                <div class="mb-2 relative flex justify-center">
                    <i
                        class="fa-solid fa-dolphin absolute -top-4 -left-2 text-cyan-300 text-xl transform -rotate-12 opacity-80"></i>
                    <i
                        class="fa-solid fa-dolphin absolute -top-2 -right-1 text-cyan-300 text-lg transform rotate-45 opacity-80 scale-x-[-1]"></i>
                    <h2 class="font-display text-3xl md:text-4xl font-black text-white tracking-wider text-glow mt-2">
                        TETYS BLUE</h2>
                </div>
                <p class="text-[9px] md:text-[10px] font-bold text-cyan-100 uppercase tracking-widest mt-1 opacity-90">
                    Панель расчетов</p>
                <p class="text-[8px] font-medium text-cyan-200 uppercase tracking-widest opacity-70">Сезон 2026</p>
            </div>

            <div class="w-full max-w-[280px] space-y-4">
                <div class="relative">
                    <input type="text" id="authLogin" placeholder="ЛОГИН"
                        class="w-full pl-6 pr-10 py-3 rounded-full underwater-input text-xs font-bold tracking-widest"
                        autocomplete="off">
                    <i
                        class="fa-solid fa-fish absolute right-4 top-1/2 -translate-y-1/2 text-cyan-200 text-sm opacity-80"></i>
                </div>
                <div class="relative">
                    <input type="password" id="authPin" placeholder="ПАРОЛЬ"
                        class="w-full pl-6 pr-10 py-3 rounded-full underwater-input text-xs font-bold tracking-widest">
                    <i
                        class="fa-solid fa-key absolute right-4 top-1/2 -translate-y-1/2 text-cyan-200 text-sm opacity-80"></i>
                </div>

                <div id="authFormBody" class="pt-2 w-full text-center">
                    <p id="authError"
                        class="text-red-400 text-xs font-semibold hidden transition-opacity duration-300 text-center pb-2 text-glow">
                        Неверный логин или пароль</p>
                    <button id="authBtn"
                        class="w-full btn-coral rounded-full py-3 text-sm font-bold tracking-widest uppercase mb-4">
                        Войти в систему
                    </button>

                    <a href="client.html"
                        class="inline-block mt-2 text-xs font-bold text-cyan-200 hover:text-white transition-colors pb-0.5 border-b border-transparent hover:border-cyan-200">
                        Я клиент. Перейти к покупке билетов <i class="fa-solid fa-arrow-right ml-1 text-[10px]"></i>
                    </a>
                </div>
            </div>
        </div>
    </div>

    <!-- Main Dashboard Container -->
    <div id="appContent"
        class="hidden h-screen w-full max-w-[1400px] mx-auto flex flex-col relative z-10 overflow-hidden text-slate-100">

        <!-- Header wrapper with matching horizontal padding -->
        <div class="px-4 md:px-8 pt-3 flex-shrink-0">
            <!-- TOP NAVBAR -->
            <header
                class="bg-transparent backdrop-blur-lg rounded-2xl border border-white/10 flex items-center justify-between px-4 py-3 md:px-6 z-50 shadow-lg">
                <!-- Brand Logo -->
                <div class="flex items-center space-x-3">
                    <img src="assets/logo.png" alt="Tetys Blu"
                        class="h-8 md:h-10 drop-shadow-md shrink-0 object-contain">
                    <div class="border-l border-white/20 pl-3">
                        <span class="text-[9px] md:text-[11px] font-black text-white uppercase tracking-widest">Tetys
                            Blue<br><span class="text-[7px] md:text-[8px] text-cyan-300">Aquatic Park</span></span>
                    </div>
                </div>

                <!-- Desktop Navigation Menu (Hidden on Mobile) -->
                <nav class="hidden md:flex items-center space-x-2 flex-1 justify-center px-4">
                    <button id="navCalcBtn"
                        class="flex items-center space-x-2 px-3 py-2 bg-white/10 rounded-xl text-white font-bold transition-all border border-white/10 shadow-lg">
                        <i class="fa-solid fa-calculator text-cyan-400 w-4 text-center"></i>
                        <span class="text-xs">Калькулятор</span>
                    </button>
                    <button id="navDashboardBtn"
                        class="flex items-center space-x-2 px-3 py-2 hover:bg-white/5 rounded-xl text-slate-300 hover:text-white font-medium transition-all">
                        <i class="fa-solid fa-chart-simple text-emerald-400 w-4 text-center"></i>
                        <span class="text-xs">Аналитика</span>
                    </button>
                    <button id="navDatabaseBtn"
                        class="flex items-center space-x-2 px-3 py-2 hover:bg-white/5 rounded-xl text-slate-300 hover:text-white font-medium transition-all">
                        <i class="fa-solid fa-database text-amber-400 w-4 text-center"></i>
                        <span class="text-xs">База данных</span>
                    </button>
                    <a href="client.html" target="_blank"
                        class="flex items-center space-x-2 px-3 py-2 hover:bg-white/5 rounded-xl text-slate-300 hover:text-white font-medium transition-all">
                        <i class="fa-solid fa-up-right-from-square text-slate-400 w-4 text-center"></i>
                        <span class="text-xs">Клиентам</span>
                    </a>
                </nav>

                <!-- Right Controls -->
                <div class="flex items-center gap-2 md:gap-4">
                    <!-- Live Date and Time -->
                    <div class="hidden xl:block mr-2 border-r border-white/10 pr-4">
                        <h1 id="liveClockDisplay"
                            class="text-[11px] font-normal text-slate-300 tracking-wide font-sans"></h1>
                    </div>
                    <button id="themeToggleBtn"
                        class="flex w-8 h-8 md:w-10 md:h-10 items-center justify-center hover:bg-white/10 rounded-full text-slate-300 hover:text-white transition-all"
                        title="Светлая/тёмная тема">
                        <i id="themeIcon" class="fa-solid fa-moon text-sm md:text-base"></i>
                    </button>
                    <!-- Admin Profile -->
                    <div
                        class="flex items-center gap-2 md:gap-3 pl-2 sm:border-l sm:border-white/10 cursor-pointer group">
                        <img src="assets/admin_avatar.png" alt="Admin"
                            class="w-8 h-8 md:w-10 md:h-10 rounded-full object-cover border-2 border-transparent group-hover:border-cyan-400 transition-colors shadow-lg">
                        <div class="hidden sm:block">
                            <p class="text-xs font-bold text-white leading-tight">Администратор</p>
                            <p class="text-[9px] text-slate-400">(Admin)</p>
                        </div>
                    </div>
                    <!-- Logout -->
                    <button id="logoutBtn"
                        class="w-8 h-8 md:w-auto md:px-3 md:py-2 flex items-center justify-center md:space-x-2 hover:bg-rose-500/20 rounded-xl text-rose-400 hover:text-rose-300 font-bold transition-all ml-1 md:ml-2">
                        <i class="fa-solid fa-arrow-right-from-bracket"></i>
                        <span class="hidden md:inline text-xs">Выйти</span>
                    </button>
                </div>
            </header>
            <div class="tide-line" aria-hidden="true"></div>
        </div>

        <!-- MAIN CONTENT AREA -->
        <main class="flex-1 flex flex-col min-h-0 overflow-hidden px-4 md:px-8 pb-24 md:pb-8 hide-scrollbar">

            <!-- SPA Views Container -->
            <div id="view-calculator"
                class="app-view flex-1 flex flex-col w-full overflow-y-auto hide-scrollbar pt-6 md:pt-10">

                <!-- Stat Cards moved to Dashboard view -->

                <!-- 2-Column Responsive Dashboard Layout (Identical to Concept Grid) -->
                <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

                    <!-- LEFT COLUMN: "Your Visit Details" & Stats (4/12 wide) -->
                    <div class="lg:col-span-4 relative">
                        <div class="flex flex-col gap-6 sticky lg:top-6 lg:h-[calc(100vh-4rem)]">

                            <!-- Visit Details Form -->
                            <section class="neon-card-blue p-6 relative shrink-0">

                                <h2 class="text-base font-bold text-white mb-5 flex items-center drop-shadow-md">
                                    <i class="fa-solid fa-circle-info text-cyan-400 mr-2"></i>
                                    Параметры посещения
                                </h2>

                                <div class="space-y-4">
                                    <!-- Client Type -->
                                    <!-- Client Type -->
                                    <div>
                                        <label
                                            class="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 drop-shadow-sm">Тип
                                            клиента</label>
                                        <div class="relative w-full overflow-hidden rounded-xl">
                                            <i
                                                class="fa-solid fa-user-group absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
                                            <select id="clientType"
                                                class="w-full pl-9 pr-8 py-3 glass-input text-xs sm:text-sm appearance-none cursor-pointer text-ellipsis">
                                                <option value="tourist">Турист (Прямые продажи)</option>
                                                <option value="agent">Агент (Оптовые продажи)</option>
                                            </select>
                                            <i
                                                class="fa-solid fa-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none"></i>
                                        </div>
                                    </div>

                                    <div class="grid grid-cols-1 2xl:grid-cols-2 gap-4">
                                        <!-- Visit Date -->
                                        <div>
                                            <label
                                                class="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 drop-shadow-sm">Дата
                                                визита</label>
                                            <div class="relative w-full overflow-hidden rounded-xl">
                                                <i
                                                    class="fa-regular fa-calendar absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
                                                <input type="date" id="visitDate" autocomplete="off"
                                                    class="w-full pl-9 pr-2 py-3 glass-input text-xs sm:text-sm "
                                                    style="max-width: 100%; box-sizing: border-box;" />
                                            </div>
                                            <p id="dateWarning"
                                                class="text-xs text-rose-400 font-semibold mt-1.5 hidden drop-shadow-sm">
                                                <i class="fa-solid fa-triangle-exclamation mr-1"></i>Тариф не найден
                                            </p>
                                        </div>

                                        <!-- Tariff Type -->
                                        <div>
                                            <label
                                                class="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 drop-shadow-sm">Тип
                                                тарифа</label>
                                            <div class="relative w-full overflow-hidden rounded-xl">
                                                <i
                                                    class="fa-solid fa-clock absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
                                                <select id="tariffType"
                                                    class="w-full pl-9 pr-8 py-3 glass-input text-xs sm:text-sm appearance-none cursor-pointer text-ellipsis">
                                                    <option value="day">Дневной</option>
                                                    <option value="evening">Вечерний</option>
                                                </select>
                                                <i
                                                    class="fa-solid fa-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none"></i>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Early Booking Toggle (Hidden by default) -->
                                    <div id="earlyBookingContainer"
                                        class="hidden bg-blue-900/30 border border-blue-400/30 rounded-xl p-3 flex items-center justify-between transition-all backdrop-blur-sm">
                                        <div class="flex items-center gap-2.5">
                                            <i
                                                class="fa-solid fa-percent text-blue-400 bg-white/10 w-8 h-8 rounded-full flex items-center justify-center shadow-sm"></i>
                                            <div>
                                                <p class="text-xs font-bold text-white drop-shadow-sm">Раннее
                                                    бронирование</p>
                                                <p class="text-[10px] text-blue-200">Скидка -15% (на август)</p>
                                            </div>
                                        </div>
                                        <div class="flex items-center justify-center bg-emerald-500/20 border border-emerald-400/30 text-emerald-400 rounded-full w-6 h-6"
                                            title="Акция применена автоматически">
                                            <i class="fa-solid fa-check text-xs"></i>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <!-- Bulk Add Form (Текстовый ввод) -->
                            <section class="neon-card-blue p-6 relative flex flex-col min-h-[180px]">
                                <h2 class="text-base font-bold text-white mb-3 flex items-center drop-shadow-md">
                                    <i class="fa-solid fa-file-text text-cyan-400 mr-2"></i>
                                    Текстовый ввод гостей
                                </h2>
                                <div
                                    class="glass-stat-box border border-white/5 mb-3 p-3 flex items-start gap-2.5 bg-white/5 rounded-xl">
                                    <i class="fa-brands fa-whatsapp text-emerald-400 text-base mt-0.5"></i>
                                    <p class="text-[11px] text-slate-300 leading-relaxed">
                                        <span class="font-bold text-white block mb-0.5">Автоматический импорт</span>
                                        Просто скопируйте текст из мессенджера. Система сама извлечет имена, определит
                                        возраст и отфильтрует лишнюю информацию.
                                    </p>
                                </div>
                                <textarea id="bulkText" class="w-full glass-input p-3 text-xs resize-none mb-3 h-[70px]"
                                    placeholder="Тетис на 06.06&#10;Kossymov Dias 15.04.2017 chld&#10;Otemissova Meruert 18.05.1998 adl"></textarea>
                                <div class="flex flex-col sm:flex-row gap-2">
                                    <button id="parseBulkBtn"
                                        class="w-full sm:flex-1 glow-btn-cyan py-2.5 rounded-xl text-xs font-bold order-2 sm:order-2 transition-all">
                                        Распознать
                                    </button>
                                    <button id="clearBulkTextBtn" onclick="document.getElementById('bulkText').value=''"
                                        class="w-full sm:w-auto justify-center px-4 py-2.5 text-xs font-bold text-rose-400 bg-rose-500/10 hover:bg-rose-500 hover:text-white rounded-xl transition-colors border border-rose-500/30 hover:border-rose-500 flex items-center shadow-sm order-3 sm:order-1 whitespace-nowrap">
                                        <i class="fa-solid fa-trash-can mr-1.5"></i> Очистить
                                    </button>
                                </div>
                            </section>
                        </div> <!-- End sticky left column wrapper -->
                    </div>

                    <!-- RIGHT COLUMN: Tourist List, Total Price, Text Input (8/12 wide) -->
                    <div class="lg:col-span-8 space-y-6">

                        <!-- Main Tourist List Card -->
                        <section class="neon-card-blue p-6 relative min-h-[500px]">
                            <div
                                class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                                <div>
                                    <h2 class="text-base font-bold text-white flex items-center drop-shadow-md">
                                        <i class="fa-solid fa-users text-cyan-400 mr-2"></i>
                                        Список посетителей
                                    </h2>
                                    <p class="text-xs text-slate-300 mt-0.5 drop-shadow-sm">Добавьте гостей или
                                        загрузите текстовый реестр</p>
                                </div>

                                <div class="flex flex-wrap items-center justify-end gap-2 w-full sm:w-auto">
                                    <!-- Detailed mode buttons wrapper -->
                                    <div id="detailedActionButtons"
                                        class="flex flex-wrap items-center justify-end gap-2 w-full sm:w-auto">
                                        <button id="addTouristBtn"
                                            class="w-full sm:w-auto justify-center glow-btn-cyan px-4 py-2.5 text-xs font-bold flex items-center shadow-md">
                                            <i class="fa-solid fa-user-plus mr-1.5"></i> Добавить гостя
                                        </button>
                                        <button id="clearAllBtn" onclick="window.clearAllTourists()"
                                            class="w-full sm:w-auto justify-center px-4 py-2.5 text-xs font-bold text-red-500 bg-red-50 hover:bg-red-500 hover:text-white rounded-xl transition-colors border border-red-200 hover:border-red-500 flex items-center shadow-sm">
                                            <i class="fa-solid fa-trash-can mr-1.5"></i> Очистить список
                                        </button>
                                    </div>

                                    <!-- Quick mode buttons wrapper -->
                                    <button id="resetQuickBtn" onclick="resetQuickCounts()"
                                        class="hidden w-full sm:w-auto justify-center px-4 py-2.5 text-xs font-bold text-red-500 bg-red-50 hover:bg-red-500 hover:text-white rounded-xl transition-colors border border-red-200 hover:border-red-500 flex items-center shadow-sm">
                                        <i class="fa-solid fa-rotate-left mr-1.5"></i> Сбросить количество
                                    </button>
                                </div>
                            </div>

                            <!-- Mode Switcher Tabs & Search -->
                            <div
                                class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 border-b border-white/10 pb-4 mb-6">
                                <div
                                    class="bg-black/30 p-1.5 rounded-xl flex items-center w-full sm:w-auto relative mb-2 sm:mb-0 border border-white/5 shadow-inner">
                                    <button id="tabDetailed" onclick="switchCalcMode('detailed')"
                                        class="flex-1 sm:flex-none justify-center px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer z-10 bg-blue-500/20 text-white shadow-[0_2px_8px_rgba(0,0,0,0.2)] border border-blue-400/30 scale-100">
                                        <i class="fa-solid fa-list-ul"></i> Посписочный ввод
                                    </button>
                                    <button id="tabQuick" onclick="switchCalcMode('quick')"
                                        class="flex-1 sm:flex-none justify-center px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer z-10 text-slate-400 hover:text-white border-transparent scale-95">
                                        <i class="fa-solid fa-calculator"></i> Быстрый расчет
                                    </button>
                                </div>
                                <div id="searchContainer" class="w-full sm:w-64">
                                    <div class="relative">
                                        <i
                                            class="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
                                        <input type="text" id="guestSearchInput" placeholder="Поиск гостя..."
                                            oninput="filterGuests(this.value)"
                                            class="w-full pl-8 pr-3 py-1.5 glass-input text-xs rounded-lg transition-colors border-white/10">
                                    </div>
                                </div>
                            </div>

                            <!-- Detailed Mode Container -->
                            <div id="detailedModeContainer" class="w-full">
                                <!-- Table-Style Header for Row Data -->
                                <div
                                    class="hidden md:grid grid-cols-12 gap-3 mb-2 px-3 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest drop-shadow-sm">
                                    <div class="col-span-3">ФИО туриста</div>
                                    <div class="col-span-2">Дата рождения</div>
                                    <div class="col-span-1 text-center">Возраст</div>
                                    <div class="col-span-1 text-center">Тип</div>
                                    <div class="col-span-2 text-center">Льгота</div>
                                    <div class="col-span-2 text-right pr-2">Цена</div>
                                    <div class="col-span-1 text-center"></div>
                                </div>

                                <!-- Tourist Dynamic Container -->
                                <div id="touristList" class="space-y-3">
                                    <!-- Injected dynamically in app.js -->
                                </div>
                            </div>

                            <!-- Quick Mode Container -->
                            <div id="quickModeContainer" class="hidden space-y-4">
                                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <!-- Adults Category -->
                                    <div
                                        class="flex flex-col p-4 bg-white/5 border border-white/10 rounded-2xl transition-all hover:bg-white/10 hover:border-white/20">
                                        <div class="flex items-center justify-between">
                                            <div class="flex items-center gap-3">
                                                <div
                                                    class="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-sm border border-blue-400/20">
                                                    ВЗР</div>
                                                <div>
                                                    <div class="text-xs font-bold text-white drop-shadow-sm">Взрослые
                                                        (ADL)</div>
                                                    <div class="text-[10px] text-slate-400">От 12 лет</div>
                                                </div>
                                            </div>
                                            <div class="flex items-center gap-3">
                                                <button onclick="changeQuickCount('adl', -1)"
                                                    class="w-8 h-8 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center text-white hover:bg-white/20 active:scale-95 transition-all font-bold text-lg">-</button>
                                                <input type="number" id="quick_adl" value="0" min="0"
                                                    onchange="updateQuickCount('adl', parseInt(this.value) || 0)"
                                                    class="w-12 text-center bg-transparent font-bold text-white text-sm focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                                                <button onclick="changeQuickCount('adl', 1)"
                                                    class="w-8 h-8 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center text-white hover:bg-white/20 active:scale-95 transition-all font-bold text-lg">+</button>
                                            </div>
                                        </div>
                                        <div id="quick_statuses_adl" class="mt-3 flex flex-col gap-2 empty:hidden">
                                        </div>
                                    </div>

                                    <!-- Children Category -->
                                    <div
                                        class="flex flex-col p-4 bg-white/5 border border-white/10 rounded-2xl transition-all hover:bg-white/10 hover:border-white/20">
                                        <div class="flex items-center justify-between">
                                            <div class="flex items-center gap-3">
                                                <div
                                                    class="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold text-sm border border-teal-400/20">
                                                    ДЕТ</div>
                                                <div>
                                                    <div class="text-xs font-bold text-white drop-shadow-sm">Дети (CHLD)
                                                    </div>
                                                    <div class="text-[10px] text-slate-400">От 4 до 11 лет</div>
                                                </div>
                                            </div>
                                            <div class="flex items-center gap-3">
                                                <button onclick="changeQuickCount('chld', -1)"
                                                    class="w-8 h-8 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center text-white hover:bg-white/20 active:scale-95 transition-all font-bold text-lg">-</button>
                                                <input type="number" id="quick_chld" value="0" min="0"
                                                    onchange="updateQuickCount('chld', parseInt(this.value) || 0)"
                                                    class="w-12 text-center bg-transparent font-bold text-white text-sm focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                                                <button onclick="changeQuickCount('chld', 1)"
                                                    class="w-8 h-8 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center text-white hover:bg-white/20 active:scale-95 transition-all font-bold text-lg">+</button>
                                            </div>
                                        </div>
                                        <div id="quick_statuses_chld" class="mt-3 flex flex-col gap-2 empty:hidden">
                                        </div>
                                    </div>

                                    <!-- Pensioners Category -->
                                    <div
                                        class="flex flex-col p-4 bg-white/5 border border-white/10 rounded-2xl transition-all hover:bg-white/10 hover:border-white/20">
                                        <div class="flex items-center justify-between">
                                            <div class="flex items-center gap-3">
                                                <div
                                                    class="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-sm border border-purple-400/20">
                                                    ПЕН</div>
                                                <div>
                                                    <div class="text-xs font-bold text-white drop-shadow-sm">Пенсионеры
                                                        (SNR)</div>
                                                    <div class="text-[10px] text-slate-400">Скидка 50%</div>
                                                </div>
                                            </div>
                                            <div class="flex items-center gap-3">
                                                <button onclick="changeQuickCount('pens', -1)"
                                                    class="w-8 h-8 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center text-white hover:bg-white/20 active:scale-95 transition-all font-bold text-lg">-</button>
                                                <input type="number" id="quick_pens" value="0" min="0"
                                                    onchange="updateQuickCount('pens', parseInt(this.value) || 0)"
                                                    class="w-12 text-center bg-transparent font-bold text-white text-sm focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                                                <button onclick="changeQuickCount('pens', 1)"
                                                    class="w-8 h-8 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center text-white hover:bg-white/20 active:scale-95 transition-all font-bold text-lg">+</button>
                                            </div>
                                        </div>
                                        <div id="quick_statuses_pens" class="mt-3 flex flex-col gap-2 empty:hidden">
                                        </div>
                                    </div>

                                    <!-- Infants Category -->
                                    <div
                                        class="flex flex-col p-4 bg-white/5 border border-white/10 rounded-2xl transition-all hover:bg-white/10 hover:border-white/20">
                                        <div class="flex items-center justify-between">
                                            <div class="flex items-center gap-3">
                                                <div
                                                    class="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm border border-emerald-400/20">
                                                    МЛД</div>
                                                <div>
                                                    <div class="text-xs font-bold text-white drop-shadow-sm">Младенцы
                                                        (INF)</div>
                                                    <div class="text-[10px] text-slate-400">До 3 лет (бесплатно)</div>
                                                </div>
                                            </div>
                                            <div class="flex items-center gap-3">
                                                <button onclick="changeQuickCount('inf', -1)"
                                                    class="w-8 h-8 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center text-white hover:bg-white/20 active:scale-95 transition-all font-bold text-lg">-</button>
                                                <input type="number" id="quick_inf" value="0" min="0"
                                                    onchange="updateQuickCount('inf', parseInt(this.value) || 0)"
                                                    class="w-12 text-center bg-transparent font-bold text-white text-sm focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                                                <button onclick="changeQuickCount('inf', 1)"
                                                    class="w-8 h-8 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center text-white hover:bg-white/20 active:scale-95 transition-all font-bold text-lg">+</button>
                                            </div>
                                        </div>
                                        <div id="quick_statuses_inf" class="mt-3 flex flex-col gap-2 empty:hidden">
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Empty State Vector Illustration -->
                            <div id="emptyState"
                                class="hidden flex flex-col items-center justify-center py-16 text-slate-400 text-center">
                                <div class="relative w-20 h-20 mb-5">
                                    <div class="absolute inset-0 bg-blue-500/20 rounded-full blur-xl animate-pulse">
                                    </div>
                                    <div
                                        class="relative w-20 h-20 bg-white/5 border border-white/10 rounded-full flex items-center justify-center backdrop-blur-sm shadow-[0_0_15px_rgba(0,0,0,0.5)]">
                                        <i
                                            class="fa-solid fa-users-rectangle text-3xl text-cyan-400 drop-shadow-md"></i>
                                    </div>
                                </div>
                                <p class="text-base font-bold text-white drop-shadow-sm mb-2">Список гостей пока пуст
                                </p>
                                <p class="text-xs text-slate-400 max-w-xs leading-relaxed">
                                    Добавьте гостей вручную кнопкой <span class="text-cyan-400 font-semibold">«Добавить
                                        гостя»</span> или вставьте список в поле слева для авто-распознавания.
                                </p>
                            </div>
                        </section>

                        <!-- Top row: Итоговый расчет + Сводная статистика на одном уровне -->
                        <div class="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">

                            <!-- Calculated Estimate Summary (compact) -->
                            <section
                                class="xl:col-span-6 neon-card-blue p-4 rounded-2xl relative overflow-hidden shadow-sm border border-blue-500/20 flex flex-col justify-center">
                                <!-- Concept Background Waves Inside Card -->
                                <svg class="absolute inset-0 w-full h-full text-white/10 pointer-events-none"
                                    viewBox="0 0 100 100" preserveAspectRatio="none">
                                    <path d="M0 80 Q 25 50 50 80 T 100 80 L 100 100 L 0 100 Z" fill="currentColor" />
                                    <path d="M0 60 Q 30 75 60 55 T 100 65 L 100 100 L 0 100 Z" fill="currentColor"
                                        opacity="0.5" />
                                </svg>

                                <div class="relative z-10">
                                    <div class="flex items-center gap-2 mb-0.5 flex-wrap">
                                        <span
                                            class="text-blue-200 text-[9px] font-bold uppercase tracking-widest block">Итоговый
                                            расчет</span>
                                        <!-- Early Booking Pulse Badge -->
                                        <div id="earlyBookingBadge"
                                            class="hidden bg-amber-400 text-slate-900 text-[8px] font-extrabold px-1.5 py-0.5 rounded-full shadow-md animate-pulse">
                                            <i class="fa-solid fa-bolt mr-0.5"></i> -15%
                                        </div>
                                    </div>
                                    <div class="flex items-baseline space-x-1.5 mt-0.5 mb-3">
                                        <span
                                            class="text-lg md:text-xl font-extrabold text-white tracking-tight drop-shadow-md"
                                            id="totalPrice">0</span>
                                        <span class="text-sm font-black text-amber-300 drop-shadow-sm">₸</span>
                                    </div>

                                    <div class="flex flex-wrap items-center gap-1.5">
                                        <!-- WhatsApp Action (Copy + Open) -->
                                        <button id="whatsappShareBtn"
                                            class="flex-1 justify-center bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-400 font-bold px-2 py-2 rounded-xl text-[11px] flex items-center transition-all shadow-sm border border-emerald-400/30"
                                            title="Отправить в WhatsApp">
                                            <i class="fa-brands fa-whatsapp text-sm text-emerald-400"></i>
                                        </button>
                                        <!-- Download Action -->
                                        <button id="downloadReceiptBtn"
                                            class="flex-1 justify-center bg-blue-400/20 hover:bg-blue-400/40 text-blue-300 font-bold px-2 py-2 rounded-xl text-[11px] flex items-center transition-all shadow-sm border border-blue-400/30"
                                            title="Скачать PDF чек">
                                            <i class="fa-solid fa-cloud-arrow-down text-blue-300 text-sm"></i>
                                        </button>
                                        <!-- Share Actions -->
                                        <button id="nativeShareBtn"
                                            class="flex-1 justify-center bg-white/10 hover:bg-white/20 text-white font-bold px-2 py-2 rounded-xl text-[11px] flex items-center transition-all shadow-sm backdrop-blur-sm border border-white/20"
                                            title="Поделиться чеком">
                                            <i class="fa-solid fa-share-nodes text-sm"></i>
                                        </button>
                                    </div>
                                </div>
                            </section>

                            <!-- Dynamic Stats Summary Panel -->
                            <section
                                class="xl:col-span-6 neon-card-blue p-4 relative rounded-2xl shadow-sm flex flex-col h-full">
                                <h2
                                    class="font-display text-sm font-bold text-white flex items-center drop-shadow-md mb-2">
                                    <i class="fa-solid fa-chart-simple text-cyan-400 mr-2"></i>
                                    Сводная статистика
                                </h2>

                                <div class="grid grid-cols-3 gap-2 mt-1">
                                    <!-- Взрослые -->
                                    <div
                                        class="relative overflow-hidden p-2 text-center border border-white/10 bg-gradient-to-br from-blue-500/10 to-blue-900/10 hover:from-blue-500/20 hover:to-blue-900/20 rounded-xl transition-colors group">
                                        <i class="fa-solid fa-user text-sm text-blue-400/70 block mb-0.5"></i>
                                        <span
                                            class="text-[9px] font-bold text-blue-200 uppercase tracking-wider block relative z-10 drop-shadow-md leading-tight break-words">Взрослые</span>
                                        <span
                                            class="text-xl font-black text-white mt-0.5 block relative z-10 drop-shadow-lg"
                                            id="statAdl">0</span>
                                    </div>
                                    <!-- Дети -->
                                    <div
                                        class="relative overflow-hidden p-2 text-center border border-white/10 bg-gradient-to-br from-teal-500/10 to-teal-900/10 hover:from-teal-500/20 hover:to-teal-900/20 rounded-xl transition-colors group">
                                        <i class="fa-solid fa-child text-sm text-teal-400/70 block mb-0.5"></i>
                                        <span
                                            class="text-[9px] font-bold text-teal-200 uppercase tracking-wider block relative z-10 drop-shadow-md leading-tight break-words">Дети</span>
                                        <span
                                            class="text-xl font-black text-white mt-0.5 block relative z-10 drop-shadow-lg"
                                            id="statChld">0</span>
                                    </div>
                                    <!-- Младенцы -->
                                    <div
                                        class="relative overflow-hidden p-2 text-center border border-white/10 bg-gradient-to-br from-emerald-500/10 to-emerald-900/10 hover:from-emerald-500/20 hover:to-emerald-900/20 rounded-xl transition-colors group">
                                        <i class="fa-solid fa-baby text-sm text-emerald-400/70 block mb-0.5"></i>
                                        <span
                                            class="text-[9px] font-bold text-emerald-200 uppercase tracking-wider block relative z-10 drop-shadow-md leading-tight break-words">Младенцы</span>
                                        <span
                                            class="text-xl font-black text-white mt-0.5 block relative z-10 drop-shadow-lg"
                                            id="statInf">0</span>
                                    </div>
                                    <!-- Пенсионеры -->
                                    <div
                                        class="relative overflow-hidden p-2 text-center border border-white/10 bg-gradient-to-br from-purple-500/10 to-purple-900/10 hover:from-purple-500/20 hover:to-purple-900/20 rounded-xl transition-colors group">
                                        <i class="fa-solid fa-person-cane text-sm text-purple-400/70 block mb-0.5"></i>
                                        <span
                                            class="text-[9px] font-bold text-purple-200 uppercase tracking-wider block relative z-10 drop-shadow-md leading-tight break-words">Пенсионеры</span>
                                        <span
                                            class="text-xl font-black text-white mt-0.5 block relative z-10 drop-shadow-lg"
                                            id="statPens">0</span>
                                    </div>
                                    <!-- Инвалиды -->
                                    <div
                                        class="relative overflow-hidden p-2 text-center border border-white/10 bg-gradient-to-br from-rose-500/10 to-rose-900/10 hover:from-rose-500/20 hover:to-rose-900/20 rounded-xl transition-colors group">
                                        <i class="fa-solid fa-wheelchair text-sm text-rose-400/70 block mb-0.5"></i>
                                        <span
                                            class="text-[9px] font-bold text-rose-200 uppercase tracking-wider block relative z-10 drop-shadow-md leading-tight break-words">Инвалиды</span>
                                        <span
                                            class="text-xl font-black text-white mt-0.5 block relative z-10 drop-shadow-lg"
                                            id="statInv">0</span>
                                    </div>
                                    <!-- Именинники -->
                                    <div
                                        class="relative overflow-hidden p-2 text-center border border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-amber-600/20 hover:from-amber-500/20 hover:to-amber-600/30 rounded-xl transition-colors group shadow-[0_0_15px_rgba(245,158,11,0.15)]">
                                        <i class="fa-solid fa-cake-candles text-sm text-amber-400/70 block mb-0.5"></i>
                                        <span
                                            class="text-[9px] font-bold text-amber-400 uppercase tracking-wider block relative z-10 drop-shadow-md leading-tight break-words">Именинники</span>
                                        <span
                                            class="text-xl font-black text-amber-300 mt-0.5 block relative z-10 drop-shadow-lg"
                                            id="statBday">0</span>
                                    </div>
                                </div>
                            </section>
                        </div>

                        <!-- Экспорт (CRM) — отдельная строка на всю ширину -->
                        <section class="neon-card-blue p-5 relative rounded-2xl shadow-sm flex flex-col">
                            <div
                                class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mb-3">
                                <h2
                                    class="text-sm font-bold text-white flex items-center whitespace-nowrap drop-shadow-md">
                                    <i class="fa-solid fa-code text-slate-400 mr-2"></i>
                                    Экспорт (CRM)
                                </h2>
                                <div class="flex items-center gap-2 w-full sm:w-auto">
                                    <button id="emailExportBtn"
                                        class="flex-1 sm:flex-none justify-center text-[11px] font-bold text-white bg-white/10 hover:bg-white/20 border border-white/10 px-3 py-2 rounded-xl transition-colors flex items-center whitespace-nowrap">
                                        <i class="fa-solid fa-envelope sm:mr-1.5"></i> <span class="hidden sm:inline">На
                                            почту</span>
                                    </button>
                                    <button id="copyExportBtn"
                                        class="flex-1 sm:flex-none justify-center text-[11px] font-bold text-blue-300 bg-blue-500/20 hover:bg-blue-500/40 border border-blue-400/30 px-3 py-2 rounded-xl transition-colors flex items-center whitespace-nowrap">
                                        <i class="fa-regular fa-copy sm:mr-1.5"></i> <span
                                            class="hidden sm:inline">Копировать</span>
                                    </button>
                                </div>
                            </div>
                            <textarea id="exportData" readonly
                                class="w-full min-h-[100px] overflow-hidden glass-input p-3 text-xs font-mono resize-none focus:border-white/20 bg-black/20 text-white cursor-text select-all"
                                placeholder="Тут появится текст для экспорта в CRM..."></textarea>
                        </section>




                    </div> <!-- End RIGHT COLUMN -->
                </div> <!-- End Main Grid -->
            </div> <!-- End view-calculator -->

            <!-- View: Database -->
            <div id="view-database"
                class="app-view hidden w-full neon-card-blue mt-6 md:mt-10 flex-col flex-1 overflow-hidden">
                <!-- Search & Actions -->
                <div
                    class="flex items-center justify-between p-3 border-b border-white/10 bg-black/20 shrink-0 flex-wrap gap-2">
                    <div class="relative w-full sm:w-64">
                        <i
                            class="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
                        <input type="text" id="dbSearchInput" placeholder="Поиск по имени, дате..."
                            class="w-full pl-8 pr-4 py-2 text-xs border border-transparent rounded-xl bg-white/5 text-white focus:outline-none focus:border-cyan-400 transition-colors">
                    </div>
                    <div class="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                        <span class="text-[11px] text-slate-400 font-medium" id="dbRecordCount">Загрузка...</span>
                        <button id="dbExportBtn"
                            class="flex items-center gap-2 px-3 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-700 transition-colors">
                            <i class="fa-solid fa-file-csv"></i> <span>CSV</span>
                        </button>
                    </div>
                </div>
                <!-- Table -->
                <div class="flex-1 overflow-auto min-h-0 custom-scrollbar">
                    <table class="w-full text-xs border-collapse min-w-[700px]" id="dbTable">
                        <thead class="sticky top-0 z-20">
                            <tr class="bg-[#0b172a] uppercase text-[10px] font-bold tracking-wide shadow-md">
                                <th class="px-4 py-3 text-left whitespace-nowrap" style="color: white !important;">#
                                </th>
                                <th class="px-4 py-3 text-left whitespace-nowrap cursor-pointer hover:bg-white/10 transition-colors"
                                    style="color: white !important;" onclick="sortDbTable('date')">Дата / Время <i
                                        class="fa-solid fa-sort ml-1 opacity-50" id="sortIcon-date"></i></th>
                                <th class="px-4 py-3 text-left whitespace-nowrap cursor-pointer hover:bg-white/10 transition-colors"
                                    style="color: white !important;" onclick="sortDbTable('visit')">Визит <i
                                        class="fa-solid fa-sort ml-1 opacity-50" id="sortIcon-visit"></i></th>
                                <th class="px-4 py-3 text-left whitespace-nowrap cursor-pointer hover:bg-white/10 transition-colors"
                                    style="color: white !important;" onclick="sortDbTable('client')">Клиент <i
                                        class="fa-solid fa-sort ml-1 opacity-50" id="sortIcon-client"></i></th>
                                <th class="px-4 py-3 text-left whitespace-nowrap" style="color: white !important;">Тариф
                                </th>
                                <th class="px-4 py-3 text-center whitespace-nowrap cursor-pointer hover:bg-white/10 transition-colors"
                                    style="color: white !important;" onclick="sortDbTable('guests')">Гостей <i
                                        class="fa-solid fa-sort ml-1 opacity-50" id="sortIcon-guests"></i></th>
                                <th class="px-4 py-3 text-left whitespace-nowrap" style="color: white !important;">
                                    Список гостей (ФИО · дата рождения · кат.)</th>
                                <th class="px-4 py-3 text-right whitespace-nowrap cursor-pointer hover:bg-white/10 transition-colors"
                                    style="color: white !important;" onclick="sortDbTable('sum')">Сумма <i
                                        class="fa-solid fa-sort ml-1 opacity-50" id="sortIcon-sum"></i></th>
                                <th class="px-4 py-3 text-center whitespace-nowrap" style="color: white !important;">
                                </th>
                            </tr>
                        </thead>
                        <tbody id="dbTableBody">
                            <tr>
                                <td colspan="9" class="text-center py-16 text-slate-400"><i
                                        class="fa-solid fa-spinner fa-spin mr-2"></i>Загрузка...</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- View: Dashboard (Statistics / Analytics) -->
            <div id="view-dashboard"
                class="app-view hidden w-full neon-card-blue mt-6 md:mt-10 flex-col flex-1 overflow-hidden">
                <div
                    class="flex flex-col sm:flex-row justify-between items-start sm:items-center p-5 border-b border-white/10 shrink-0 gap-4">
                    <div class="flex items-center gap-3 w-full sm:w-auto">
                        <input type="date" id="statsDateFrom"
                            class="glass-input px-3 py-1.5 text-xs rounded-lg focus:outline-none focus:border-cyan-400 bg-white/5 border border-white/10 text-white">
                        <span class="text-slate-500">-</span>
                        <input type="date" id="statsDateTo"
                            class="glass-input px-3 py-1.5 text-xs rounded-lg focus:outline-none focus:border-cyan-400 bg-white/5 border border-white/10 text-white">
                    </div>
                    <button id="exportCsvBtn"
                        class="px-3 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold shadow-md hover:bg-emerald-700 transition-all flex items-center justify-center">
                        <i class="fa-solid fa-file-excel mr-1.5"></i> Excel
                    </button>
                </div>
                <div class="flex-1 overflow-y-auto p-5 space-y-4 pt-4 custom-scrollbar" id="statisticsContent">
                    <!-- Injected via JS -->
                    <div class="text-center text-slate-400 py-10"><i
                            class="fa-solid fa-spinner fa-spin text-3xl mb-3 opacity-50"></i>
                        <p class="text-sm font-semibold">Загрузка статистики...</p>
                    </div>
                </div>
            </div>

        </main>

        <!-- Receipt Print Container (fixed off-screen for PDF generation) -->
        <div id="receiptContainer" class="fixed top-[-9999px] left-[-9999px] opacity-0 pointer-events-none">
            <div id="receiptContent" class="w-[420px] text-slate-800 p-8 rounded-3xl font-sans bg-white relative">
                <div class="text-center mb-8 mt-2">
                    <h1 class="text-[32px] font-black text-[#1e293b] tracking-wider mb-1">TETYS BLU</h1>
                </div>
                <div class="mb-6 space-y-2.5 text-[14px]" id="receiptMeta"><!-- Filled in JS --></div>
                <div class="space-y-3 mb-8" id="receiptTourists"><!-- Filled in JS --></div>
                <div class="pt-5 border-t border-dashed border-slate-300 flex justify-between items-center mb-6"
                    id="receiptTotalContainer">
                    <span class="text-sm font-extrabold text-slate-500 uppercase tracking-wider">Итого к оплате:</span>
                    <span class="text-2xl font-black text-[#1e293b]"><span id="receiptTotalValue">0</span> <span
                            class="text-[#0076ba] font-bold">₸</span></span>
                </div>
                <div
                    class="mt-8 text-center text-[11px] text-slate-500 border-t border-dashed border-slate-300 pt-5 relative">
                    <div class="absolute right-0 -top-5 bg-white pl-3 text-[#1e293b]">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                            stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M4 7V5a2 2 0 0 1 2-2h2"></path>
                            <path d="M4 17v2a2 2 0 0 0 2 2h2"></path>
                            <path d="M16 3h2a2 2 0 0 1 2 2v2"></path>
                            <path d="M16 21h2a2 2 0 0 0 2-2v-2"></path>
                            <line x1="7" y1="12" x2="17" y2="12"></line>
                            <line x1="12" y1="7" x2="12" y2="17"></line>
                        </svg>
                    </div>
                    <p class="font-semibold">Ждем вас в тематическом парке Tetys Blu!</p>
                </div>
            </div>
        </div>

        <!-- MOBILE BOTTOM NAV (Visible only on small screens) -->
        <nav
            class="md:hidden fixed bottom-0 left-0 right-0 bg-[#0d1e36]/95 backdrop-blur-xl border-t border-white/10 flex items-center justify-around pb-safe z-50 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
            <button id="mobNavCalcBtn" class="flex flex-col items-center justify-center py-2 px-1 w-16 text-cyan-400">
                <i class="fa-solid fa-calculator text-lg mb-1"></i>
                <span class="text-[9px] font-medium">Кальк</span>
            </button>
            <button id="mobNavDashboardBtn"
                class="flex flex-col items-center justify-center py-2 px-1 w-16 text-slate-400 hover:text-emerald-400 transition-colors">
                <i class="fa-solid fa-chart-simple text-lg mb-1"></i>
                <span class="text-[9px] font-medium">Аналитика</span>
            </button>
            <button id="mobNavDatabaseBtn"
                class="flex flex-col items-center justify-center py-2 px-1 w-16 text-slate-400 hover:text-amber-400 transition-colors">
                <i class="fa-solid fa-database text-lg mb-1"></i>
                <span class="text-[9px] font-medium">База данных</span>
            </button>
        </nav>
    </div>

    <!-- Share Preview Modal (Fix for iOS Safari Async Gesture Block) -->
    <div id="shareModal"
        class="fixed inset-0 z-[7000] hidden bg-slate-900/60 backdrop-blur-sm flex items-center justify-center transition-opacity duration-300 opacity-0 p-4">
        <div class="bg-white w-full max-w-sm rounded-3xl shadow-2xl flex flex-col overflow-hidden transform scale-95 transition-transform duration-300"
            id="shareModalContent">
            <div class="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h2 class="text-base font-bold text-slate-800">Предпросмотр чека</h2>
                <button id="closeShareBtn"
                    class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-200 text-slate-500 transition-colors">
                    <i class="fa-solid fa-xmark text-lg"></i>
                </button>
            </div>
            <div class="p-4 bg-slate-100/50 flex justify-center items-center">
                <img id="sharePreviewImg" src=""
                    class="max-h-[50vh] object-contain shadow-lg rounded-xl border border-slate-200">
            </div>
            <div class="p-5 space-y-3">
                <button id="finalShareBtn"
                    class="w-full justify-center bg-brand-blue hover:bg-blue-600 text-white py-3.5 rounded-xl text-[15px] font-bold flex items-center transition-all shadow-md">
                    <i class="fa-solid fa-share-nodes mr-2 text-xl leading-none"></i> Выбрать способ отправки
                </button>
                <button id="downloadPdfBtn"
                    class="w-full justify-center bg-rose-600 hover:bg-rose-700 text-white py-3.5 rounded-xl text-[15px] font-bold flex items-center transition-all shadow-md">
                    <i class="fa-solid fa-file-pdf text-lg mr-2"></i> Скачать PDF чек
                </button>
                <p class="text-[10px] text-slate-400 text-center mt-3">WhatsApp, Почта, Telegram и другие приложения</p>
            </div>
        </div>
    </div>

    <!-- Manual Price Modal -->
    <div id="manualPriceModal"
        class="fixed inset-0 z-[8000] hidden bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
        <div class="bg-white w-full max-w-sm rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-fade-in">
            <div class="p-4 border-b border-slate-100 flex justify-between items-center bg-amber-50">
                <h2 class="text-base font-bold text-amber-800"><i class="fa-solid fa-pencil mr-2"></i>Индивидуальная
                    цена</h2>
                <button onclick="window.closeManualPriceModal()"
                    class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-amber-200 text-amber-600 transition-colors">
                    <i class="fa-solid fa-xmark text-lg"></i>
                </button>
            </div>
            <div class="p-6">
                <label class="block text-xs font-bold text-slate-500 mb-2">Новая итоговая цена (₸)</label>
                <input type="number" id="manualPriceInput" min="0"
                    class="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3 text-lg font-bold focus:border-amber-400 focus:bg-white focus:outline-none transition-colors"
                    placeholder="Например: 15000">

                <div class="mt-6 flex gap-3">
                    <button onclick="window.resetManualPrice()"
                        class="flex-1 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors text-sm">Сбросить</button>
                    <button onclick="window.saveManualPrice()"
                        class="flex-[2] py-3 bg-amber-500 text-white font-bold rounded-xl hover:bg-amber-600 transition-colors shadow-md shadow-amber-500/30 text-sm">Применить</button>
                </div>
            </div>
        </div>
    </div>

    <!-- Script Import -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/localforage/1.10.0/localforage.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>
    <!-- Logic scripts -->
    <script src="js/config.js?v=18"></script>
    <script src="js/utils.js?v=18"></script>
    <script src="js/pricing.js?v=18"></script>
    <script src="js/main.js?v=2"></script>
    <script>
        // Theme Toggle Logic
        const themeBtn = document.getElementById('themeToggleBtn');
        const themeIcon = document.getElementById('themeIcon');

        function updateThemeIcon() {
            if (document.body.classList.contains('dark-mode')) {
                themeIcon.classList.remove('fa-moon');
                themeIcon.classList.add('fa-sun');
                themeIcon.classList.add('theme-icon-active');
            } else {
                themeIcon.classList.remove('fa-sun');
                themeIcon.classList.add('fa-moon');
                themeIcon.classList.remove('theme-icon-active');
            }
        }

        // Initialize theme from localStorage
        if (localStorage.getItem('tetysBluTheme') === 'dark') {
            document.body.classList.add('dark-mode');
        }
        updateThemeIcon();

        themeBtn.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            const isDark = document.body.classList.contains('dark-mode');
            localStorage.setItem('tetysBluTheme', isDark ? 'dark' : 'light');
            updateThemeIcon();
        });
    </script>
</body>

</html>
