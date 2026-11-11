import React from 'react';

export const ProgressAnimations: React.FC = () => {
    return (
        <style>{`
      @keyframes shimmer {
        0% { transform: translateX(-100%); }
        100% { transform: translateX(100%); }
      }
      @keyframes wave {
        0% { transform: translateX(-100%) skewX(-15deg); }
        100% { transform: translateX(200%) skewX(-15deg); }
      }
      @keyframes float {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-10px); }
      }
      @keyframes blob {
        0%, 100% { transform: translate(0px, 0px) scale(1); }
        33% { transform: translate(30px, -50px) scale(1.1); }
        66% { transform: translate(-20px, 20px) scale(0.9); }
      }
      @keyframes gradientShift {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.7; }
      }
      @keyframes progressGlow {
        0%, 100% { opacity: 1; box-shadow: 0 0 20px rgba(168, 85, 247, 0.5); }
        50% { opacity: 0.5; box-shadow: 0 0 40px rgba(59, 130, 246, 0.8); }
      }
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes slideDown {
        from { opacity: 0; transform: translateY(-20px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes slideUp {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes slideRight {
        from { opacity: 0; transform: translateX(-20px); }
        to { opacity: 1; transform: translateX(0); }
      }
      @keyframes barGrow {
        from { width: 0; }
      }
      @keyframes gridPulse {
        0%, 100% { opacity: 0.2; }
        50% { opacity: 0.6; }
      }
      @keyframes shimmerText {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.8; }
      }
      @keyframes spin-slow {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
      .animate-shimmer {
        animation: shimmer 3s infinite;
      }
      .animate-wave {
        animation: wave 4s infinite ease-in-out;
      }
      .animate-float {
        animation: float 6s ease-in-out infinite;
      }
      .animate-blob {
        animation: blob 7s infinite;
      }
      .animate-gradientShift {
        animation: gradientShift 5s ease-in-out infinite;
      }
      .animate-progressGlow {
        animation: progressGlow 3s ease-in-out infinite;
      }
      .animate-fadeIn {
        animation: fadeIn 0.6s ease-out;
      }
      .animate-slideDown {
        animation: slideDown 0.6s ease-out;
      }
      .animate-slideUp {
        animation: slideUp 0.6s ease-out;
        animation-fill-mode: both;
      }
      .animate-slideRight {
        animation: slideRight 0.6s ease-out;
        animation-fill-mode: both;
      }
      .animate-barGrow {
        animation: barGrow 1.5s ease-out;
        animation-fill-mode: both;
      }
      .animate-gridPulse {
        animation: gridPulse 2s ease-in-out infinite;
      }
      .animate-shimmerText {
        animation: shimmerText 3s ease-in-out infinite;
      }
      .animate-spin-slow {
        animation: spin-slow 20s linear infinite;
      }
    `}</style>
    );
};