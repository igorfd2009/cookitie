import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const targetDate = new Date('2025-09-10T23:59:59');

    const timer = setInterval(() => {
      const now = new Date();
      const difference = targetDate.getTime() - now.getTime();

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-[var(--color-cookite-yellow)] text-gray-800 py-4 md:py-6 px-4 mx-4 rounded-2xl shadow-lg">
      <div className="max-w-4xl mx-auto text-center">
        <div className="flex items-center justify-center gap-2 mb-3 md:mb-4">
          <Clock className="animate-pulse-glow" size={20} />
          <h3 className="text-base md:text-xl">20% OFF até 10 de setembro</h3>
        </div>
        <p className="mb-3 md:mb-4 text-xs md:text-sm opacity-80">Válido só para pedidos antecipados</p>
        <div className="grid grid-cols-4 gap-2 md:gap-4 max-w-xs md:max-w-sm mx-auto">
          <div className="bg-white rounded-lg p-2 md:p-3 shadow-md">
            <div className="text-lg md:text-2xl font-bold text-[var(--color-cookite-blue)]">{timeLeft.days}</div>
            <div className="text-xs uppercase tracking-wide">Dias</div>
          </div>
          <div className="bg-white rounded-lg p-2 md:p-3 shadow-md">
            <div className="text-lg md:text-2xl font-bold text-[var(--color-cookite-blue)]">{timeLeft.hours}</div>
            <div className="text-xs uppercase tracking-wide">Horas</div>
          </div>
          <div className="bg-white rounded-lg p-2 md:p-3 shadow-md">
            <div className="text-lg md:text-2xl font-bold text-[var(--color-cookite-blue)]">{timeLeft.minutes}</div>
            <div className="text-xs uppercase tracking-wide">Min</div>
          </div>
          <div className="bg-white rounded-lg p-2 md:p-3 shadow-md">
            <div className="text-lg md:text-2xl font-bold text-[var(--color-cookite-blue)]">{timeLeft.seconds}</div>
            <div className="text-xs uppercase tracking-wide">Seg</div>
          </div>
        </div>
      </div>
    </div>
  );
}