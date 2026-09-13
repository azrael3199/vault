import { useState, useEffect } from "react";

type UselocalStorageReturn<T> = [T, (value: T) => void];

const uselocalStorage = <T>(
  key: string,
  initialValue: T
): UselocalStorageReturn<T> => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.log(error);
      return initialValue;
    }
  });

  useEffect(() => {
    window.localStorage.setItem(key, JSON.stringify(storedValue));
  }, [key, storedValue]);

  const setValue = (newValue: T) => {
    setStoredValue(newValue);
    window.localStorage.setItem(key, JSON.stringify(newValue));
  };

  return [storedValue, setValue];
};

export default uselocalStorage;

