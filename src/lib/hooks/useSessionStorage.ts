import { useState, useEffect } from "react";

type UseSessionStorageReturn<T> = [T, (value: T) => void];

const useSessionStorage = <T>(
  key: string,
  initialValue: T
): UseSessionStorageReturn<T> => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.sessionStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.log(error);
      return initialValue;
    }
  });

  useEffect(() => {
    window.sessionStorage.setItem(key, JSON.stringify(storedValue));
  }, [key, storedValue]);

  const setValue = (newValue: T) => {
    setStoredValue(newValue);
    window.sessionStorage.setItem(key, JSON.stringify(newValue));
  };

  return [storedValue, setValue];
};

export default useSessionStorage;
