import { useState, useCallback } from 'react';

const usePrompt = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState({});
  const [resolvePromise, setResolvePromise] = useState(null);

  const prompt = useCallback((options = {}) => {
    const {
      title = 'Input Required',
      message = '',
      placeholder = '',
      inputType = 'text',
      confirmText = 'Confirm',
      cancelText = 'Cancel',
      validation = null
    } = options;

    setConfig({
      title,
      message,
      placeholder,
      inputType,
      confirmText,
      cancelText,
      validation
    });
    setIsOpen(true);

    return new Promise((resolve) => {
      setResolvePromise(() => resolve);
    });
  }, []);

  const handleConfirm = useCallback((value) => {
    setIsOpen(false);
    if (resolvePromise) {
      resolvePromise(value);
      setResolvePromise(null);
    }
  }, [resolvePromise]);

  const handleCancel = useCallback(() => {
    setIsOpen(false);
    if (resolvePromise) {
      resolvePromise(null);
      setResolvePromise(null);
    }
  }, [resolvePromise]);

  return {
    prompt,
    isOpen,
    config,
    handleConfirm,
    handleCancel
  };
};

export default usePrompt;