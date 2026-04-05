/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { 
  Calculator, 
  TrendingUp, 
  PieChart, 
  Activity, 
  ArrowRight, 
  Info, 
  RefreshCw,
  BarChart3,
  DollarSign,
  Briefcase,
  Layers,
  ChevronRight,
  ChevronDown,
  Plus,
  Save,
  Trash2,
  FileText,
  Download,
  History,
  Calendar,
  Code
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  LineChart,
  Line,
  Legend
} from 'recharts';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { cn } from './lib/utils';
import { 
  FinancialData, 
  FinancialRatios, 
  initialFinancialData, 
  calculateRatios 
} from './types';

const SAMPLE_DATA: FinancialData[] = [
  {
    year: 2023,
    currentAssets: 120000,
    longTermReceivables: 40000,
    permanentAssets: 220000,
    inventories: 35000,
    currentLiabilities: 70000,
    longTermLiabilities: 100000,
    equity: 250000,
  },
  {
    year: 2024,
    currentAssets: 150000,
    longTermReceivables: 50000,
    permanentAssets: 250000,
    inventories: 45000,
    currentLiabilities: 80000,
    longTermLiabilities: 120000,
    equity: 300000,
  },
  {
    year: 2025,
    currentAssets: 180000,
    longTermReceivables: 60000,
    permanentAssets: 280000,
    inventories: 55000,
    currentLiabilities: 90000,
    longTermLiabilities: 140000,
    equity: 350000,
  }
];

export default function App() {
  const [records, setRecords] = useState<FinancialData[]>(() => {
    const saved = localStorage.getItem('finratio_records');
    return saved ? JSON.parse(saved) : [initialFinancialData];
  });
  const [selectedYear, setSelectedYear] = useState<number>(records[0]?.year || initialFinancialData.year);
  const [activeTab, setActiveTab] = useState<'input' | 'results' | 'history'>('input');
  const [isSaved, setIsSaved] = useState(false);
  const [justAddedYear, setJustAddedYear] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [expandedSections, setExpandedSections] = useState({ ativo: true, passivo: true });

  useEffect(() => {
    localStorage.setItem('finratio_records', JSON.stringify(records));
  }, [records]);

  const handleManualSave = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleSaveAndNew = () => {
    handleManualSave();
    addNewYear();
  };

  const toggleSection = (section: 'ativo' | 'passivo') => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const currentData = useMemo(() => 
    records.find(r => r.year === selectedYear) || initialFinancialData
  , [records, selectedYear]);

  const currentRatios = useMemo(() => calculateRatios(currentData), [currentData]);

  const allRatios = useMemo(() => 
    records.map(r => calculateRatios(r)).sort((a, b) => a.year - b.year)
  , [records]);

  const handleInputChange = (field: keyof FinancialData, value: string) => {
    const numValue = parseFloat(value) || 0;
    setJustAddedYear(false);
    setRecords(prev => prev.map(r => 
      r.year === selectedYear ? { ...r, [field]: numValue } : r
    ));
  };

  const handleYearChange = (newYear: string) => {
    const yearNum = parseInt(newYear) || initialFinancialData.year;
    setJustAddedYear(false);
    setRecords(prev => prev.map(r => 
      r.year === selectedYear ? { ...r, year: yearNum } : r
    ));
    setSelectedYear(yearNum);
  };

  const addNewYear = () => {
    const nextYear = Math.max(...records.map(r => r.year)) + 1;
    const newRecord = { ...initialFinancialData, year: nextYear };
    setRecords(prev => [...prev, newRecord]);
    setSelectedYear(nextYear);
    setActiveTab('input');
    setJustAddedYear(true);
  };

  const deleteYear = (year: number) => {
    if (records.length <= 1) return;
    const newRecords = records.filter(r => r.year !== year);
    setRecords(newRecords);
    
    // If we deleted the selected year, pick another one
    if (year === selectedYear) {
      setSelectedYear(newRecords[0].year);
    }
    setShowDeleteConfirm(false);
  };

  const loadSampleData = () => {
    setRecords(SAMPLE_DATA);
    setSelectedYear(SAMPLE_DATA[SAMPLE_DATA.length - 1].year);
  };

  const resetData = () => {
    setRecords([initialFinancialData]);
    setSelectedYear(initialFinancialData.year);
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { 
      style: 'currency', 
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2 
    });
  };

  const formatNumber = (value: number) => {
    return value.toLocaleString('pt-BR', { 
      minimumFractionDigits: 2,
      maximumFractionDigits: 2 
    });
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    const r = currentRatios;
    const d = currentData;

    // Title
    doc.setFontSize(20);
    doc.setTextColor(59, 130, 246); // blue-600
    doc.text('Relatório de Índices Financeiros', 14, 20);
    
    doc.setFontSize(12);
    doc.setTextColor(100, 116, 139); // slate-500
    doc.text(`Ano de Referência: ${r.year}`, 14, 30);
    doc.text(`Data de Emissão: ${new Date().toLocaleDateString('pt-BR')}`, 14, 37);

    // Table of Values (Current Year)
    autoTable(doc, {
      startY: 45,
      head: [['Descrição', 'Valor (R$)']],
      body: [
        ['Ativo Circulante', formatCurrency(d.currentAssets)],
        ['Realizável a Longo Prazo', formatCurrency(d.longTermReceivables)],
        ['Ativo Permanente', formatCurrency(d.permanentAssets)],
        ['Estoque', formatCurrency(d.inventories)],
        ['Ativo Total', formatCurrency(r.totalAssets)],
        ['Passivo Circulante', formatCurrency(d.currentLiabilities)],
        ['Exigível a Longo Prazo', formatCurrency(d.longTermLiabilities)],
        ['Patrimônio Líquido', formatCurrency(d.equity)],
        ['Passivo Total', formatCurrency(r.totalLiabilities)],
      ],
      theme: 'striped',
      headStyles: { fillColor: [59, 130, 246] }
    });

    // Table of Ratios (Current Year)
    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 10,
      head: [['Índice', 'Fórmula', 'Resultado']],
      body: [
        ['Liquidez Corrente (ILC)', 'AC / PC', formatNumber(r.ilc)],
        ['Liquidez Geral (ILG)', '(AC + RLP) / (PC + ELP)', formatNumber(r.ilg)],
        ['Solvência Geral (ISG)', 'AT / (PC + ELP)', formatNumber(r.isg)],
        ['Grau de Endividamento (IGE)', '(PC + ELP) / AT', formatNumber(r.ige)],
        ['Garantia Capital Terceiros (GCT)', 'PL / (PC + ELP)', formatNumber(r.gct)],
        ['Capital de Giro Próprio (CGP)', 'PL - (RLP + AP)', formatCurrency(r.cgp)],
        ['Capital Circulante Líquido (CCL)', 'AC - PC', formatCurrency(r.ccl)],
        ['Participação PL (%)', '(PL / AT) * 100', `${formatNumber(r.plPercent)}%`],
      ],
      theme: 'grid',
      headStyles: { fillColor: [30, 41, 59] }
    });

    // Summary Table (All Years)
    if (records.length > 1) {
      doc.addPage();
      doc.setFontSize(16);
      doc.setTextColor(30, 41, 59);
      doc.text('Resumo Histórico de Índices', 14, 20);

      const summaryBody = allRatios.map(ratio => [
        ratio.year.toString(),
        formatNumber(ratio.ilc),
        formatNumber(ratio.ilg),
        formatNumber(ratio.isg),
        formatNumber(ratio.ige),
        `${formatNumber(ratio.plPercent)}%`
      ]);

      autoTable(doc, {
        startY: 30,
        head: [['Ano', 'ILC', 'ILG', 'ISG', 'IGE', 'PL (%)']],
        body: summaryBody,
        theme: 'striped',
        headStyles: { fillColor: [100, 116, 139] }
      });
    }

    doc.save(`Relatorio_Financeiro_${r.year}.pdf`);
  };

  const mainIndices = [
    { name: 'ILC', value: currentRatios.ilc, label: 'Liquidez Corrente', color: '#3b82f6' },
    { name: 'ILG', value: currentRatios.ilg, label: 'Liquidez Geral', color: '#10b981' },
    { name: 'ISG', value: currentRatios.isg, label: 'Solvência Geral', color: '#f59e0b' },
    { name: 'IGE', value: currentRatios.ige, label: 'Grau Endivid.', color: '#ef4444' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg shadow-lg shadow-blue-200">
              <Calculator className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-800 leading-none">Cálculo de Índices Financeiros</h1>
              <div className="flex items-center gap-1 mt-1">
                <Code className="w-3 h-3 text-blue-500" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Eng. Software Rigonato</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={loadSampleData}
              className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
            >
              Carregar Exemplo
            </button>
            <button 
              onClick={handleManualSave}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold transition-all",
                isSaved ? "bg-emerald-100 text-emerald-700" : "bg-blue-600 text-white hover:bg-blue-700"
              )}
            >
              <Save className="w-4 h-4" />
              {isSaved ? "Salvo!" : "Salvar"}
            </button>
            <button 
              onClick={resetData}
              className="p-2 text-slate-400 hover:text-red-500 transition-colors"
              title="Resetar Tudo"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Year Selector & Actions */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-8">
          <div className="flex items-center gap-3 bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-100">
              <Calendar className="w-4 h-4 text-slate-400" />
              <select 
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="bg-transparent text-sm font-bold outline-none cursor-pointer"
              >
                {records.sort((a, b) => b.year - a.year).map(r => (
                  <option key={r.year} value={r.year}>Ano {r.year}</option>
                ))}
              </select>
            </div>
            <button 
              onClick={addNewYear}
              className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
              title="Adicionar Novo Ano"
            >
              <Plus className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setShowDeleteConfirm(true)}
              disabled={records.length <= 1}
              className="p-2 text-slate-400 hover:text-red-500 transition-colors disabled:opacity-30"
              title="Excluir Ano Selecionado"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          <AnimatePresence>
            {showDeleteConfirm && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
              >
                <motion.div 
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 max-w-sm w-full"
                >
                  <div className="flex items-center gap-3 text-red-600 mb-4">
                    <div className="bg-red-100 p-2 rounded-lg">
                      <Trash2 className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold">Excluir Ano {selectedYear}?</h3>
                  </div>
                  <p className="text-slate-600 text-sm mb-6">
                    Esta ação não pode ser desfeita. Todos os dados financeiros deste ano serão perdidos permanentemente.
                  </p>
                  <div className="flex gap-3">
                    <button 
                      onClick={() => setShowDeleteConfirm(false)}
                      className="flex-1 px-4 py-2 bg-slate-100 text-slate-600 text-sm font-bold rounded-xl hover:bg-slate-200 transition-all"
                    >
                      Cancelar
                    </button>
                    <button 
                      onClick={() => deleteYear(selectedYear)}
                      className="flex-1 px-4 py-2 bg-red-600 text-white text-sm font-bold rounded-xl hover:bg-red-700 transition-all shadow-sm"
                    >
                      Excluir
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-center gap-3">
            <button 
              onClick={generatePDF}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-xl text-sm font-bold hover:bg-slate-900 transition-all shadow-sm"
            >
              <FileText className="w-4 h-4" />
              Exportar PDF
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-white p-1 rounded-xl border border-slate-200 mb-8 shadow-sm max-w-lg mx-auto">
          <button 
            onClick={() => setActiveTab('input')}
            className={cn(
              "flex-1 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2",
              activeTab === 'input' ? "bg-blue-600 text-white shadow-md" : "text-slate-500 hover:text-blue-600"
            )}
          >
            <Layers className="w-4 h-4" />
            Dados
          </button>
          <button 
            onClick={() => setActiveTab('results')}
            className={cn(
              "flex-1 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2",
              activeTab === 'results' ? "bg-blue-600 text-white shadow-md" : "text-slate-500 hover:text-blue-600"
            )}
          >
            <TrendingUp className="w-4 h-4" />
            Índices
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={cn(
              "flex-1 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2",
              activeTab === 'history' ? "bg-blue-600 text-white shadow-md" : "text-slate-500 hover:text-blue-600"
            )}
          >
            <History className="w-4 h-4" />
            Evolução
          </button>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'input' ? (
            <motion.div
              key="input"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              {justAddedYear && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3 text-emerald-800">
                    <div className="bg-emerald-500 p-1.5 rounded-full">
                      <Plus className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-bold text-sm">Ano {selectedYear} adicionado! Deseja incluir outro ano agora?</span>
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button 
                      onClick={addNewYear}
                      className="flex-1 sm:flex-none px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-700 transition-all shadow-sm"
                    >
                      Sim, incluir outro
                    </button>
                    <button 
                      onClick={() => setJustAddedYear(false)}
                      className="flex-1 sm:flex-none px-4 py-2 bg-white text-emerald-600 text-xs font-bold rounded-xl border border-emerald-200 hover:bg-emerald-100 transition-all"
                    >
                      Não, preencher este
                    </button>
                  </div>
                </motion.div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                {/* ATIVO */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div 
                  onClick={() => toggleSection('ativo')}
                  onKeyDown={(e) => e.key === 'Enter' && toggleSection('ativo')}
                  role="button"
                  tabIndex={0}
                  className="w-full bg-blue-50 px-6 py-4 border-b border-blue-100 flex justify-between items-center hover:bg-blue-100/50 transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-inset"
                >
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-blue-600" />
                    <h2 className="text-lg font-bold text-blue-800">
                      CAMPO DE ATIVO ({selectedYear})
                    </h2>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="hidden sm:flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      <span className="text-[10px] font-bold text-blue-400 uppercase">Editar Ano:</span>
                      <input 
                        type="number" 
                        value={selectedYear}
                        onChange={(e) => handleYearChange(e.target.value)}
                        className="w-16 bg-white border border-blue-200 rounded px-1 py-0.5 text-xs font-bold text-blue-600 outline-none"
                      />
                      <button 
                        onClick={() => setShowDeleteConfirm(true)}
                        disabled={records.length <= 1}
                        className="p-1 text-blue-400 hover:text-red-500 transition-colors disabled:opacity-30"
                        title="Excluir este ano"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <motion.div
                      animate={{ rotate: expandedSections.ativo ? 180 : 0 }}
                      className="text-blue-400"
                    >
                      <ChevronDown className="w-5 h-5" />
                    </motion.div>
                  </div>
                </div>
                
                <AnimatePresence initial={false}>
                  {expandedSections.ativo && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                      <div className="p-6 space-y-5">
                        <InputField 
                          label="Ativo Circulante (AC)" 
                          value={currentData.currentAssets} 
                          onChange={(v) => handleInputChange('currentAssets', v)} 
                        />
                        <InputField 
                          label="Realizável a Longo Prazo (RLP)" 
                          value={currentData.longTermReceivables} 
                          onChange={(v) => handleInputChange('longTermReceivables', v)} 
                        />
                        <InputField 
                          label="Ativo Permanente (Imobilizado) (AP)" 
                          value={currentData.permanentAssets} 
                          onChange={(v) => handleInputChange('permanentAssets', v)} 
                        />
                        <InputField 
                          label="Estoque" 
                          value={currentData.inventories} 
                          onChange={(v) => handleInputChange('inventories', v)} 
                        />
                        <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                          <span className="font-bold text-slate-500 uppercase text-xs tracking-widest">Ativo Total</span>
                          <span className="text-2xl font-black text-blue-600">
                            {formatCurrency(currentRatios.totalAssets)}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* PASSIVO */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div 
                  onClick={() => toggleSection('passivo')}
                  onKeyDown={(e) => e.key === 'Enter' && toggleSection('passivo')}
                  role="button"
                  tabIndex={0}
                  className="w-full bg-orange-50 px-6 py-4 border-b border-orange-100 flex justify-between items-center hover:bg-orange-100/50 transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-inset"
                >
                  <div className="flex items-center gap-2">
                    <PieChart className="w-5 h-5 text-orange-600" />
                    <h2 className="text-lg font-bold text-orange-800">
                      CAMPO DE PASSIVO ({selectedYear})
                    </h2>
                  </div>
                  <motion.div
                    animate={{ rotate: expandedSections.passivo ? 180 : 0 }}
                    className="text-orange-400"
                  >
                    <ChevronDown className="w-5 h-5" />
                  </motion.div>
                </div>

                <AnimatePresence initial={false}>
                  {expandedSections.passivo && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                      <div className="p-6 space-y-5">
                        <InputField 
                          label="Passivo Circulante (PC)" 
                          value={currentData.currentLiabilities} 
                          onChange={(v) => handleInputChange('currentLiabilities', v)} 
                        />
                        <InputField 
                          label="Exigível a Longo Prazo (ELP)" 
                          value={currentData.longTermLiabilities} 
                          onChange={(v) => handleInputChange('longTermLiabilities', v)} 
                        />
                        <InputField 
                          label="Patrimônio Líquido (PL)" 
                          value={currentData.equity} 
                          onChange={(v) => handleInputChange('equity', v)} 
                        />
                        <div className="pt-20 border-t border-slate-100 flex justify-between items-center">
                          <span className="font-bold text-slate-500 uppercase text-xs tracking-widest">Passivo Total</span>
                          <span className="text-2xl font-black text-orange-600">
                            {formatCurrency(currentRatios.totalLiabilities)}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="md:col-span-2 flex justify-center pt-4">
                <button 
                  onClick={handleSaveAndNew}
                  className="flex items-center gap-3 px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-200 group"
                >
                  <Save className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <span>Salvar Ano {selectedYear} e Incluir Novo</span>
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
            </motion.div>
          ) : activeTab === 'results' ? (
            <motion.div
              key="results"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="space-y-8"
            >
              {/* Main Indices Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <RatioCard 
                  title="ILC - Índice de Liquidez Corrente" 
                  value={formatNumber(currentRatios.ilc)} 
                  formula="AC / PC"
                  calculation={`${formatCurrency(currentData.currentAssets)} / ${formatCurrency(currentData.currentLiabilities)}`}
                  status={currentRatios.ilc >= 1 ? 'good' : 'warning'}
                />
                <RatioCard 
                  title="ILG - Índice de Liquidez Geral" 
                  value={formatNumber(currentRatios.ilg)} 
                  formula="(AC + RLP) / (PC + ELP)"
                  calculation={`(${formatCurrency(currentData.currentAssets)} + ${formatCurrency(currentData.longTermReceivables)}) / (${formatCurrency(currentData.currentLiabilities)} + ${formatCurrency(currentData.longTermLiabilities)})`}
                  status={currentRatios.ilg >= 1 ? 'good' : 'warning'}
                />
                <RatioCard 
                  title="ISG - Índice de Solvência Geral" 
                  value={formatNumber(currentRatios.isg)} 
                  formula="AT / (PC + ELP)"
                  calculation={`${formatCurrency(currentRatios.totalAssets)} / (${formatCurrency(currentData.currentLiabilities)} + ${formatCurrency(currentData.longTermLiabilities)})`}
                  status={currentRatios.isg >= 1 ? 'good' : 'warning'}
                />
                <RatioCard 
                  title="IGE - Índice de Grau de Endividamento" 
                  value={formatNumber(currentRatios.ige)} 
                  formula="(PC + ELP) / AT"
                  calculation={`(${formatCurrency(currentData.currentLiabilities)} + ${formatCurrency(currentData.longTermLiabilities)}) / ${formatCurrency(currentRatios.totalAssets)}`}
                  status={currentRatios.ige <= 0.6 ? 'good' : 'warning'}
                />
                <RatioCard 
                  title="GCT - Garantia Capital Terceiros" 
                  value={formatNumber(currentRatios.gct)} 
                  formula="PL / (PC + ELP)"
                  calculation={`${formatCurrency(currentData.equity)} / (${formatCurrency(currentData.currentLiabilities)} + ${formatCurrency(currentData.longTermLiabilities)})`}
                  status={currentRatios.gct >= 1 ? 'good' : 'warning'}
                />
                <RatioCard 
                  title="CGP - Capital de Giro Próprio" 
                  value={formatCurrency(currentRatios.cgp)} 
                  formula="PL - (RLP + AP)"
                  calculation={`${formatCurrency(currentData.equity)} - (${formatCurrency(currentData.longTermReceivables)} + ${formatCurrency(currentData.permanentAssets)})`}
                  status={currentRatios.cgp > 0 ? 'good' : 'warning'}
                />
              </div>

              <div className="grid grid-cols-1 gap-6">
                {/* Other Indices */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-6">
                  <h3 className="font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-4">
                    <Activity className="w-5 h-5 text-blue-600" />
                    Detalhamento dos Índices e Fórmulas ({selectedYear})
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <DetailRow 
                      label="CCL - Capital Circulante Líquido" 
                      value={formatCurrency(currentRatios.ccl)} 
                      formula="AC - PC"
                      calculation={`${formatCurrency(currentData.currentAssets)} - ${formatCurrency(currentData.currentLiabilities)}`}
                    />
                    <DetailRow 
                      label="CCL / AT (%)" 
                      value={`${formatNumber(currentRatios.cclPercent)}%`} 
                      formula="(CCL / AT) * 100"
                      calculation={`(${formatCurrency(currentRatios.ccl)} / ${formatCurrency(currentRatios.totalAssets)}) * 100`}
                      highlight={currentRatios.cclPercent >= 16.66 ? 'success' : 'danger'}
                    />
                    <DetailRow 
                      label="PL / AT (%)" 
                      value={`${formatNumber(currentRatios.plPercent)}%`} 
                      formula="(PL / AT) * 100"
                      calculation={`(${formatCurrency(currentData.equity)} / ${formatCurrency(currentRatios.totalAssets)}) * 100`}
                      highlight={currentRatios.plPercent >= 10 ? 'success' : 'danger'}
                    />
                  </div>
                </div>

                {/* Visualization */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                  <h3 className="font-bold text-slate-800 mb-6">Comparativo de Liquidez e Solvência ({selectedYear})</h3>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={mainIndices}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} />
                        <YAxis axisLine={false} tickLine={false} />
                        <Tooltip 
                          cursor={{ fill: '#f8fafc' }}
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                          labelStyle={{ fontWeight: 'bold', color: '#1e293b', marginBottom: '4px' }}
                          labelFormatter={(label) => `Indicador: ${label}`}
                          formatter={(value: number) => [formatNumber(value), 'Valor']}
                        />
                        <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={40}>
                          {mainIndices.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Summary Table for All Years */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 overflow-hidden">
                  <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-blue-600" />
                    Resumo de Todos os Anos
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                          <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Ano</th>
                          <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">ILC</th>
                          <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">ILG</th>
                          <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">ISG</th>
                          <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">IGE</th>
                          <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">PL (%)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {allRatios.map((ratio) => (
                          <tr key={ratio.year} className={cn(
                            "hover:bg-blue-50 transition-colors",
                            ratio.year === selectedYear ? "bg-blue-50/50" : ""
                          )}>
                            <td className="px-4 py-3 text-sm font-bold text-slate-700">{ratio.year}</td>
                            <td className="px-4 py-3 text-sm font-medium text-slate-600">{formatNumber(ratio.ilc)}</td>
                            <td className="px-4 py-3 text-sm font-medium text-slate-600">{formatNumber(ratio.ilg)}</td>
                            <td className="px-4 py-3 text-sm font-medium text-slate-600">{formatNumber(ratio.isg)}</td>
                            <td className="px-4 py-3 text-sm font-medium text-slate-600">{formatNumber(ratio.ige)}</td>
                            <td className="px-4 py-3 text-sm font-medium text-slate-600">{formatNumber(ratio.plPercent)}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="history"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  Evolução dos Índices de Liquidez
                </h3>
                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={allRatios} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px' }}
                        labelStyle={{ fontWeight: 'bold', color: '#1e293b', marginBottom: '8px' }}
                        labelFormatter={(year) => `Ano: ${year}`}
                        formatter={(value: number, name: string) => [formatNumber(value), name]}
                      />
                      <Legend verticalAlign="top" height={36} iconType="circle" />
                      <Line type="monotone" dataKey="ilc" name="ILC" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 6, strokeWidth: 0 }} />
                      <Line type="monotone" dataKey="ilg" name="ILG" stroke="#10b981" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 6, strokeWidth: 0 }} />
                      <Line type="monotone" dataKey="isg" name="ISG" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 6, strokeWidth: 0 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                  <PieChart className="w-5 h-5 text-orange-600" />
                  Evolução do Endividamento e Solvência
                </h3>
                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={allRatios} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px' }}
                        labelStyle={{ fontWeight: 'bold', color: '#1e293b', marginBottom: '8px' }}
                        labelFormatter={(year) => `Ano: ${year}`}
                        formatter={(value: number, name: string) => [formatNumber(value), name]}
                      />
                      <Legend verticalAlign="top" height={36} iconType="circle" />
                      <Line type="monotone" dataKey="ige" name="IGE" stroke="#ef4444" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 6, strokeWidth: 0 }} />
                      <Line type="monotone" dataKey="gct" name="GCT" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 6, strokeWidth: 0 }} />
                      <Line type="monotone" dataKey="plPercent" name="PL (%)" stroke="#64748b" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 6, strokeWidth: 0 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-emerald-600" />
                  Evolução do Patrimônio Líquido (PL)
                </h3>
                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={allRatios} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} tickFormatter={(value) => formatCurrency(value).replace('R$', '')} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px' }}
                        labelStyle={{ fontWeight: 'bold', color: '#1e293b', marginBottom: '8px' }}
                        labelFormatter={(year) => `Ano: ${year}`}
                        formatter={(value: number) => [formatCurrency(value), 'Patrimônio Líquido']}
                      />
                      <Legend verticalAlign="top" height={36} iconType="circle" />
                      <Line type="monotone" dataKey="equity" name="Patrimônio Líquido" stroke="#10b981" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 6, strokeWidth: 0 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-t border-slate-200 mt-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="bg-slate-100 p-2 rounded-lg">
              <Code className="w-5 h-5 text-slate-600" />
            </div>
            <div className="text-left">
              <p className="text-sm font-bold text-slate-700">Eng. Software Rigonato</p>
              <p className="text-xs text-slate-400">Desenvolvimento de Sistemas Especialistas</p>
            </div>
          </div>
          <p className="text-slate-400 text-sm font-medium">
            Cálculo de Índices Financeiros &copy; 2026 - Ferramenta de Apoio à Decisão Contábil
          </p>
        </div>
      </footer>
    </div>
  );
}

function DetailRow({ label, value, formula, calculation, highlight }: { label: string; value: string; formula: string; calculation: string; highlight?: 'success' | 'danger' }) {
  return (
    <div className="flex flex-col p-4 rounded-xl bg-slate-50 border border-slate-100 hover:border-blue-200 transition-colors">
      <div className="flex justify-between items-start mb-2">
        <div>
          <div className="text-sm font-bold text-slate-700">{label}</div>
          <div className="text-[10px] text-blue-600 font-mono font-bold uppercase tracking-wider">{formula}</div>
        </div>
        <div className={cn(
          "text-xl font-black",
          highlight === 'success' ? "text-emerald-600" : highlight === 'danger' ? "text-red-600" : "text-slate-900"
        )}>
          {value}
        </div>
      </div>
      <div className="text-[11px] text-slate-400 font-mono bg-white/50 p-1.5 rounded border border-slate-100 overflow-x-auto whitespace-nowrap">
        {calculation}
      </div>
    </div>
  );
}

function InputField({ label, value, onChange }: { label: string; value: number; onChange: (v: string) => void }) {
  const formattedPreview = value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="text-sm font-medium text-slate-600">{label}</label>
        {value > 0 && (
          <span className="text-[10px] font-bold text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full">
            {formattedPreview}
          </span>
        )}
      </div>
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">
          R$
        </div>
        <input
          type="number"
          step="0.01"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="0,00"
          className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-slate-800 font-medium"
        />
      </div>
    </div>
  );
}

function RatioCard({ title, value, formula, calculation, status }: { title: string; value: string; formula: string; calculation: string; status: 'good' | 'warning' | 'neutral' }) {
  const statusColors = {
    good: "text-emerald-600 bg-emerald-50 border-emerald-100",
    warning: "text-amber-600 bg-amber-50 border-amber-100",
    neutral: "text-blue-600 bg-blue-50 border-blue-100"
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider">{title}</h4>
          <div className="text-[10px] font-mono font-bold text-blue-600 mt-1">{formula}</div>
        </div>
        <div className={cn("px-2 py-1 rounded-md text-[10px] font-bold uppercase shrink-0", statusColors[status])}>
          {status === 'good' ? 'Saudável' : status === 'warning' ? 'Atenção' : 'Indicador'}
        </div>
      </div>
      <div className="text-4xl font-black text-slate-900 mb-4">{value}</div>
      <div className="text-[11px] text-slate-400 font-mono bg-slate-50 p-2 rounded-lg border border-slate-100 overflow-x-auto whitespace-nowrap">
        {calculation}
      </div>
    </div>
  );
}

