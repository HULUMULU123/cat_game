import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import FailrueHeader from "../components/failure/header/FailrueHeader";
import Droplets from "../components/failure/droplets/Droplets";
import FailureFooter from "../components/failure/footer/FailureFooter";
import ModalLayout from "../components/modalWindow/ModalLayout";
import ModalWindow from "../components/modalWindow/ModalWindow";
import { createPortal } from "react-dom";
import { request, ApiError } from "../shared/api/httpClient";
import type {
  FailureResponse,
  FailureStartResponse,
  FailureCompleteResponse,
  FailureBonusPurchaseResponse,
  FailureBonusType,
} from "../shared/api/types";
import useGlobalStore from "../shared/store/useGlobalStore";
import FailureShop from "../components/failure/shop/FailureShop";
import type { BonusListEntry } from "../components/failure/footer/BounusList";
import type { BonusStatus } from "../components/failure/footer/BonusItem";

/** загрузочный экран */
import StakanLoader from "../shared/components/stakan/StakanLoader";
import wordmark from "../assets/STAKAN.svg";

/* ====================== Стили ====================== */

const StyledWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  height: 100vh;
  width: 100%;
  overflow: hidden;
  opacity: 0;
  transition: opacity 0.6s ease;
  &.visible {
    opacity: 1;
  }
`;

const StyledHeaderWrapper = styled.div`
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 3;
`;

const StyledFooterWrapper = styled.div`
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  bottom: 0;
  left: 0;
  width: 100%;
  z-index: 3;
`;

const FreezeOverlay = styled.div<{ $visible: boolean }>`
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: linear-gradient(
    180deg,
    rgba(88, 188, 255, 0.18) 0%,
    rgba(34, 120, 194, 0.12) 100%
  );
  opacity: ${({ $visible }) => ($visible ? 1 : 0)};
  transition: opacity 0.3s ease;
  mix-blend-mode: screen;
  z-index: 1;
`;

/* Лоадер — поверх всего */
const LoaderTopLayer = styled.div<{ $visible: boolean }>`
  position: fixed;
  inset: 0;
  z-index: 2147483647;
  opacity: ${(p) => (p.$visible ? 1 : 0)};
  transition: opacity 420ms ease;
  pointer-events: ${(p) => (p.$visible ? "auto" : "none")};
  background: transparent;
`;

/* ====================== Хелперы ожидания ====================== */

const nextFrame = () =>
  new Promise<void>((r) => requestAnimationFrame(() => r()));
const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

async function waitImages(container: HTMLElement) {
  const imgs = Array.from(
    container.querySelectorAll("img")
  ) as HTMLImageElement[];
  const pending = imgs.filter((i) => !i.complete);
  if (pending.length === 0) return;
  await Promise.race([
    Promise.all(
      pending.map(
        (img) =>
          new Promise<void>((res) => {
            const done = () => res();
            img.addEventListener("load", done, { once: true });
            img.addEventListener("error", done, { once: true });
          })
      )
    ),
    sleep(2500),
  ]);
}

async function waitVideosMeta(container: HTMLElement) {
  const vids = Array.from(
    container.querySelectorAll("video")
  ) as HTMLVideoElement[];
  const pending = vids.filter((v) => v.readyState < 2);
  if (pending.length === 0) return;
  await Promise.race([
    Promise.all(
      pending.map(
        (v) =>
          new Promise<void>((res) => {
            const done = () => res();
            v.addEventListener("loadeddata", done, { once: true });
            v.addEventListener("canplaythrough", done, { once: true });
            v.addEventListener("error", done, { once: true });
          })
      )
    ),
    sleep(2500),
  ]);
}

async function waitFonts() {
  try {
    // @ts-ignore
    if (document.fonts && document.fonts.ready) {
      // @ts-ignore
      await Promise.race([document.fonts.ready, sleep(1500)]);
    }
  } catch {}
}

async function ensureStableReady(container: HTMLElement) {
  if (document.readyState !== "complete") {
    await new Promise<void>((res) =>
      window.addEventListener("load", () => res(), { once: true })
    );
  }
  await waitFonts();
  await waitImages(container);
  await waitVideosMeta(container);
  await nextFrame();
  await nextFrame();
  await sleep(120);
}

/* ====================== Мемо-обёртки ====================== */

const HeaderMemo: React.FC<{ timeLeft: number; duration: number }> = React.memo(
  ({ timeLeft, duration }) => (
    <StyledHeaderWrapper>
      <FailrueHeader timeLeft={timeLeft} duration={duration} />
    </StyledHeaderWrapper>
  )
);
HeaderMemo.displayName = "HeaderMemo";

const FooterMemo: React.FC<{
  score: number;
  bonuses: BonusListEntry[];
  onBonusActivate: (type: FailureBonusType) => void;
}> = React.memo(({ score, bonuses, onBonusActivate }) => (
  <StyledFooterWrapper>
    <FailureFooter
      score={score}
      bonuses={bonuses}
      onBonusActivate={onBonusActivate}
    />
  </StyledFooterWrapper>
));
FooterMemo.displayName = "FooterMemo";

/* ====================== Страница ====================== */

export default function Failure() {
  const tokens = useGlobalStore((state) => state.tokens);
  const updateBalance = useGlobalStore((state) => state.updateBalance);
  const balance = useGlobalStore((state) => state.balance);
  const incrementStat = useGlobalStore((state) => state.incrementProfileStat);
  const markFailureCompleted = useGlobalStore(
    (state) => state.markFailureCompleted
  );
  const navigate = useNavigate();

  const [score, setScore] = useState(0);
  const [failure, setFailure] = useState<FailureResponse | null>(null);
  const [duration, setDuration] = useState(60);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isGameRunning, setIsGameRunning] = useState(false);
  const [hasFinished, setHasFinished] = useState(false);
  const [startModalOpen, setStartModalOpen] = useState(false);
  const [resultModalOpen, setResultModalOpen] = useState(false);
  const [startMessage, setStartMessage] = useState<string | null>(null);
  const [resultMessage, setResultMessage] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const [bonusPrices, setBonusPrices] = useState<
    Record<FailureBonusType, number>
  >({
    x2: 0,
    x5: 0,
    x10: 0,
    freeze: 0,
    no_bombs: 0,
  });
  const [bonusStatus, setBonusStatus] = useState<
    Record<FailureBonusType, BonusStatus>
  >({});
  const [purchasedBonuses, setPurchasedBonuses] = useState<FailureBonusType[]>(
    []
  );
  const [maxBonusesPerRun, setMaxBonusesPerRun] = useState(3);
  const [storeOpen, setStoreOpen] = useState(false);
  const [shopError, setShopError] = useState<string | null>(null);
  const [purchasingType, setPurchasingType] = useState<FailureBonusType | null>(
    null
  );
  const [bombConfig, setBombConfig] = useState<{ min: number; max: number }>({
    min: 0,
    max: 0,
  });
  const [bombSchedule, setBombSchedule] = useState<number[]>([]);
  const [bombsDisabled, setBombsDisabled] = useState(false);
  const [speedModifier, setSpeedModifier] = useState(1);
  const [freezeActive, setFreezeActive] = useState(false);
  const [activeMultiplier, setActiveMultiplier] = useState(1);
  const [activeMultiplierType, setActiveMultiplierType] =
    useState<FailureBonusType | null>(null);

  const multiplierTimeoutRef = useRef<number | null>(null);
  const freezeTimeoutRef = useRef<number | null>(null);
  const prevFailureIdRef = useRef<number | null>(null);

  const footerBonuses = useMemo<BonusListEntry[]>(() => {
    return Object.entries(bonusStatus).map(([type, status]) => ({
      type: type as FailureBonusType,
      status,
      highlight: status === "available",
    }));
  }, [bonusStatus]);

  // фиксированная метка окончания раунда
  const endAtRef = useRef<number | null>(null);

  // Покадровый сценарий загрузки
  const [contentVisible, setContentVisible] = useState(false);
  const [loaderVisible, setLoaderVisible] = useState(true);
  const [showLoaderNode, setShowLoaderNode] = useState(true);

  const wrapperRef = useRef<HTMLDivElement>(null);

  const parseErrorDetail = useCallback(
    (error: unknown, fallback: string): string => {
      if (error instanceof ApiError) {
        try {
          const parsed = JSON.parse(error.message) as { detail?: string };
          if (typeof parsed.detail === "string" && parsed.detail.trim()) {
            return parsed.detail;
          }
        } catch {}
        return error.message || fallback;
      }
      if (error instanceof Error) {
        return error.message;
      }
      return fallback;
    },
    []
  );

  const scheduleBombs = useCallback(
    (durationSeconds: number, minCount: number, maxCount: number) => {
      const safeDuration = Math.max(0, durationSeconds);
      const safeMin = Math.max(0, minCount);
      const safeMax = Math.max(safeMin, maxCount);

      if (safeDuration === 0 || safeMax === 0) {
        setBombSchedule([]);
        return;
      }

      const count =
        Math.floor(Math.random() * (safeMax - safeMin + 1)) + safeMin;
      if (count <= 0) {
        setBombSchedule([]);
        return;
      }

      const totalMs = safeDuration * 1000;
      const times: number[] = [];
      for (let i = 0; i < count; i += 1) {
        const time = Math.random() * Math.max(0, totalMs - 4000) + 1500;
        times.push(time);
      }
      times.sort((a, b) => a - b);
      setBombSchedule(times);
    },
    []
  );

  useEffect(() => {
    return () => {
      if (multiplierTimeoutRef.current) {
        window.clearTimeout(multiplierTimeoutRef.current);
        multiplierTimeoutRef.current = null;
      }
      if (freezeTimeoutRef.current) {
        window.clearTimeout(freezeTimeoutRef.current);
        freezeTimeoutRef.current = null;
      }
    };
  }, []);

  const markBonusStatus = useCallback(
    (type: FailureBonusType, status: BonusStatus) => {
      setBonusStatus((prev) => ({ ...prev, [type]: status }));
    },
    []
  );

  const activateMultiplier = useCallback(
    (type: FailureBonusType, multiplier: number) => {
      if (multiplierTimeoutRef.current && activeMultiplierType) {
        window.clearTimeout(multiplierTimeoutRef.current);
        multiplierTimeoutRef.current = null;
        markBonusStatus(activeMultiplierType, "used");
      }

      setActiveMultiplier(multiplier);
      setActiveMultiplierType(type);
      markBonusStatus(type, "active");

      multiplierTimeoutRef.current = window.setTimeout(() => {
        setActiveMultiplier(1);
        markBonusStatus(type, "used");
        setActiveMultiplierType(null);
        multiplierTimeoutRef.current = null;
      }, 10_000);
    },
    [activeMultiplierType, markBonusStatus]
  );

  const activateFreeze = useCallback(() => {
    if (freezeTimeoutRef.current) {
      window.clearTimeout(freezeTimeoutRef.current);
      freezeTimeoutRef.current = null;
    }

    setFreezeActive(true);
    setSpeedModifier(1.8);
    markBonusStatus("freeze", "active");

    freezeTimeoutRef.current = window.setTimeout(() => {
      setFreezeActive(false);
      setSpeedModifier(1);
      markBonusStatus("freeze", "used");
      freezeTimeoutRef.current = null;
    }, 10_000);
  }, [markBonusStatus]);

  const activateNoBombs = useCallback(() => {
    setBombsDisabled(true);
    setBombSchedule([]);
    markBonusStatus("no_bombs", "used");
  }, [markBonusStatus]);

  const handleBonusActivate = useCallback(
    (type: FailureBonusType) => {
      if (bonusStatus[type] !== "available") return;

      switch (type) {
        case "x2":
          activateMultiplier(type, 2);
          break;
        case "x5":
          activateMultiplier(type, 5);
          break;
        case "x10":
          activateMultiplier(type, 10);
          break;
        case "freeze":
          activateFreeze();
          break;
        case "no_bombs":
          activateNoBombs();
          break;
        default:
          break;
      }
    },
    [activateFreeze, activateMultiplier, activateNoBombs, bonusStatus]
  );

  const handlePop = useCallback(() => {
    if (!isGameRunning) return;
    setScore((s) => s + activeMultiplier);
  }, [activeMultiplier, isGameRunning]);

  const handleBombHit = useCallback(() => {
    setScore(0);
  }, []);

  useEffect(() => {
    let alive = true;

    const run = async () => {
      const root = wrapperRef.current || document.body;

      const watchdog = sleep(5000).then(() => {
        if (alive)
          console.warn("[Failure] Ready watchdog fired -> forcing show");
      });

      await Promise.race([ensureStableReady(root), watchdog]);

      if (!alive) return;

      setContentVisible(true);
      await sleep(220);
      setLoaderVisible(false);
    };

    run();

    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (!tokens) {
      if (!startModalOpen) {
        setStartMessage("Необходимо авторизоваться для участия в сбое.");
        setStartModalOpen(true);
      }
      return;
    }

    let active = true;

    (async () => {
      try {
        const data = await request<FailureResponse[]>("/failures/", {
          headers: { Authorization: `Bearer ${tokens.access}` },
        });
        if (!active) return;
        const current = data.find((item) => item.is_active) ?? null;
        const prevId = prevFailureIdRef.current;
        const nextId = current?.id ?? null;
        const failureChanged = prevId !== nextId;

        setFailure(current);
        if (current) {
          setDuration(current.duration_seconds ?? 60);
          setTimeLeft(current.duration_seconds ?? 60);
          setBonusPrices((prev) => current.bonus_prices ?? prev);
          setMaxBonusesPerRun(current.max_bonuses_per_run ?? 3);
          setBombConfig({
            min: current.bombs_min_count ?? 0,
            max: current.bombs_max_count ?? 0,
          });
          if (failureChanged) {
            setBonusStatus({});
            setPurchasedBonuses([]);
            setStoreOpen(false);
          }
          setStartMessage(
            "У тебя 60 секунд. Кликай по каплям, чтобы набрать как можно больше очков. Нажмешь на бомбу - все капли пропадут. Удачи!"
          );
        } else {
          setStartMessage("Активный сбой не найден.");
          if (failureChanged) {
            setBonusStatus({});
            setPurchasedBonuses([]);
            setStoreOpen(false);
          }
        }
        prevFailureIdRef.current = nextId;
        if (!isGameRunning && !hasFinished) {
          setStartModalOpen(true);
        }
      } catch (error) {
        if (!active) return;
        setStartMessage(
          parseErrorDetail(error, "Не удалось загрузить данные сбоя.")
        );
        if (!isGameRunning && !hasFinished) {
          setStartModalOpen(true);
        }
      }
    })();

    return () => {
      active = false;
    };
    // важно: не зависим от startModalOpen
  }, [tokens, parseErrorDetail, isGameRunning, hasFinished]);

  const handleStartGame = useCallback(async () => {
    if (!tokens) {
      setStartMessage("Необходимо авторизоваться для участия в сбое.");
      setStartModalOpen(true);
      return;
    }

    if (!failure || !failure.is_active) {
      setStartMessage("Сбой недоступен.");
      return;
    }

    setIsStarting(true);
    try {
      const payload = { failure_id: failure.id };
      const response = await request<FailureStartResponse>("/failures/start/", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${tokens.access}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const dur = response.duration_seconds ?? 60;

      setDuration(dur);
      setTimeLeft(dur);
      setScore(0);
      setHasFinished(false);
      setResultMessage(null);
      setResultModalOpen(false);
      setBombConfig({
        min: response.bombs_min_count ?? 0,
        max: response.bombs_max_count ?? 0,
      });
      setBonusPrices((prev) => response.bonus_prices ?? prev);
      setMaxBonusesPerRun(response.max_bonuses_per_run ?? 3);
      const initialBonuses = response.purchased_bonuses ?? [];
      setPurchasedBonuses(initialBonuses);
      setBonusStatus(
        initialBonuses.reduce(
          (acc, type) => ({ ...acc, [type]: "available" as BonusStatus }),
          {} as Record<FailureBonusType, BonusStatus>
        )
      );
      setBombsDisabled(false);
      setSpeedModifier(1);
      setFreezeActive(false);
      setActiveMultiplier(1);
      setActiveMultiplierType(null);
      updateBalance(response.balance ?? balance);
      setStoreOpen(true);
      setStartModalOpen(false);
    } catch (error) {
      const message = parseErrorDetail(error, "Не удалось начать сбой.");
      setStartMessage(message);
      setHasFinished(
        message.toLowerCase().includes("уже участвовали") ||
          message.toLowerCase().includes("уже")
      );
    } finally {
      setIsStarting(false);
    }
  }, [balance, failure, parseErrorDetail, tokens, updateBalance]);

  const beginGame = useCallback(() => {
    if (!failure) return;
    setStoreOpen(false);
    setScore(0);
    setHasFinished(false);
    setResultMessage(null);
    setResultModalOpen(false);
    setTimeLeft(duration);
    endAtRef.current = Date.now() + duration * 1000;
    scheduleBombs(duration, bombConfig.min, bombConfig.max);
    setIsGameRunning(true);
  }, [bombConfig.max, bombConfig.min, duration, failure, scheduleBombs]);

  const handleStoreClose = useCallback(() => {
    setShopError(null);
    setPurchasingType(null);
    beginGame();
  }, [beginGame]);

  const handlePurchaseBonus = useCallback(
    async (type: FailureBonusType) => {
      if (!failure || !tokens || purchasingType) return;
      setPurchasingType(type);
      setShopError(null);

      try {
        const response = await request<FailureBonusPurchaseResponse>(
          "/failures/bonus-purchase/",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${tokens.access}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ failure_id: failure.id, bonus_type: type }),
          }
        );

        setPurchasedBonuses(response.purchased_bonuses ?? []);
        setBonusStatus((prev) => {
          const next = { ...prev } as Record<FailureBonusType, BonusStatus>;
          (response.purchased_bonuses ?? []).forEach((bonusType) => {
            if (!next[bonusType] || next[bonusType] === "used") {
              next[bonusType] = "available";
            }
          });
          return next;
        });
        setMaxBonusesPerRun(response.max_bonuses_per_run ?? maxBonusesPerRun);
        updateBalance(response.balance);
      } catch (error) {
        const detail = parseErrorDetail(error, "Не удалось купить бонус.");
        setShopError(detail);
      } finally {
        setPurchasingType(null);
      }
    },
    [
      failure,
      maxBonusesPerRun,
      parseErrorDetail,
      purchasingType,
      tokens,
      updateBalance,
    ]
  );

  const finishGame = useCallback(async () => {
    if (hasFinished) {
      setResultModalOpen(true);
      return;
    }

    setHasFinished(true);
    setIsGameRunning(false);
    setTimeLeft(0);
    endAtRef.current = null;

    if (!tokens || !failure) {
      setResultMessage(`Результат не сохранён. Очки: ${score}`);
      setResultModalOpen(true);
      return;
    }

    try {
      const response = await request<FailureCompleteResponse>(
        "/failures/complete/",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${tokens.access}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            failure_id: failure.id,
            points: score,
            duration_seconds: duration,
          }),
        }
      );
      setResultMessage(`${response.detail} Очки: ${response.score}`);
      incrementStat("failures");
      markFailureCompleted(failure.id);
    } catch (error) {
      const message = parseErrorDetail(
        error,
        "Не удалось сохранить результат."
      );
      setResultMessage(`${message} Очки: ${score}`);
    } finally {
      setResultModalOpen(true);
    }
  }, [
    duration,
    failure,
    hasFinished,
    incrementStat,
    markFailureCompleted,
    parseErrorDetail,
    score,
    tokens,
  ]);

  // стабильный таймер по метке окончания
  useEffect(() => {
    if (!isGameRunning) return;

    if (!endAtRef.current) {
      endAtRef.current = Date.now() + duration * 1000;
    }

    const tick = () => {
      const endAt = endAtRef.current!;
      const msLeft = Math.max(0, endAt - Date.now());
      const secLeft = Math.ceil(msLeft / 1000);
      setTimeLeft(secLeft);

      if (secLeft <= 0) {
        endAtRef.current = null;
        void finishGame();
      }
    };

    tick();
    const id = window.setInterval(tick, 250);
    return () => window.clearInterval(id);
  }, [isGameRunning, duration, finishGame]);

  // Закрытие стартовой модалки -> запускаем игру
  const handleStartModalToggle = useCallback(
    (open: boolean) => {
      setStartModalOpen(open);
      if (!open && !isGameRunning && !hasFinished && failure?.is_active) {
        void handleStartGame();
      }
    },
    [failure?.is_active, hasFinished, isGameRunning, handleStartGame]
  );

  // Когда лоадер полностью скрылся — размонтируем портал
  const onLoaderTransitionEnd = useCallback(() => {
    if (!loaderVisible) setShowLoaderNode(false);
  }, [loaderVisible]);

  const handleResultModalVisibility = useCallback(
    (open: boolean) => {
      setResultModalOpen(open);
      if (!open) {
        navigate("/");
      }
    },
    [navigate]
  );

  const handleResultModalAction = useCallback(() => {
    handleResultModalVisibility(false);
  }, [handleResultModalVisibility]);

  return (
    <>
      {/* Лоадер через портал, размонтируем после анимации */}
      {showLoaderNode &&
        createPortal(
          <LoaderTopLayer
            $visible={loaderVisible}
            onTransitionEnd={onLoaderTransitionEnd}
          >
            <StakanLoader
              wordmarkSrc={wordmark}
              subtitle="Подготавливаю сцену…"
              stopAt={96}
              totalDuration={4000}
            />
          </LoaderTopLayer>,
          document.body
        )}

      <StyledWrapper
        ref={wrapperRef}
        className={contentVisible ? "visible" : ""}
      >
        <HeaderMemo timeLeft={timeLeft} duration={duration} />

        <FreezeOverlay $visible={freezeActive} />

        <Droplets
          onPop={handlePop}
          onBomb={handleBombHit}
          speedModifier={speedModifier}
          bombSchedule={bombSchedule}
          disableBombs={bombsDisabled}
          bombEffectColor="rgba(220, 80, 80, 0.55)"
        />

        <FooterMemo
          score={score}
          bonuses={footerBonuses}
          onBonusActivate={handleBonusActivate}
        />

        {startModalOpen ? (
          <ModalLayout
            isOpen={startModalOpen}
            setIsOpen={handleStartModalToggle}
          >
            <ModalWindow
              header={failure?.name ?? "СБОЙ"}
              text={
                startMessage ??
                "Участвуй в сбое: у тебя 60 секунд, чтобы набрать как можно больше очков."
              }
              // по ТЗ таймер стартует при закрытии модалки
              btnContent={<span style={{ margin: "auto" }}>Закрыть</span>}
              setOpenModal={handleStartModalToggle}
              isOpenModal={startModalOpen}
              onAction={() => handleStartModalToggle(false)}
              isActionLoading={isStarting}
            />
          </ModalLayout>
        ) : null}

        {resultModalOpen ? (
          <ModalLayout
            isOpen={resultModalOpen}
            setIsOpen={handleResultModalVisibility}
          >
            <ModalWindow
              header="Результат сбоя"
              text={resultMessage ?? `Вы набрали ${score} очков.`}
              btnContent={<span>Закрыть</span>}
              setOpenModal={handleResultModalVisibility}
              isOpenModal={resultModalOpen}
              onAction={handleResultModalAction}
            />
          </ModalLayout>
        ) : null}

        {storeOpen ? (
          <FailureShop
            isOpen={storeOpen}
            onClose={handleStoreClose}
            bonusPrices={bonusPrices}
            purchasedBonuses={purchasedBonuses}
            maxBonuses={maxBonusesPerRun}
            onPurchase={handlePurchaseBonus}
            purchasingType={purchasingType}
            balance={balance}
            error={shopError}
          />
        ) : null}
      </StyledWrapper>
    </>
  );
}
