'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { useAppStore } from '@/lib/store';
import { ASSET_CLASSES, type Allocation, type AssetClass, type SimulationEvent, type Decision } from '@/types';
import { 
  formatCurrency, 
  formatPercent, 
  formatCompactNumber,
  calculateDiversificationScore,
  calculateRiskScore,
  generateSimulationReport,
  getAllocationFromStrategy
} from '@/lib/calculations';
import { 
  ALLOCATION_PRESETS, 
  initializeSimulation, 
  processQuarter, 
  applyDecision 
} from '@/lib/simulation';
import { MARKET_SCENARIOS, getRandomScenario, getCompressedEvents } from '@/data/scenarios';
import { getPostGameAnalysis } from '@/lib/mock-ai';
import {
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend
} from 'recharts';
import { 
  Play, 
  Pause, 
  FastForward, 
  RotateCcw,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Sparkles,
  Clock,
  Target,
  ChevronRight,
  Zap,
  Shield,
  BarChart3,
  Newspaper,
  ChevronDown,
  X
} from 'lucide-react';

type SimPhase = 'setup' | 'running' | 'paused' | 'checkpoint' | 'complete';

const SPEED_CONFIG = {
  slow: 1500,
  normal: 800,
  fast: 300,
};

// Action choices for checkpoints
const ACTION_CHOICES = [
  { id: 'hold', label: 'Hold Position', description: 'Stay the course, no changes', icon: Shield },
  { id: 'rebalance', label: 'Rebalance', description: 'Reset to target allocation', icon: BarChart3 },
  { id: 'increase-contribution', label: 'Boost Savings', description: 'Increase monthly by 25%', icon: TrendingUp },
  { id: 'buy-dip', label: 'Buy the Dip', description: 'Move cash to equities', icon: Zap },
  { id: 'decrease-risk', label: 'Reduce Risk', description: 'Shift to safer assets', icon: Shield },
  { id: 'increase-equities', label: 'Go Aggressive', description: 'Increase equity exposure', icon: TrendingUp },
  { id: 'move-to-gold', label: 'Move to Gold', description: 'Shift funds to gold', icon: Target },
  { id: 'raise-cash', label: 'Raise Cash', description: 'Build cash buffer', icon: Clock },
];

// Get relevant actions based on event type
function getActionsForEvent(eventType: string): typeof ACTION_CHOICES {
  const baseActions = ['hold', 'rebalance'];
  
  switch (eventType) {
    case 'crash':
      return ACTION_CHOICES.filter(a => 
        [...baseActions, 'buy-dip', 'decrease-risk', 'raise-cash'].includes(a.id)
      );
    case 'bull':
      return ACTION_CHOICES.filter(a => 
        [...baseActions, 'increase-equities', 'increase-contribution'].includes(a.id)
      );
    case 'inflation':
      return ACTION_CHOICES.filter(a => 
        [...baseActions, 'move-to-gold', 'decrease-risk'].includes(a.id)
      );
    case 'recovery':
      return ACTION_CHOICES.filter(a => 
        [...baseActions, 'buy-dip', 'increase-equities'].includes(a.id)
      );
    default:
      return ACTION_CHOICES.filter(a => 
        [...baseActions, 'increase-contribution', 'decrease-risk'].includes(a.id)
      );
  }
}

export function SoloScreen() {
  const { 
    user, 
    simulation, 
    startSimulation, 
    updateSimulation, 
    endSimulation, 
    addXP, 
    unlockAchievement,
    soloState,
    updateSoloState,
    resetSoloState
  } = useAppStore();
  
  const [phase, setPhase] = useState<SimPhase>(soloState.phase);
  const [selectedDuration, setSelectedDuration] = useState(soloState.timeHorizon);
  const [strategyValue, setStrategyValue] = useState(soloState.strategyValue);
  const [allocations, setAllocations] = useState<Allocation[]>(ALLOCATION_PRESETS.balanced);
  const [speed, setSpeed] = useState<'slow' | 'normal' | 'fast'>('normal');
  const [currentEvent, setCurrentEvent] = useState<SimulationEvent | null>(null);
  const [showCheckpoint, setShowCheckpoint] = useState(false);
  const [chartData, setChartData] = useState<{ year: number; value: number; equities?: number; bonds?: number; gold?: number }[]>(soloState.chartData.length > 0 ? soloState.chartData : []);
  const [newsFeed, setNewsFeed] = useState<{ year: number; text: string; type: string }[]>(soloState.newsFeed);
  const [selectedScenario, setSelectedScenario] = useState(
    soloState.scenarioId ? MARKET_SCENARIOS.find(s => s.id === soloState.scenarioId) || null : null
  );
  const [isChartReady, setIsChartReady] = useState(false);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const quarterRef = useRef(soloState.quarterRef);
  
  // Ensure chart renders on mount
  useEffect(() => {
    const timer = setTimeout(() => setIsChartReady(true), 100);
    return () => clearTimeout(timer);
  }, []);
  
  // Restore simulation state if returning
  useEffect(() => {
    if (soloState.phase !== 'setup' && simulation) {
      setPhase(soloState.phase);
      setChartData(soloState.chartData);
      setNewsFeed(soloState.newsFeed);
      quarterRef.current = soloState.quarterRef;
    }
  }, []);
  
  // Update allocations when strategy slider changes
  useEffect(() => {
    const result = getAllocationFromStrategy(strategyValue);
    const newAllocations: Allocation[] = result.allocations.map(a => ({
      assetClass: a.assetClass as AssetClass,
      percentage: a.percentage,
      value: 0,
    }));
    setAllocations(newAllocations);
  }, [strategyValue]);
  
  // Get current strategy info
  const strategyInfo = useMemo(() => getAllocationFromStrategy(strategyValue), [strategyValue]);
  
  // Initialize simulation
  const handleStart = () => {
    const initialBalance = 1000;
    const contribution = user?.monthlyContribution || 300;
    
    // Select random scenario suitable for duration
    const scenario = getRandomScenario(selectedDuration);
    setSelectedScenario(scenario);
    
    const sim = initializeSimulation(initialBalance, contribution, selectedDuration, allocations);
    updateSimulation(sim);
    
    const initialChartData = [{ year: 0, value: initialBalance, equities: initialBalance * 0.5, bonds: initialBalance * 0.25, gold: initialBalance * 0.1 }];
    setChartData(initialChartData);
    setNewsFeed([{ year: 0, text: `Simulation started: ${scenario.title}`, type: 'news' }]);
    setPhase('running');
    quarterRef.current = 1;
    
    // Persist state
    updateSoloState({
      scenarioId: scenario.id,
      timeHorizon: selectedDuration,
      strategyValue,
      phase: 'running',
      chartData: initialChartData,
      newsFeed: [{ year: 0, text: `Simulation started: ${scenario.title}`, type: 'news' }],
      quarterRef: 1,
    });
  };
  
  // Process simulation tick
  const processTick = useCallback(() => {
    if (!simulation || phase !== 'running') return;
    
    const { newState, event } = processQuarter(simulation, quarterRef.current);
    updateSimulation(newState);
    
    // Update chart every year
    if (quarterRef.current === 4) {
      const yearNum = newState.currentYear - simulation.startYear;
      const equities = newState.portfolio.allocations
        .filter(a => ['global-equity', 'swiss-equity', 'tech-growth'].includes(a.assetClass))
        .reduce((sum, a) => sum + a.value, 0);
      const bonds = newState.portfolio.allocations
        .find(a => a.assetClass === 'bonds')?.value || 0;
      const gold = newState.portfolio.allocations
        .find(a => a.assetClass === 'gold')?.value || 0;
      
      const newChartData = [...chartData, { 
        year: yearNum, 
        value: newState.portfolio.totalValue,
        equities,
        bonds,
        gold
      }];
      setChartData(newChartData);
      updateSoloState({ chartData: newChartData, currentYear: yearNum });
    }
    
    // Handle events
    if (event) {
      setCurrentEvent(event);
      const newNewsFeed = [{
        year: newState.currentYear - simulation.startYear,
        text: event.title,
        type: event.type
      }, ...newsFeed].slice(0, 8);
      setNewsFeed(newNewsFeed);
      updateSoloState({ newsFeed: newNewsFeed });
      
      // Checkpoint on significant events
      if (event.type === 'crash' || event.type === 'bull' || event.type === 'crisis') {
        setPhase('checkpoint');
        setShowCheckpoint(true);
        updateSoloState({ phase: 'checkpoint' });
      }
    }
    
    // Advance quarter
    quarterRef.current = quarterRef.current === 4 ? 1 : quarterRef.current + 1;
    updateSoloState({ quarterRef: quarterRef.current });
    
    // Check completion
    if (newState.currentYear >= simulation.endYear) {
      setPhase('complete');
      updateSoloState({ phase: 'complete' });
      addXP(150);
      if (selectedDuration >= 30) {
        unlockAchievement('long-term-thinker');
      }
    }
  }, [simulation, phase, updateSimulation, addXP, unlockAchievement, selectedDuration, chartData, newsFeed, updateSoloState]);
  
  // Run simulation loop
  useEffect(() => {
    if (phase === 'running') {
      intervalRef.current = setInterval(processTick, SPEED_CONFIG[speed]);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [phase, speed, processTick]);
  
  // Handle decision at checkpoint
  const handleDecision = (decision: Decision['type']) => {
    if (!simulation) return;
    const newState = applyDecision(simulation, decision);
    updateSimulation(newState);
    setShowCheckpoint(false);
    setPhase('running');
    updateSoloState({ phase: 'running' });
    
    // Check for achievements
    if (decision === 'hold' && currentEvent?.type === 'crash') {
      unlockAchievement('held-through-crash');
    }
    if (decision === 'buy-dip' && currentEvent?.type === 'crash') {
      addXP(50);
    }
  };
  
  // Reset simulation
  const handleReset = () => {
    endSimulation();
    setPhase('setup');
    setChartData([]);
    setNewsFeed([]);
    setCurrentEvent(null);
    quarterRef.current = 1;
    setSelectedScenario(null);
    resetSoloState();
  };
  
  // Render setup phase
  if (phase === 'setup') {
    return (
      <div className="px-4 pt-6 pb-4">
        <h1 className="text-2xl font-bold tracking-tight mb-1">Solo Simulation</h1>
        <p className="text-muted-foreground text-sm mb-6">Experience decades of market history in minutes</p>
        
        {/* Time Horizon Slider */}
        <Card className="p-4 mb-4">
          <h3 className="text-sm font-bold mb-3">Time Horizon</h3>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Duration</span>
            <span className="font-bold text-primary text-lg">{selectedDuration} years</span>
          </div>
          <Slider
            value={[selectedDuration]}
            onValueChange={([v]) => setSelectedDuration(v)}
            min={10}
            max={50}
            step={5}
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-2">
            <span>10Y Quick</span>
            <span>30Y Career</span>
            <span>50Y Lifetime</span>
          </div>
        </Card>
        
        {/* Strategy Slider */}
        <Card className="p-4 mb-4">
          <h3 className="text-sm font-bold mb-3">Investment Strategy</h3>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Risk Level</span>
            <span className={`font-bold text-lg ${
              strategyInfo.label === 'Conservative' ? 'text-emerald-400' :
              strategyInfo.label === 'Balanced' ? 'text-blue-400' :
              strategyInfo.label === 'Growth' ? 'text-purple-400' :
              'text-orange-400'
            }`}>
              {strategyInfo.label}
            </span>
          </div>
          
          {/* Risk color bar */}
          <div className="relative mb-2">
            <div className="absolute -top-0 left-0 right-0 h-1.5 rounded-full overflow-hidden">
              <div className="absolute inset-y-0 left-0 w-1/4 bg-emerald-500/30" />
              <div className="absolute inset-y-0 left-1/4 w-1/4 bg-blue-500/30" />
              <div className="absolute inset-y-0 left-1/2 w-1/4 bg-purple-500/30" />
              <div className="absolute inset-y-0 right-0 w-1/4 bg-orange-500/30" />
            </div>
            <Slider
              value={[strategyValue]}
              onValueChange={([v]) => setStrategyValue(v)}
              min={0}
              max={100}
              step={5}
              className="mt-1"
            />
          </div>
          <div className="flex justify-between text-[10px] text-muted-foreground mb-4">
            <span>Conservative</span>
            <span>Balanced</span>
            <span>Growth</span>
            <span>Aggressive</span>
          </div>
          
          {/* Allocation Preview */}
          <div className="flex items-center gap-4">
            <div className="w-24 h-24">
              {isChartReady && (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={allocations.filter(a => a.percentage > 0)}
                      dataKey="percentage"
                      nameKey="assetClass"
                      cx="50%"
                      cy="50%"
                      innerRadius={25}
                      outerRadius={40}
                      isAnimationActive={false}
                    >
                      {allocations.filter(a => a.percentage > 0).map((entry) => (
                        <Cell key={entry.assetClass} fill={ASSET_CLASSES[entry.assetClass].color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
            <div className="flex-1 space-y-1">
              {allocations.filter(a => a.percentage > 0).map((a) => (
                <div key={a.assetClass} className="flex items-center gap-2 text-xs">
                  <div 
                    className="w-3 h-3 rounded-full flex-shrink-0" 
                    style={{ backgroundColor: ASSET_CLASSES[a.assetClass].color }}
                  />
                  <span className="flex-1">{ASSET_CLASSES[a.assetClass].name}</span>
                  <span className="text-muted-foreground font-medium">{a.percentage}%</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
        
        {/* Risk/Diversification Scores */}
        <Card className="p-4 mb-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-4 h-4 text-blue-400" />
                <span className="text-xs text-muted-foreground font-medium">Risk Score</span>
              </div>
              <p className="text-2xl font-bold">{strategyInfo.riskScore}</p>
              <Progress value={strategyInfo.riskScore} className="h-1 mt-1" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="w-4 h-4 text-primary" />
                <span className="text-xs text-muted-foreground font-medium">Diversification</span>
              </div>
              <p className="text-2xl font-bold">{strategyInfo.diversificationScore}</p>
              <Progress value={strategyInfo.diversificationScore} className="h-1 mt-1" />
            </div>
          </div>
        </Card>
        
        <Button className="w-full font-bold" size="lg" onClick={handleStart}>
          <Play className="w-4 h-4 mr-2" /> Start Simulation
        </Button>
        
        <p className="text-xs text-center text-muted-foreground mt-3">
          For educational purposes. Simulated scenarios based on historical patterns.
        </p>
      </div>
    );
  }
  
  // Render complete phase
  if (phase === 'complete' && simulation) {
    const report = generateSimulationReport(
      simulation.portfolio,
      simulation.decisions,
      1000
    );
    const analysis = getPostGameAnalysis(report);
    
    return (
      <div className="px-4 pt-6 pb-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center mb-6"
        >
          <h1 className="text-2xl font-bold tracking-tight mb-1">Simulation Complete</h1>
          <p className="text-muted-foreground">Your {selectedDuration}-year journey</p>
        </motion.div>
        
        {/* Final Value */}
        <Card className="p-6 bg-gradient-to-br from-primary/20 to-primary/5 border-primary/20 mb-4 text-center">
          <p className="text-sm text-muted-foreground font-medium mb-1">Final Portfolio Value</p>
          <motion.p 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
            className="text-4xl font-bold text-primary"
          >
            {formatCurrency(report.finalValue)}
          </motion.p>
          <p className="text-sm mt-2">
            <span className={report.annualizedReturn > 0 ? 'text-primary font-bold' : 'text-destructive font-bold'}>
              {formatPercent(report.annualizedReturn)}
            </span>
            <span className="text-muted-foreground"> annualized return</span>
          </p>
        </Card>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <Card className="p-3 text-center">
            <p className="text-xs text-muted-foreground font-medium">Contributed</p>
            <p className="font-bold">{formatCompactNumber(report.totalContributions)}</p>
          </Card>
          <Card className="p-3 text-center">
            <p className="text-xs text-muted-foreground font-medium">Max Drawdown</p>
            <p className="font-bold text-orange-500">-{report.maxDrawdown}%</p>
          </Card>
          <Card className="p-3 text-center">
            <p className="text-xs text-muted-foreground font-medium">Diversification</p>
            <p className="font-bold text-primary">{report.diversificationScore}</p>
          </Card>
        </div>
        
        {/* Chart */}
        <Card className="p-4 mb-4">
          <h3 className="text-sm font-bold mb-3">Your Journey</h3>
          <div className="h-40" style={{ minHeight: '160px' }}>
            {isChartReady && chartData.length > 0 && (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                  <defs>
                    <linearGradient id="colorValueSolo" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.05}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="year" hide />
                  <YAxis hide />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#10b981"
                    strokeWidth={3}
                    fill="url(#colorValueSolo)"
                    isAnimationActive={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>
        
        {/* Analysis */}
        <Card className="p-4 mb-4 border-primary/20 bg-primary/5">
          <div className="flex gap-3">
            <Sparkles className="w-5 h-5 text-primary flex-shrink-0" />
            <p className="text-sm">{analysis.message}</p>
          </div>
        </Card>
        
        {/* Good Decisions */}
        {report.goodDecisions.length > 0 && (
          <Card className="p-4 mb-4 border-emerald-500/30 bg-emerald-500/5">
            <h4 className="text-sm font-bold text-emerald-500 mb-2">Smart Moves</h4>
            <ul className="space-y-2">
              {report.goodDecisions.map((d, i) => (
                <li key={i} className="text-sm flex items-start gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                  {d}
                </li>
              ))}
            </ul>
          </Card>
        )}
        
        {/* Mistakes */}
        {report.mistakes.length > 0 && (
          <Card className="p-4 mb-4 border-orange-500/30 bg-orange-500/5">
            <h4 className="text-sm font-bold text-orange-500 mb-2">Areas to Improve</h4>
            <ul className="space-y-2">
              {report.mistakes.map((m, i) => (
                <li key={i} className="text-sm flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
                  {m}
                </li>
              ))}
            </ul>
          </Card>
        )}
        
        {/* Coaching Tips */}
        <Card className="p-4 mb-6">
          <h4 className="text-sm font-bold mb-3">Key Takeaways</h4>
          <ul className="space-y-2">
            {report.coachingInsights.map((insight, i) => (
              <li key={i} className="text-sm flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                {insight}
              </li>
            ))}
          </ul>
        </Card>
        
        <Button className="w-full font-bold" size="lg" onClick={handleReset}>
          <RotateCcw className="w-4 h-4 mr-2" /> Run it again smarter
        </Button>
        
        <p className="text-xs text-center text-muted-foreground mt-3">
          +150 XP earned from this simulation
        </p>
      </div>
    );
  }
  
  // Render running/paused/checkpoint phases
  if (simulation) {
    const progress = ((simulation.currentYear - simulation.startYear) / (simulation.endYear - simulation.startYear)) * 100;
    const returns = ((simulation.portfolio.totalValue - 1000) / 1000) * 100;
    const availableActions = currentEvent ? getActionsForEvent(currentEvent.type) : ACTION_CHOICES.slice(0, 4);
    
    return (
      <div className="px-4 pt-6 pb-4">
        {/* Header with progress */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold">Year {simulation.currentYear - simulation.startYear}</h1>
            <p className="text-sm text-muted-foreground">{simulation.currentYear}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold">{formatCompactNumber(simulation.portfolio.totalValue)}</p>
            <p className={`text-sm font-semibold ${returns >= 0 ? 'text-primary' : 'text-destructive'}`}>
              {formatPercent(returns)}
            </p>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>Start</span>
            <span className="font-medium">{Math.round(progress)}% complete</span>
            <span>{selectedDuration}Y</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
        
        {/* Checkpoint Action Modal - positioned under progress bar */}
        <AnimatePresence>
          {showCheckpoint && currentEvent && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-4"
            >
              <Card className={`p-4 border-2 ${
                currentEvent.type === 'crash' ? 'border-destructive bg-destructive/5' :
                currentEvent.type === 'bull' ? 'border-primary bg-primary/5' :
                'border-orange-500 bg-orange-500/5'
              }`}>
                <div className="flex items-start gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    currentEvent.type === 'crash' ? 'bg-destructive/20' :
                    currentEvent.type === 'bull' ? 'bg-primary/20' :
                    'bg-orange-500/20'
                  }`}>
                    {currentEvent.type === 'crash' ? (
                      <TrendingDown className="w-5 h-5 text-destructive" />
                    ) : currentEvent.type === 'bull' ? (
                      <TrendingUp className="w-5 h-5 text-primary" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-orange-500" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold">{currentEvent.title}</h3>
                    <p className="text-sm text-muted-foreground">{currentEvent.description}</p>
                  </div>
                </div>
                
                <p className="text-sm font-semibold mb-3">What will you do?</p>
                
                <div className="grid grid-cols-2 gap-2">
                  {availableActions.slice(0, 4).map((action) => {
                    const Icon = action.icon;
                    return (
                      <button
                        key={action.id}
                        onClick={() => handleDecision(action.id as Decision['type'])}
                        className="p-3 rounded-xl bg-card border border-border hover:border-primary/50 text-left transition-colors"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <Icon className="w-4 h-4 text-primary" />
                          <span className="text-sm font-semibold">{action.label}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{action.description}</p>
                      </button>
                    );
                  })}
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Market News - at top */}
        {newsFeed.length > 0 && (
          <Card className="p-3 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Newspaper className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-bold">Market News</h3>
            </div>
            <div className="space-y-2 max-h-24 overflow-y-auto">
              {newsFeed.slice(0, 4).map((news, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                    news.type === 'crash' ? 'bg-destructive' :
                    news.type === 'bull' ? 'bg-primary' :
                    news.type === 'crisis' ? 'bg-orange-500' :
                    news.type === 'recovery' ? 'bg-emerald-500' :
                    'bg-muted-foreground'
                  }`} />
                  <div className="flex-1">
                    <p className="text-xs">{news.text}</p>
                    <p className="text-[10px] text-muted-foreground">Year {news.year}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
        
        {/* Live Chart with multiple lines */}
        <Card className="p-4 mb-4">
          <h3 className="text-sm font-bold mb-3">Portfolio Value</h3>
          <div className="h-36" style={{ minHeight: '144px' }}>
            {isChartReady && chartData.length > 0 && (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                  <defs>
                    <linearGradient id="colorValueLive" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.05}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="year" hide />
                  <YAxis hide />
                  <Tooltip 
                    contentStyle={{ 
                      background: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '11px'
                    }}
                    formatter={(value: number) => [formatCompactNumber(value), '']}
                    labelFormatter={(label) => `Year ${label}`}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#10b981"
                    strokeWidth={3}
                    fill="url(#colorValueLive)"
                    isAnimationActive={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>
        
        {/* Allocation Breakdown */}
        <Card className="p-4 mb-4">
          <h3 className="text-sm font-bold mb-3">Portfolio Allocation</h3>
          <div className="flex items-center gap-4">
            <div className="w-20 h-20">
              {isChartReady && (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={simulation.portfolio.allocations.filter(a => a.percentage > 0)}
                      dataKey="percentage"
                      nameKey="assetClass"
                      cx="50%"
                      cy="50%"
                      innerRadius={20}
                      outerRadius={35}
                      isAnimationActive={false}
                    >
                      {simulation.portfolio.allocations.filter(a => a.percentage > 0).map((entry) => (
                        <Cell key={entry.assetClass} fill={ASSET_CLASSES[entry.assetClass].color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
            <div className="flex-1 space-y-1">
              {simulation.portfolio.allocations.filter(a => a.percentage > 0).map((a) => (
                <div key={a.assetClass} className="flex items-center gap-2 text-xs">
                  <div 
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0" 
                    style={{ backgroundColor: ASSET_CLASSES[a.assetClass].color }}
                  />
                  <span className="flex-1 truncate">{ASSET_CLASSES[a.assetClass].name}</span>
                  <span className="text-muted-foreground">{a.percentage.toFixed(0)}%</span>
                  <span className="font-medium w-16 text-right">{formatCompactNumber(a.value)}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
        
        {/* Simulation Controls */}
        <div className="flex gap-3 mb-4">
          <Button 
            variant={phase === 'running' ? 'secondary' : 'default'}
            className="flex-1"
            onClick={() => {
              const newPhase = phase === 'running' ? 'paused' : 'running';
              setPhase(newPhase);
              updateSoloState({ phase: newPhase });
            }}
          >
            {phase === 'running' ? (
              <>
                <Pause className="w-4 h-4 mr-2" /> Pause
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" /> Resume
              </>
            )}
          </Button>
          
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => {
              const speeds: ('slow' | 'normal' | 'fast')[] = ['slow', 'normal', 'fast'];
              const currentIndex = speeds.indexOf(speed);
              setSpeed(speeds[(currentIndex + 1) % 3]);
            }}
          >
            <FastForward className={`w-4 h-4 ${speed === 'fast' ? 'text-primary' : ''}`} />
          </Button>
          
          <Button variant="outline" size="icon" onClick={handleReset}>
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>
        
        {/* Speed indicator */}
        <p className="text-xs text-center text-muted-foreground">
          Speed: {speed.charAt(0).toUpperCase() + speed.slice(1)}
        </p>
      </div>
    );
  }
  
  return null;
}
