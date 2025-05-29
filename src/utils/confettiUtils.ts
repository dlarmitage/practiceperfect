import confetti from 'canvas-confetti';

/**
 * Trigger fireworks confetti effect (for multiples of 20)
 */
export const triggerFireworks = () => {
  const duration = 5 * 1000;
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

  const interval = setInterval(() => {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    const particleCount = 50 * (timeLeft / duration);
    
    // since particles fall down, start a bit higher than random
    confetti({
      ...defaults,
      particleCount,
      origin: { x: Math.random(), y: Math.random() - 0.2 }
    });
    
    confetti({
      ...defaults,
      particleCount,
      origin: { x: Math.random(), y: Math.random() - 0.2 }
    });
  }, 250);
};

/**
 * Trigger realistic confetti effect (for multiples of 10)
 */
export const triggerRealistic = () => {
  const count = 200;
  const defaults = {
    origin: { y: 0.7 }
  };

  function fire(particleRatio: number, opts: confetti.Options) {
    confetti({
      ...defaults,
      ...opts,
      particleCount: Math.floor(count * particleRatio)
    });
  }

  fire(0.25, {
    spread: 26,
    startVelocity: 55,
  });
  
  fire(0.2, {
    spread: 60,
  });
  
  fire(0.35, {
    spread: 100,
    decay: 0.91,
    scalar: 0.8
  });
  
  fire(0.1, {
    spread: 120,
    startVelocity: 25,
    decay: 0.92,
    scalar: 1.2
  });
  
  fire(0.1, {
    spread: 120,
    startVelocity: 45,
  });
};

/**
 * Trigger random direction confetti effect (for multiples of 5)
 */
export const triggerRandomDirection = () => {
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 }
  });
};

/**
 * Trigger the appropriate confetti effect based on the count
 * @param count - The current count to determine which effect to trigger
 */
export const triggerConfettiEffect = (count: number) => {
  if (count <= 0) return;
  
  if (count % 20 === 0) {
    // For multiples of 20, trigger fireworks
    triggerFireworks();
  } else if (count % 10 === 0) {
    // For multiples of 10 (but not 20), trigger realistic effect
    triggerRealistic();
  } else if (count % 5 === 0) {
    // For multiples of 5 (but not 10 or 20), trigger random direction
    triggerRandomDirection();
  }
};
