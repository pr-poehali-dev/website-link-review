const MESSENGER_URL = "https://s.salebot.pro/456e8e23907e5384b4659a1525b8985d_20";

const checkItems = [
  "Что такое «посмертный учёт» — и почему именно он, а не налоговая инспекция, является главной угрозой для вашей стройки",
  "Почему прибыльная строительная компания вдруг не может найти деньги на бетон — и при чём здесь бухгалтер",
  "Реальная история: один платёж субподрядчику → 4 дня заморозки → 1,7 млн рублей потерь. Разбор по шагам: что пошло не так и в какой момент это можно было остановить",
  "Почему «хороший штатный бухгалтер» в строительстве — это иногда иллюзия безопасности, а не реальная защита",
  "Как выглядит система, которая работает на опережение — и почему владелец компании с оборотом 180 млн говорит, что «впервые за 7 лет не думает о бухгалтерии вообще»",
  "Три конкретных изменения в работе с учётом, которые сделали блокировку счёта практически невозможной",
];

const CtaButton = () => (
  <a
    href={MESSENGER_URL}
    className="block w-full py-4 px-6 bg-brand-red hover:bg-brand-red-hover active:scale-95 transition-all duration-150 rounded-xl text-white font-bold text-sm tracking-widest text-center uppercase"
  >
    Получить кейс в МАКС ▶
  </a>
);

const Index = () => {
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
              Получите кейс в МАКС — бесплатно 👇
            </p>
            <CtaButton />
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
              Подпишитесь в МАКС и получите кейс прямо сейчас 👇
            </p>
            <CtaButton />
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
            Подпишитесь в МАКС и получите кейс 👇
          </p>
          <CtaButton />
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