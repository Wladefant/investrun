'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { useAppStore } from '@/lib/store';
import { PRESET_GOALS } from '@/types';
import type { Goal, OptimizationSuggestion } from '@/types';
import { 
  generateFutureProjection, 
  formatCurrency, 
  formatCompactNumber,
  formatYearsMonths,
  getRiskLevel,
  generateOptimizations,
  calculateScenarioWithChanges 
} from '@/lib/calculations';
import { 
  getProjectionExplanation, 
  getCostOfWaitingInsight,
  getFutureSelfMessage 
} from '@/lib/mock-ai';
import {
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
  ReferenceLine
} from 'recharts';
import { 
  Target, 
  TrendingUp, 
  Clock, 
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Sparkles,
  MessageCircle,
  Check,
  Zap,
  Shield,
  Info
} from 'lucide-react';

export function FutureScreen() {
  const { 
    user, 
    selectedGoal, 
    setSelectedGoal,
    monthlyContribution, 
    setMonthlyContribution,
    expectedReturn,
    setExpectedReturn,
    customGoals 
  } = useAppStore();
  
  const [showGoalPicker, setShowGoalPicker] = useState(false);
  const [activeScenario, setActiveScenario] = useState<string>('base');
  const [showOptimizations, setShowOptimizations] = useState(false);
  const [isChartReady, setIsChartReady] = useState(false);
  
  // Ensure chart renders on mount
  useEffect(() => {
    const timer = setTimeout(() => setIsChartReady(true), 100);
    return () => clearTimeout(timer);
  }, []);
  
  const allGoals = [...PRESET_GOALS, ...customGoals];
  
  const projection = useMemo(() => 
    generateFutureProjection(
      selectedGoal.targetAmount,
      monthlyContribution,
      expectedReturn,
      user?.age || 22
    ),
    [selectedGoal.targetAmount, monthlyContribution, expectedReturn, user?.age]
  );
  
  const timeToGoal = formatYearsMonths(projection.yearsToGoal);
  const riskInfo = getRiskLevel(expectedReturn);
  
  // Generate optimizations
  const optimizations = useMemo(() => 
    generateOptimizations(
      selectedGoal.targetAmount,
      monthlyContribution,
      expectedReturn,
      projection.yearsToGoal
    ),
    [selectedGoal.targetAmount, monthlyContribution, expectedReturn, projection.yearsToGoal]
  );
  
  // Chart data
  const chartData = useMemo(() => {
    const scenario = projection.scenarios.find(s => s.id === activeScenario) || projection.scenarios[0];
    
    if (scenario.id === 'base') {
      return projection.yearlyBalances.map(b => ({
        year: b.year,
        value: b.balance,
        target: selectedGoal.targetAmount,
      }));
    }
    
    const scenarioResult = calculateScenarioWithChanges(
      selectedGoal.targetAmount,
      monthlyContribution,
      expectedReturn,
      scenario.changes
    );
    
    return scenarioResult.yearlyBalances.map(b => ({
      year: b.year,
      value: b.balance,
      target: selectedGoal.targetAmount,
    }));
  }, [projection, activeScenario, selectedGoal.targetAmount, monthlyContribution, expectedReturn]);
  
  const activeScenarioData = projection.scenarios.find(s => s.id === activeScenario) || projection.scenarios[0];
  const activeScenarioTime = formatYearsMonths(activeScenarioData.yearsToGoal);
  
  // AI Messages
  const projectionMessage = getProjectionExplanation(
    projection.yearsToGoal, 
    selectedGoal.targetAmount, 
    monthlyContribution
  );
  
  const costMessage = getCostOfWaitingInsight(
    projection.costOfWaiting.lostValue,
    projection.costOfWaiting.delayYears
  );
  
  const futureSelfMessage = getFutureSelfMessage(
    user?.age || 22,
    projection.yearsToGoal,
    selectedGoal.targetAmount
  );
  
  return (
    <div className="pb-4">
      {/* Header */}
      <div className="px-4 pt-6 pb-4">
        <h1 className="text-2xl font-bold tracking-tight mb-1">Future Engine</h1>
        <p className="text-muted-foreground text-sm">See what your money could become</p>
      </div>
      
      {/* Top Summary */}
      <div className="px-4 mb-6">
        <Card className="p-5 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent border-primary/20">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm text-muted-foreground font-medium mb-1">Time to reach goal</p>
              <motion.div 
                key={activeScenarioData.yearsToGoal}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex items-baseline gap-2"
              >
                {timeToGoal.years > 0 && (
                  <>
                    <span className="text-4xl font-bold text-primary">{activeScenarioTime.years}</span>
                    <span className="text-xl text-muted-foreground font-medium">
                      {activeScenarioTime.years === 1 ? 'year' : 'years'}
                    </span>
                  </>
                )}
                {activeScenarioTime.months > 0 && (
                  <>
                    <span className={`${timeToGoal.years > 0 ? 'text-2xl' : 'text-4xl'} font-bold text-primary`}>
                      {activeScenarioTime.months}
                    </span>
                    <span className="text-xl text-muted-foreground font-medium">
                      {activeScenarioTime.months === 1 ? 'month' : 'months'}
                    </span>
                  </>
                )}
              </motion.div>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground font-medium mb-1">Target</p>
              <p className="text-xl font-bold">{formatCurrency(selectedGoal.targetAmount)}</p>
            </div>
          </div>
          
          {/* Milestones */}
          <div className="flex gap-2">
            {projection.monthlyMilestones.map((milestone, i) => {
              const milestoneTime = formatYearsMonths(milestone.year);
              return (
                <div 
                  key={milestone.percentComplete}
                  className={`flex-1 text-center py-2 rounded-lg ${
                    i === 0 ? 'bg-primary/20' : 'bg-secondary'
                  }`}
                >
                  <p className="text-xs text-muted-foreground font-medium">{milestone.percentComplete}%</p>
                  <p className="text-sm font-bold">
                    {milestoneTime.years > 0 ? `${milestoneTime.years}y` : ''}
                    {milestoneTime.months > 0 ? ` ${milestoneTime.months}m` : ''}
                  </p>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
      
      {/* Goal Selector */}
      <div className="px-4 mb-4">
        <button
          onClick={() => setShowGoalPicker(!showGoalPicker)}
          className="w-full p-4 rounded-xl bg-card border border-border flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">{selectedGoal.icon}</span>
            <div className="text-left">
              <p className="font-bold">{selectedGoal.name}</p>
              <p className="text-sm text-muted-foreground">{formatCurrency(selectedGoal.targetAmount)}</p>
            </div>
          </div>
          <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${showGoalPicker ? 'rotate-180' : ''}`} />
        </button>
        
        <AnimatePresence>
          {showGoalPicker && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="pt-2 space-y-2 max-h-64 overflow-y-auto">
                {allGoals.map((goal) => (
                  <button
                    key={goal.id}
                    onClick={() => {
                      setSelectedGoal(goal);
                      setShowGoalPicker(false);
                    }}
                    className={`w-full p-3 rounded-xl border text-left flex items-center gap-3 transition-colors ${
                      selectedGoal.id === goal.id 
                        ? 'border-primary bg-primary/10' 
                        : 'border-border bg-card hover:border-primary/50'
                    }`}
                  >
                    <span className="text-xl">{goal.icon}</span>
                    <span className="flex-1 font-semibold">{goal.name}</span>
                    <span className="text-sm text-muted-foreground">{formatCurrency(goal.targetAmount)}</span>
                    {selectedGoal.id === goal.id && <Check className="w-4 h-4 text-primary" />}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Input Controls */}
      <div className="px-4 mb-6">
        <Card className="p-4">
          <div className="mb-6">
            <div className="flex justify-between mb-2">
              <span className="text-sm text-muted-foreground font-medium">Monthly contribution</span>
              <span className="font-bold text-primary">€{monthlyContribution}</span>
            </div>
            <Slider
              value={[monthlyContribution]}
              onValueChange={([v]) => setMonthlyContribution(v)}
              min={50}
              max={2000}
              step={50}
            />
          </div>
          
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm text-muted-foreground font-medium">Expected annual return</span>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                  riskInfo.level === 'low' ? 'bg-emerald-500/20 text-emerald-400' :
                  riskInfo.level === 'medium' ? 'bg-blue-500/20 text-blue-400' :
                  'bg-orange-500/20 text-orange-400'
                }`}>
                  {riskInfo.label}
                </span>
                <span className="font-bold text-primary">{(expectedReturn * 100).toFixed(0)}%</span>
              </div>
            </div>
            
            {/* Risk Indicator */}
            <div className="relative mb-2">
              <div className="absolute -top-0 left-0 right-0 h-1.5 rounded-full overflow-hidden">
                <div className="absolute inset-y-0 left-0 w-1/3 bg-emerald-500/30" />
                <div className="absolute inset-y-0 left-1/3 w-1/3 bg-blue-500/30" />
                <div className="absolute inset-y-0 right-0 w-1/3 bg-orange-500/30" />
              </div>
              <Slider
                value={[expectedReturn * 100]}
                onValueChange={([v]) => setExpectedReturn(v / 100)}
                min={3}
                max={10}
                step={0.5}
                className="mt-1"
              />
            </div>
            
            <div className="flex justify-between text-[10px] text-muted-foreground mb-2">
              <span>Conservative</span>
              <span>Balanced</span>
              <span>Aggressive</span>
            </div>
            
            {/* Risk Warning */}
            {expectedReturn > 0.07 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="flex items-start gap-2 p-2 rounded-lg bg-orange-500/10 border border-orange-500/20 mt-2"
              >
                <Info className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-orange-300">
                  Higher expected returns typically require taking higher risk. Consider if this aligns with your risk tolerance.
                </p>
              </motion.div>
            )}
            
            <p className="text-xs text-muted-foreground mt-2">
              Historical stock market average: ~7% per year
            </p>
          </div>
        </Card>
      </div>
      
      {/* Chart */}
      <div className="px-4 mb-6">
        <Card className="p-4">
          <h3 className="text-sm font-bold mb-4">Projected Growth</h3>
          <div className="h-48" style={{ minHeight: '192px' }}>
            {isChartReady && chartData.length > 0 && (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.05}/>
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="year" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                    interval="preserveStartEnd"
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                    tickFormatter={(v) => `€${(v / 1000).toFixed(0)}k`}
                    width={45}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      background: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                    formatter={(value: number) => [formatCurrency(value), 'Portfolio']}
                    labelFormatter={(label) => `Year ${label}`}
                  />
                  <ReferenceLine 
                    y={selectedGoal.targetAmount} 
                    stroke="hsl(var(--primary))" 
                    strokeDasharray="3 3"
                    label={{ 
                      value: 'Goal', 
                      fill: 'hsl(var(--primary))', 
                      fontSize: 10,
                      position: 'right'
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#10b981"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorValue)"
                    isAnimationActive={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>
      </div>
      
      {/* Scenario Comparison */}
      <div className="px-4 mb-6">
        <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wide mb-3">Scenarios</h3>
        <div className="space-y-3">
          {projection.scenarios.map((scenario) => {
            const scenarioTime = formatYearsMonths(scenario.yearsToGoal);
            const savedTime = formatYearsMonths(projection.yearsToGoal - scenario.yearsToGoal);
            return (
              <motion.button
                key={scenario.id}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveScenario(scenario.id)}
                className={`w-full p-4 rounded-xl border text-left transition-all ${
                  activeScenario === scenario.id
                    ? 'border-primary bg-primary/10'
                    : 'border-border bg-card'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold">{scenario.name}</span>
                  <span className={`font-bold ${
                    scenario.yearsToGoal < projection.yearsToGoal 
                      ? 'text-primary' 
                      : 'text-foreground'
                  }`}>
                    {scenarioTime.text}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{scenario.description}</p>
                {scenario.yearsToGoal < projection.yearsToGoal && (
                  <p className="text-xs text-primary font-semibold mt-2">
                    Save {savedTime.text}!
                  </p>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>
      
      {/* Cost of Waiting */}
      <div className="px-4 mb-6">
        <Card className="p-4 border-orange-500/30 bg-orange-500/5">
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <p className="text-xs text-orange-500 font-bold uppercase tracking-wide mb-1">Cost of Waiting</p>
              <p className="text-sm text-foreground leading-relaxed">
                Delaying by <span className="font-bold">{projection.costOfWaiting.delayYears} years</span> could 
                cost you <span className="font-bold text-orange-500">{formatCurrency(projection.costOfWaiting.lostValue)}</span> in 
                potential growth.
              </p>
            </div>
          </div>
        </Card>
      </div>
      
      {/* AI Coach Insights */}
      <div className="px-4 mb-6">
        <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wide mb-3">Coach Insights</h3>
        
        <Card className="p-4 mb-3 border-primary/20 bg-primary/5">
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            <p className="text-sm text-foreground leading-relaxed">{projectionMessage.message}</p>
          </div>
        </Card>
        
        <Card className="p-4 border-border">
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
              <Clock className="w-4 h-4 text-muted-foreground" />
            </div>
            <p className="text-sm text-foreground leading-relaxed">{costMessage.message}</p>
          </div>
        </Card>
      </div>
      
      {/* Future Self Message */}
      <div className="px-4 mb-6">
        <Card className="p-4 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
              <MessageCircle className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-primary font-bold uppercase tracking-wide mb-1">
                Message from {(user?.age || 22) + Math.round(activeScenarioData.yearsToGoal)}-year-old you
              </p>
              <p className="text-sm text-foreground leading-relaxed italic">"{futureSelfMessage.message}"</p>
            </div>
          </div>
        </Card>
      </div>
      
      {/* CTA - Optimize Button */}
      <div className="px-4 pb-4">
        <Button 
          className="w-full font-bold" 
          size="lg"
          onClick={() => setShowOptimizations(true)}
        >
          <Zap className="w-4 h-4 mr-2" /> Optimize my plan
        </Button>
        <p className="text-xs text-center text-muted-foreground mt-3">
          For educational use only. Past performance does not guarantee future results.
        </p>
      </div>
      
      {/* Optimization Modal */}
      <AnimatePresence>
        {showOptimizations && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm overflow-y-auto"
            onClick={() => setShowOptimizations(false)}
          >
            <div className="min-h-full flex items-end sm:items-center justify-center p-4">
              <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-lg"
              >
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Zap className="w-5 h-5 text-primary" />
                      <h3 className="text-lg font-bold">Optimization Suggestions</h3>
                    </div>
                    <button 
                      onClick={() => setShowOptimizations(false)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <ChevronDown className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-4">
                    Based on your goal of <span className="font-semibold text-foreground">{formatCurrency(selectedGoal.targetAmount)}</span>, 
                    here are ways to reach it faster:
                  </p>
                  
                  <div className="space-y-3">
                    {optimizations.map((opt, i) => (
                      <motion.div
                        key={opt.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className={`p-4 rounded-xl border ${
                          i === 0 ? 'border-primary bg-primary/5' : 'border-border bg-card'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            opt.changeType === 'contribution' ? 'bg-emerald-500/20' :
                            opt.changeType === 'delay' ? 'bg-blue-500/20' :
                            opt.changeType === 'return' ? 'bg-purple-500/20' :
                            'bg-orange-500/20'
                          }`}>
                            {opt.changeType === 'contribution' && <TrendingUp className="w-4 h-4 text-emerald-400" />}
                            {opt.changeType === 'delay' && <Clock className="w-4 h-4 text-blue-400" />}
                            {opt.changeType === 'target' && <Target className="w-4 h-4 text-orange-400" />}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="font-bold text-sm">{opt.title}</h4>
                              {i === 0 && (
                                <span className="text-[10px] font-bold text-primary bg-primary/20 px-2 py-0.5 rounded">
                                  RECOMMENDED
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mb-2">{opt.description}</p>
                            <p className="text-xs font-semibold text-primary">{opt.impact}</p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  
                  {/* AI Explanation Card */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="mt-4 p-4 rounded-xl bg-primary/10 border border-primary/20"
                  >
                    <div className="flex gap-3">
                      <Sparkles className="w-5 h-5 text-primary flex-shrink-0" />
                      <div>
                        <p className="text-xs font-bold text-primary uppercase tracking-wide mb-1">AI Coach Analysis</p>
                        <p className="text-sm leading-relaxed">
                          The most impactful change you can make is increasing your monthly contribution. 
                          Even a 25% increase compounds dramatically over time. Combined with staying invested 
                          through market cycles, this approach has historically produced the best outcomes for 
                          long-term investors.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                  
                  <Button 
                    className="w-full mt-4 font-bold" 
                    onClick={() => setShowOptimizations(false)}
                  >
                    Got it, thanks!
                  </Button>
                </Card>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
