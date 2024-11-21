import { useState, useEffect, KeyboardEvent } from "react";

interface UseKeyboardNavigationProps {
  items: any[];
  isVisible: boolean;
  onSelect: (item: any) => void;
}

export const useKeyboardNavigation = ({ 
  items, 
  isVisible, 
  onSelect 
}: UseKeyboardNavigationProps) => {
  const [selectedIndex, setSelectedIndex] = useState(-1);

  useEffect(() => {
    if (!isVisible) {
      setSelectedIndex(-1);
    }
  }, [isVisible]);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!isVisible || items.length === 0) return;

    // Tab selection (existing functionality)
    if (e.key === 'Tab' && !e.shiftKey) {
      e.preventDefault();
      onSelect(items[0]);
      return;
    }

    // Arrow keys and Ctrl+N/P navigation
    if (
      e.key === 'ArrowDown' || 
      (e.ctrlKey && e.key.toLowerCase() === 'n')
    ) {
      e.preventDefault();
      setSelectedIndex(prev => 
        prev < items.length - 1 ? prev + 1 : 0
      );
    } else if (
      e.key === 'ArrowUp' || 
      (e.ctrlKey && e.key.toLowerCase() === 'p')
    ) {
      e.preventDefault();
      setSelectedIndex(prev => 
        prev > 0 ? prev - 1 : items.length - 1
      );
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();
      onSelect(items[selectedIndex]);
    }
  };

  return {
    selectedIndex,
    handleKeyDown
  };
};