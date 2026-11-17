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

export default function CalculatorDropdown({ onClose }) {
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

  // Keyboard support: captures numpad & keyboard keys directly when dropdown is open
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Escape closes
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      // Digits 0-9 and decimal
      if (e.key >= '0' && e.key <= '9') {
        e.preventDefault();
        handleDigit(e.key);
      } else if (e.key === '.' || e.key === ',') {
        e.preventDefault();
        handleDigit('.');
      } else if (e.key === '+' || e.key === '-') {
        e.preventDefault();
        handleOperator(e.key);
      } else if (e.key === '*' || e.key === 'x' || e.key === 'X') {
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
      } else if (e.key.toLowerCase() === 'c' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        handleClear();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleDigit, handleOperator, handleCalculate, handleBackspace, handleClear, onClose]);

  return (
    <div 
      className="absolute right-0 mt-3 w-72 sm:w-80 bg-slate-900/98 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] p-4 z-50 animate-in fade-in slide-in-from-top-2 origin-top-right space-y-3 font-sans select-none"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Top Header */}
      <div className="flex items-center justify-between pb-2 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Calculator className="w-3.5 h-3.5" />
          </div>
          <span className="font-bold text-xs text-slate-200 tracking-wide">Quick Calculator</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleCopy}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-colors cursor-pointer"
            title="Copy Result"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
          <button 
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Screen Display */}
      <div className="bg-slate-950/90 border border-white/5 rounded-xl p-3 text-right shadow-inner">
        <div className="text-[11px] font-mono text-slate-500 h-4 overflow-hidden text-ellipsis whitespace-nowrap">
          {expression || '\u00A0'}
        </div>
        <div className="text-xl sm:text-2xl font-black font-mono text-slate-100 tracking-wider overflow-x-auto no-scrollbar whitespace-nowrap">
          {display}
        </div>
      </div>

      {/* Keys Grid */}
      <div className="grid grid-cols-4 gap-1.5 font-mono text-xs sm:text-sm">
        {/* Row 1 */}
        <button
          type="button"
          onClick={handleClear}
          className="p-2.5 sm:p-3 rounded-xl font-bold bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-all active:scale-95 cursor-pointer text-center"
          title="Clear (C)"
        >
          C
        </button>
        <button
          type="button"
          onClick={handleBackspace}
          className="p-2.5 sm:p-3 rounded-xl font-bold bg-slate-800/60 hover:bg-slate-800 text-slate-300 border border-white/5 flex items-center justify-center transition-all active:scale-95 cursor-pointer"
          title="Backspace"
        >
          <Delete className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => handleOperator('%')}
          className="p-2.5 sm:p-3 rounded-xl font-bold bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/20 transition-all active:scale-95 cursor-pointer text-center"
        >
          %
        </button>
        <button
          type="button"
          onClick={() => handleOperator('÷')}
          className="p-2.5 sm:p-3 rounded-xl font-bold bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/20 transition-all active:scale-95 cursor-pointer text-center"
        >
          ÷
        </button>

        {/* Row 2 */}
        <button
          type="button"
          onClick={() => handleDigit('7')}
          className="p-2.5 sm:p-3 rounded-xl font-bold bg-slate-800/40 hover:bg-slate-800 text-slate-100 border border-white/5 transition-all active:scale-95 cursor-pointer text-center"
        >
          7
        </button>
        <button
          type="button"
          onClick={() => handleDigit('8')}
          className="p-2.5 sm:p-3 rounded-xl font-bold bg-slate-800/40 hover:bg-slate-800 text-slate-100 border border-white/5 transition-all active:scale-95 cursor-pointer text-center"
        >
          8
        </button>
        <button
          type="button"
          onClick={() => handleDigit('9')}
          className="p-2.5 sm:p-3 rounded-xl font-bold bg-slate-800/40 hover:bg-slate-800 text-slate-100 border border-white/5 transition-all active:scale-95 cursor-pointer text-center"
        >
          9
        </button>
        <button
          type="button"
          onClick={() => handleOperator('×')}
          className="p-2.5 sm:p-3 rounded-xl font-bold bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/20 transition-all active:scale-95 cursor-pointer text-center"
        >
          ×
        </button>

        {/* Row 3 */}
        <button
          type="button"
          onClick={() => handleDigit('4')}
          className="p-2.5 sm:p-3 rounded-xl font-bold bg-slate-800/40 hover:bg-slate-800 text-slate-100 border border-white/5 transition-all active:scale-95 cursor-pointer text-center"
        >
          4
        </button>
        <button
          type="button"
          onClick={() => handleDigit('5')}
          className="p-2.5 sm:p-3 rounded-xl font-bold bg-slate-800/40 hover:bg-slate-800 text-slate-100 border border-white/5 transition-all active:scale-95 cursor-pointer text-center"
        >
          5
        </button>
        <button
          type="button"
          onClick={() => handleDigit('6')}
          className="p-2.5 sm:p-3 rounded-xl font-bold bg-slate-800/40 hover:bg-slate-800 text-slate-100 border border-white/5 transition-all active:scale-95 cursor-pointer text-center"
        >
          6
        </button>
        <button
          type="button"
          onClick={() => handleOperator('-')}
          className="p-2.5 sm:p-3 rounded-xl font-bold bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/20 transition-all active:scale-95 cursor-pointer text-center"
        >
          -
        </button>

        {/* Row 4 */}
        <button
          type="button"
          onClick={() => handleDigit('1')}
          className="p-2.5 sm:p-3 rounded-xl font-bold bg-slate-800/40 hover:bg-slate-800 text-slate-100 border border-white/5 transition-all active:scale-95 cursor-pointer text-center"
        >
          1
        </button>
        <button
          type="button"
          onClick={() => handleDigit('2')}
          className="p-2.5 sm:p-3 rounded-xl font-bold bg-slate-800/40 hover:bg-slate-800 text-slate-100 border border-white/5 transition-all active:scale-95 cursor-pointer text-center"
        >
          2
        </button>
        <button
          type="button"
          onClick={() => handleDigit('3')}
          className="p-2.5 sm:p-3 rounded-xl font-bold bg-slate-800/40 hover:bg-slate-800 text-slate-100 border border-white/5 transition-all active:scale-95 cursor-pointer text-center"
        >
          3
        </button>
        <button
          type="button"
          onClick={() => handleOperator('+')}
          className="p-2.5 sm:p-3 rounded-xl font-bold bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/20 transition-all active:scale-95 cursor-pointer text-center"
        >
          +
        </button>

        {/* Row 5 */}
        <button
          type="button"
          onClick={() => handleDigit('0')}
          className="p-2.5 sm:p-3 rounded-xl font-bold bg-slate-800/40 hover:bg-slate-800 text-slate-100 border border-white/5 transition-all active:scale-95 cursor-pointer text-center"
        >
          0
        </button>
        <button
          type="button"
          onClick={() => handleDigit('00')}
          className="p-2.5 sm:p-3 rounded-xl font-bold bg-slate-800/40 hover:bg-slate-800 text-slate-100 border border-white/5 transition-all active:scale-95 cursor-pointer text-center"
        >
          00
        </button>
        <button
          type="button"
          onClick={() => handleDigit('.')}
          className="p-2.5 sm:p-3 rounded-xl font-bold bg-slate-800/40 hover:bg-slate-800 text-slate-100 border border-white/5 transition-all active:scale-95 cursor-pointer text-center"
        >
          .
        </button>
        <button
          type="button"
          onClick={handleCalculate}
          className="p-2.5 sm:p-3 rounded-xl font-black bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all active:scale-95 cursor-pointer text-center"
          title="Calculate (= or Enter)"
        >
          =
        </button>
      </div>

      <div className="text-[10px] text-slate-500 text-center font-mono pt-1">
        Supports Keyboard & Numpad keys
      </div>
    </div>
  );
}
