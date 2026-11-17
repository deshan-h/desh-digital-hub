import React, { useState, useEffect, useCallback } from 'react';
import { Calculator, X, Delete, Copy, Check } from 'lucide-react';

const safeEvaluate = (expr) => {
  try {
    const sanitized = expr.replace(/×/g, '*').replace(/÷/g, '/');
    if (!/^[0-9+*\/%.\s()-]+$/.test(sanitized)) return null;
    const fn = new Function('return (' + sanitized + ')');
    const val = fn();
    if (typeof val === 'number' && !isNaN(val) && isFinite(val)) {
      return Math.round(val * 1000000) / 1000000;
    }
    return null;
  } catch {
    return null;
  }
};

export default function CalculatorModal({ isOpen, onClose }) {
  const [expression, setExpression] = useState('');
  const [display, setDisplay] = useState('0');
  const [hasCalculated, setHasCalculated] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleDigit = useCallback((digit) => {
    setDisplay((prev) => {
      if (hasCalculated) {
        setHasCalculated(false);
        setExpression('');
        return digit === '.' ? '0.' : digit;
      }
      if (digit === '.') {
        const lastPart = prev.split(/[\s+\-×÷%]+/).pop() || '';
        if (lastPart.includes('.')) return prev;
        return prev + '.';
      }
      if (digit === '00') {
        if (prev === '0') return '0';
        return prev + '00';
      }
      if (prev === '0') return digit;
      return prev + digit;
    });
  }, [hasCalculated]);

  const handleOperator = useCallback((op) => {
    setHasCalculated(false);
    setDisplay((prev) => {
      const trimmed = prev.trim();
      const lastChar = trimmed.slice(-1);
      if (['+', '-', '×', '÷', '%'].includes(lastChar)) {
        return trimmed.slice(0, -1) + ' ' + op + ' ';
      }
      return trimmed + ' ' + op + ' ';
    });
  }, []);

  const handleCalculate = useCallback(() => {
    const result = safeEvaluate(display);
    if (result !== null) {
      setExpression(display + ' =');
      setDisplay(String(result));
      setHasCalculated(true);
    }
  }, [display]);

  const handleClear = useCallback(() => {
    setDisplay('0');
    setExpression('');
    setHasCalculated(false);
  }, []);

  const handleBackspace = useCallback(() => {
    setDisplay((prev) => {
      if (hasCalculated) {
        setHasCalculated(false);
        setExpression('');
        return '0';
      }
      const trimmed = prev.trim();
      if (trimmed.length <= 1) return '0';
      // If trailing with operator and space
      if (trimmed.endsWith(' ')) {
        return trimmed.slice(0, -3).trim() || '0';
      }
      return trimmed.slice(0, -1) || '0';
    });
  }, [hasCalculated]);

  const handleCopy = () => {
    navigator.clipboard.writeText(display);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  // Keyboard support
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key >= '0' && e.key <= '9') {
        e.preventDefault();
        handleDigit(e.key);
      } else if (e.key === '.') {
        e.preventDefault();
        handleDigit('.');
      } else if (e.key === '+' || e.key === '-') {
        e.preventDefault();
        handleOperator(e.key);
      } else if (e.key === '*') {
        e.preventDefault();
        handleOperator('×');
      } else if (e.key === '/') {
        e.preventDefault();
        handleOperator('÷');
      } else if (e.key === '%') {
        e.preventDefault();
        handleOperator('%');
      } else if (e.key === 'Enter' || e.key === '=') {
        e.preventDefault();
        handleCalculate();
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        handleBackspace();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key.toLowerCase() === 'c') {
        e.preventDefault();
        handleClear();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleDigit, handleOperator, handleCalculate, handleBackspace, handleClear, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-[340px] shadow-2xl overflow-hidden p-5 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
          <div className="flex items-center gap-2 text-slate-200">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Calculator className="w-4 h-4" />
            </div>
            <span className="font-bold text-sm tracking-wide">Calculator</span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleCopy}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
              title="Copy Result"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
            <button 
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Close (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Display */}
        <div className="bg-slate-950/80 border border-slate-800/90 rounded-2xl p-4 text-right shadow-inner">
          <div className="text-xs font-mono text-slate-500 h-5 overflow-hidden text-ellipsis whitespace-nowrap">
            {expression || '\u00A0'}
          </div>
          <div className="text-2xl font-black font-mono text-slate-100 tracking-wider overflow-x-auto custom-scrollbar whitespace-nowrap">
            {display}
          </div>
        </div>

        {/* Buttons Grid */}
        <div className="grid grid-cols-4 gap-2 font-mono text-sm">
          {/* Row 1 */}
          <button
            onClick={handleClear}
            className="p-3.5 rounded-xl font-bold bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-all active:scale-95 cursor-pointer"
            title="Clear (C)"
          >
            C
          </button>
          <button
            onClick={handleBackspace}
            className="p-3.5 rounded-xl font-bold bg-slate-800/50 hover:bg-slate-800 text-slate-300 border border-slate-700/50 flex items-center justify-center transition-all active:scale-95 cursor-pointer"
            title="Backspace"
          >
            <Delete className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleOperator('%')}
            className="p-3.5 rounded-xl font-bold bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/20 transition-all active:scale-95 cursor-pointer"
          >
            %
          </button>
          <button
            onClick={() => handleOperator('÷')}
            className="p-3.5 rounded-xl font-bold bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/20 transition-all active:scale-95 cursor-pointer"
          >
            ÷
          </button>

          {/* Row 2 */}
          <button
            onClick={() => handleDigit('7')}
            className="p-3.5 rounded-xl font-bold bg-slate-800/40 hover:bg-slate-800 text-slate-100 border border-slate-800 transition-all active:scale-95 cursor-pointer"
          >
            7
          </button>
          <button
            onClick={() => handleDigit('8')}
            className="p-3.5 rounded-xl font-bold bg-slate-800/40 hover:bg-slate-800 text-slate-100 border border-slate-800 transition-all active:scale-95 cursor-pointer"
          >
            8
          </button>
          <button
            onClick={() => handleDigit('9')}
            className="p-3.5 rounded-xl font-bold bg-slate-800/40 hover:bg-slate-800 text-slate-100 border border-slate-800 transition-all active:scale-95 cursor-pointer"
          >
            9
          </button>
          <button
            onClick={() => handleOperator('×')}
            className="p-3.5 rounded-xl font-bold bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/20 transition-all active:scale-95 cursor-pointer"
          >
            ×
          </button>

          {/* Row 3 */}
          <button
            onClick={() => handleDigit('4')}
            className="p-3.5 rounded-xl font-bold bg-slate-800/40 hover:bg-slate-800 text-slate-100 border border-slate-800 transition-all active:scale-95 cursor-pointer"
          >
            4
          </button>
          <button
            onClick={() => handleDigit('5')}
            className="p-3.5 rounded-xl font-bold bg-slate-800/40 hover:bg-slate-800 text-slate-100 border border-slate-800 transition-all active:scale-95 cursor-pointer"
          >
            5
          </button>
          <button
            onClick={() => handleDigit('6')}
            className="p-3.5 rounded-xl font-bold bg-slate-800/40 hover:bg-slate-800 text-slate-100 border border-slate-800 transition-all active:scale-95 cursor-pointer"
          >
            6
          </button>
          <button
            onClick={() => handleOperator('-')}
            className="p-3.5 rounded-xl font-bold bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/20 transition-all active:scale-95 cursor-pointer"
          >
            -
          </button>

          {/* Row 4 */}
          <button
            onClick={() => handleDigit('1')}
            className="p-3.5 rounded-xl font-bold bg-slate-800/40 hover:bg-slate-800 text-slate-100 border border-slate-800 transition-all active:scale-95 cursor-pointer"
          >
            1
          </button>
          <button
            onClick={() => handleDigit('2')}
            className="p-3.5 rounded-xl font-bold bg-slate-800/40 hover:bg-slate-800 text-slate-100 border border-slate-800 transition-all active:scale-95 cursor-pointer"
          >
            2
          </button>
          <button
            onClick={() => handleDigit('3')}
            className="p-3.5 rounded-xl font-bold bg-slate-800/40 hover:bg-slate-800 text-slate-100 border border-slate-800 transition-all active:scale-95 cursor-pointer"
          >
            3
          </button>
          <button
            onClick={() => handleOperator('+')}
            className="p-3.5 rounded-xl font-bold bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/20 transition-all active:scale-95 cursor-pointer"
          >
            +
          </button>

          {/* Row 5 */}
          <button
            onClick={() => handleDigit('0')}
            className="p-3.5 rounded-xl font-bold bg-slate-800/40 hover:bg-slate-800 text-slate-100 border border-slate-800 transition-all active:scale-95 cursor-pointer"
          >
            0
          </button>
          <button
            onClick={() => handleDigit('00')}
            className="p-3.5 rounded-xl font-bold bg-slate-800/40 hover:bg-slate-800 text-slate-100 border border-slate-800 transition-all active:scale-95 cursor-pointer"
          >
            00
          </button>
          <button
            onClick={() => handleDigit('.')}
            className="p-3.5 rounded-xl font-bold bg-slate-800/40 hover:bg-slate-800 text-slate-100 border border-slate-800 transition-all active:scale-95 cursor-pointer"
          >
            .
          </button>
          <button
            onClick={handleCalculate}
            className="p-3.5 rounded-xl font-black bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all active:scale-95 cursor-pointer"
            title="Calculate (= or Enter)"
          >
            =
          </button>
        </div>
      </div>
    </div>
  );
}
