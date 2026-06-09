import { useRef, useEffect } from "react";

const MAKS_URL = "https://s.salebot.pro/456e8e23907e5384b4659a1525b8985d_20";
const TELEGRAM_URL = "https://s.salebot.pro/456e8e23907e5384b4659a1525b8985d_1";

declare global {
  interface Window {
    ym?: (id: number, action: string, goal: string) => void;
    salebotDebug?: Record<string, () => unknown>;
  }
}

// ─── Salebot UTM tracker ───────────────────────────────────────────────────

const SALEBOT_CHANNELS = {
  telegram: { proxyUrl: TELEGRAM_URL, keywords: ["телеграм", "telegram", "tg"] },
  max:      { proxyUrl: MAKS_URL,     keywords: ["max", "макс"] },
  vk:       { proxyUrl: "",           keywords: ["вконтакте", "вк", "vk", "vkontakte", "контакт"] },
};

const GENERAL_BUTTON_KEYWORDS = ["получить", "перейти", "начать", "запустить", "написать", "связаться", "открыть чат"];

function sbGetCookie(name: string): string | null {
  const parts = `; ${document.cookie}`.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()!.split(";").shift()!;
  return null;
}

function sbGetYMData(): Record<string, string> {
  const data: Record<string, string> = {};
  const ymUid = sbGetCookie("_ym_uid"); if (ymUid) data._ym_uid = ymUid;
  const ymVisorc = sbGetCookie("_ym_visorc"); if (ymVisorc) data._ym_visorc = ymVisorc;
  const ymIsad = sbGetCookie("_ym_isad"); if (ymIsad) data._ym_isad = ymIsad;
  document.cookie.split(";").forEach(c => {
    const [n, v] = c.trim().split("=");
    if (n?.startsWith("_ym_") && !data[n] && v) data[n] = v;
  });
  return data;
}

function sbCollectParams(): Record<string, string | number> {
  const urlParams = new URLSearchParams(window.location.search);
  const params: Record<string, string | number> = {};
  const keys = ["utm_source","utm_medium","utm_campaign","utm_term","utm_content","utm_id","yclid","yclid_partner","vk_id","vkc_ref","vk_ref","ref","referrer","source","from"];
  keys.forEach(k => { if (urlParams.has(k)) params[k] = urlParams.get(k)!; });
  if (window.location.hash) {
    const hp = new URLSearchParams(window.location.hash.substring(1));
    keys.forEach(k => { if (hp.has(k) && !params[k]) params[k] = hp.get(k)!; });
  }
  Object.assign(params, sbGetYMData());
  params.page_url = window.location.href;
  params.referrer = document.referrer || "";
  params.timestamp = Date.now();
  return params;
}

function sbBuildUrl(baseUrl: string, params: Record<string, string | number>): string {
  const p = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== "" && v !== "undefined") p.set(k, String(v));
  });
  const qs = p.toString();
  return qs ? `${baseUrl}?${qs}` : baseUrl;
}

function sbDetectChannelByUrl(href: string): string | null {
  for (const [name, cfg] of Object.entries(SALEBOT_CHANNELS)) {
    if (cfg.proxyUrl && href.includes(cfg.proxyUrl.replace("https://", ""))) return name;
  }
  return null;
}

function sbDetectChannelByText(text: string): string | null {
  const t = text.toLowerCase();
  for (const [name, cfg] of Object.entries(SALEBOT_CHANNELS)) {
    if (cfg.keywords.some(kw => t.includes(kw))) return name;
  }
  return null;
}

function sbGetProxyUrl(channelName: string | null): string {
  if (channelName && channelName in SALEBOT_CHANNELS) {
    return SALEBOT_CHANNELS[channelName as keyof typeof SALEBOT_CHANNELS].proxyUrl;
  }
  return SALEBOT_CHANNELS.telegram.proxyUrl;
}

function sbHandleClick(e: MouseEvent, channelName: string | null, originalHref: string) {
  e.preventDefault();
  const params = sbCollectParams();
  params.messenger_type = channelName || "unknown";
  const baseUrl = originalHref || sbGetProxyUrl(channelName);
  const fullUrl = sbBuildUrl(baseUrl, params);
  try {
    const history: unknown[] = JSON.parse(localStorage.getItem("salebot_clicks_history") || "[]");
    history.push({ timestamp: new Date().toISOString(), url: fullUrl, channel: channelName, params });
    if (history.length > 10) history.shift();
    localStorage.setItem("salebot_clicks_history", JSON.stringify(history));
  } catch { /* ignore */ }
  setTimeout(() => { window.location.href = fullUrl; }, 100);
}

function useSalebotTracker() {
  useEffect(() => {
    const allProxyUrls = Object.values(SALEBOT_CHANNELS).map(ch => ch.proxyUrl).filter(Boolean);
    const selectors = allProxyUrls.map(u => `a[href="${u}"]`).concat(['a[href*="sbsite.pro"]']);
    let buttons = Array.from(document.querySelectorAll<HTMLAnchorElement>(selectors.join(", ")));

    if (buttons.length === 0) {
      const allKw = [...Object.values(SALEBOT_CHANNELS).flatMap(ch => ch.keywords), ...GENERAL_BUTTON_KEYWORDS];
      buttons = Array.from(document.querySelectorAll<HTMLAnchorElement>("a")).filter(a =>
        allKw.some(kw => a.textContent?.toLowerCase().includes(kw))
      );
    }

    const cleanups: (() => void)[] = [];
    buttons.forEach(btn => {
      const href = btn.getAttribute("href") || "";
      const text = btn.textContent || "";
      const channel = sbDetectChannelByUrl(href) || sbDetectChannelByText(text);
      const handler = (e: MouseEvent) => sbHandleClick(e, channel, href);
      btn.addEventListener("click", handler);
      cleanups.push(() => btn.removeEventListener("click", handler));
    });

    window.salebotDebug = {
      test:   () => { const p = sbCollectParams(); console.log(p); return p; },
      collect: sbCollectParams,
      collectYM: sbGetYMData,
      buildUrls: () => {
        const p = sbCollectParams();
        return Object.fromEntries(Object.entries(SALEBOT_CHANNELS).map(([n, c]) => [n, sbBuildUrl(c.proxyUrl, p)]));
      },
      channels: () => SALEBOT_CHANNELS,
      history: () => JSON.parse(localStorage.getItem("salebot_clicks_history") || "[]"),
      clearHistory: () => { localStorage.removeItem("salebot_clicks_history"); },
    };

    return () => cleanups.forEach(fn => fn());
  }, []);
}

const METRIKA_ID = 107193309;
const SWIPE_THRESHOLD = 10;

function useLinkTracker(goal: string) {
  const startPos = useRef<{ x: number; y: number } | null>(null);

  const onTouchStart = (e: React.TouchEvent) => {
    startPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };

  const onClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (startPos.current) {
      const dx = Math.abs(e.clientX - startPos.current.x);
      const dy = Math.abs(e.clientY - startPos.current.y);
      if (dx > SWIPE_THRESHOLD || dy > SWIPE_THRESHOLD) {
        e.preventDefault();
        return;
      }
    }
    window.ym?.(METRIKA_ID, "reachGoal", goal);
  };

  return { onTouchStart, onClick };
}

const checkItems = [
  "Что такое «посмертный учёт» — и почему именно он, а не налоговая инспекция, является главной угрозой для вашей стройки",
  "Почему прибыльная строительная компания вдруг не может найти деньги на бетон — и при чём здесь бухгалтер",
  "Реальная история: один платёж субподрядчику → 4 дня заморозки → 1,7 млн рублей потерь. Разбор по шагам: что пошло не так и в какой момент это можно было остановить",
  "Почему «хороший штатный бухгалтер» в строительстве — это иногда иллюзия безопасности, а не реальная защита",
  "Как выглядит система, которая работает на опережение — и почему владелец компании с оборотом 180 млн говорит, что «впервые за 7 лет не думает о бухгалтерии вообще»",
  "Три конкретных изменения в работе с учётом, которые сделали блокировку счёта практически невозможной",
];

const CtaButtons = () => {
  const maks = useLinkTracker("KLICK-MAKS");
  const tg = useLinkTracker("KLICK-TG");

  return (
    <div className="space-y-3">
      <a
        href={MAKS_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="block w-full py-3 px-6 bg-brand-red hover:bg-brand-red-hover active:scale-95 transition-all duration-150 rounded-xl text-white text-center"
        onTouchStart={maks.onTouchStart}
        onClick={maks.onClick}
      >
        <div className="font-bold text-sm tracking-widest uppercase">Получить кейс в МАКС ▶</div>
        <div className="text-[11px] font-normal opacity-80 mt-0.5">Грузится стабильно</div>
      </a>

      <a
        href={TELEGRAM_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="block w-full py-3 px-6 bg-[#2AABEE] hover:bg-[#1d96d6] active:scale-95 transition-all duration-150 rounded-xl text-white text-center"
        onTouchStart={tg.onTouchStart}
        onClick={tg.onClick}
      >
        <div className="font-bold text-sm tracking-widest uppercase">Получить кейс в Телеграм ▶</div>
        <div className="text-[11px] font-normal opacity-80 mt-0.5">Могут быть проблемы с загрузкой</div>
      </a>
    </div>
  );
};

const Index = () => {
  useSalebotTracker();
  const firedRef = useRef(false);

  useEffect(() => {
    const handleScroll = () => {
      if (firedRef.current) return;
      const scrolled = window.scrollY + window.innerHeight;
      const total = document.documentElement.scrollHeight;
      if (scrolled >= total - 20) {
        firedRef.current = true;
        window.ym?.(METRIKA_ID, "reachGoal", "skrol-100");
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white font-golos text-gray-900">
      <div className="max-w-[600px] mx-auto px-4 py-8 space-y-8">

        {/* HERO */}
        <section className="space-y-5">
          <div className="inline-block bg-brand-red-light border border-red-200 rounded-md px-3 py-1.5">
            <span className="text-brand-red text-[11px] font-semibold tracking-widest uppercase">
              Для собственников строительных компаний · Москва и МО
            </span>
          </div>

          <h1 className="text-[26px] sm:text-[32px] font-black leading-tight tracking-tight">
            Почему строительные компании теряют миллионы —{" "}
            <span className="text-brand-red">и это не налоговая, не банки</span>{" "}
            и не недобросовестные подрядчики
          </h1>

          <p className="text-[15px] text-gray-500 leading-relaxed">
            Настоящий враг называется «реактивная бухгалтерия». Разбираем на реальном кейсе: как он работает, сколько стоит и как от него защититься.
          </p>

          <hr className="border-gray-100" />

          <div className="space-y-3">
            <p className="text-center text-[13px] text-gray-400">
              Получите кейс в мессенджере — бесплатно 👇
            </p>
            <CtaButtons />
          </div>
        </section>

        {/* CHECKLIST */}
        <section className="bg-gray-50 rounded-2xl px-4 py-6 space-y-4">
          <h2 className="text-[18px] font-bold">
            Что вы поймёте после прочтения кейса:
          </h2>
          <ul className="space-y-3">
            {checkItems.map((item, i) => (
              <li
                key={i}
                className="flex gap-3 items-start bg-white rounded-xl px-4 py-3.5 shadow-sm"
              >
                <span className="mt-0.5 flex-shrink-0 w-6 h-6 rounded-full bg-brand-red flex items-center justify-center">
                  <svg
                    className="w-3.5 h-3.5 text-white"
                    viewBox="0 0 12 10"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M1 5l3.5 3.5L11 1"
                      stroke="white"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                <span className="text-[14px] leading-snug text-gray-800">{item}</span>
              </li>
            ))}
          </ul>

          <div className="space-y-3 pt-2">
            <p className="text-center text-[13px] text-gray-400">
              Подпишитесь на мессенджер и получите кейс прямо сейчас 👇
            </p>
            <CtaButtons />
          </div>
        </section>

        {/* URGENCY */}
        <section className="border-l-4 border-brand-red bg-gray-50 rounded-r-xl px-5 py-5">
          <h3 className="text-[15px] font-bold mb-2">Почему это важно именно сейчас</h3>
          <p className="text-[14px] text-gray-600 leading-relaxed">
            Один день простоя стройки из-за заблокированного счёта обходится в{" "}
            <span className="font-semibold text-gray-900">300 000 — 500 000 рублей</span>.
            Большинство владельцев строительных компаний узнают об этой проблеме уже после того, как она случилась.
          </p>
        </section>

        {/* FINAL CTA */}
        <section className="space-y-3">
          <p className="text-center text-[13px] text-gray-400">
            Подпишитесь на мессенджер и получите кейс 👇
          </p>
          <CtaButtons />
          <p className="text-center text-[12px] text-gray-400 italic leading-relaxed pt-1">
            P.S. Материал подготовлен специально для строительных компаний с оборотом от 100 млн.<br />
            Никаких продающих звонков и дожимов — только полезный разбор реальной ситуации.
          </p>
        </section>

        {/* FOOTER */}
        <footer className="pt-4 pb-8 border-t border-gray-100 text-center space-y-2">
          <p className="text-[11px] text-gray-400">
            ООО "Ваш Персональный Бухгалтер" · ИНН: 9721242210
          </p>
          <div className="flex justify-center gap-4">
            <a href="#" className="text-[11px] text-gray-400 underline underline-offset-2">
              Политика конфиденциальности
            </a>
            <a href="#" className="text-[11px] text-gray-400 underline underline-offset-2">
              Пользовательское соглашение
            </a>
          </div>
        </footer>

      </div>
    </div>
  );
};

export default Index;