import React, { useState, useEffect } from 'react';
import { SUIT_SYMBOLS, SUIT_COLORS } from '../constants';
import { Suit } from '../types';

export interface ActionFeedbackData {
  key: number; // To re-trigger animation on subsequent identical messages
  text: string;
  type: 'info' | 'penalty' | 'special' | 'suit';
  suit?: Suit;
  persistent?: boolean;
}

interface ActionFeedbackProps {
  feedback: ActionFeedbackData | null;
}

const ActionFeedback: React.FC<ActionFeedbackProps> = ({ feedback }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (feedback) {
      setVisible(true);
      if (feedback.persistent) {
          // Don't set a timer to hide
          return;
      }
      const timer = setTimeout(() => {
        setVisible(false);
      }, 1500); // Display for 1.5 seconds

      return () => clearTimeout(timer);
    } else {
        setVisible(false); // Explicitly hide when feedback is cleared
    }
  }, [feedback]);

  if (!feedback) {
    return null;
  }

  const typeStyles = {
    info: 'text-white',
    penalty: 'text-red-400',
    special: 'text-yellow-300',
    suit: feedback.suit ? SUIT_COLORS[feedback.suit] : 'text-white'
  };
  
  const textToShow = feedback.type === 'suit' && feedback.suit 
    ? `${feedback.text} ${SUIT_SYMBOLS[feedback.suit]}` 
    : feedback.text;

  return (
    <div 
      className={`
        fixed inset-0 flex items-center justify-center pointer-events-none z-50
        transition-opacity duration-300
        ${visible ? 'opacity-100' : 'opacity-0'}
      `}
    >
      <div 
        className={`
          bg-black/60 px-8 py-4 rounded-2xl shadow-2xl
          transform transition-all duration-300 ease-out
          ${visible ? 'scale-100 opacity-100' : 'scale-90 opacity-0'}
        `}
      >
        <p 
          className={`
            text-4xl md:text-5xl font-extrabold tracking-wider uppercase
            ${typeStyles[feedback.type]}
          `}
          style={{ textShadow: '2px 2px 8px rgba(0,0,0,0.7)' }}
        >
          {textToShow}
        </p>
      </div>
    </div>
  );
};

export default ActionFeedback;