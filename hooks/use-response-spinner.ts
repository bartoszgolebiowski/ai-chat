import { useState } from "react";

export function useResponseSpinner() {
  const [hasStartedReceiving, _setHasStartedReceiving] = useState(false);
  const [responseTime, _setResponseTime] = useState<number | null>(null);

  const markResponseStarted = () => _setHasStartedReceiving(true);
  const markResponseFinished = () => _setHasStartedReceiving(false);
  const resetSpinner = () => {
    _setHasStartedReceiving(false);
    _setResponseTime(null);
  };
  const updateResponseTime = (timeElapsed: number) => {
    if (!hasStartedReceiving) {
      _setResponseTime(timeElapsed);
    }
  };

  return {
    hasStartedReceiving,
    responseTime,
    markResponseStarted,
    markResponseFinished,
    resetSpinner,
    updateResponseTime,
  };
}
