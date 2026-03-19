'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { useAppStore } from '@/lib/store';
import { formatCompactNumber, generateFutureProjection, formatYearsMonths } from '@/lib/calculations';
import { getDailyInsight } from '@/lib/mock-ai';
import { getLevel, RECENT_ACTIVITY, MOCK_LEADERBOARD, TIER_COLORS } from '@/data/mock-data';
import type { Goal } from '@/types';
import { 
  TrendingUp, 
  Target, 
  Flame, 
  Trophy,
  ChevronRight,
  Sparkles,
  Lightbulb,
  MessageCircle,
  Gamepad2,
  Swords,
  User,
  Plus,
  X,
  Check,
  Edit2
} from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export function HomeScreen() {
  const { 
    user, 
    selectedGoal, 
    monthlyContribution, 
    expectedReturn, 
    setActiveTab,
    customGoals,
    addCustomGoal,
    updateCustomGoal,
    setSelectedGoal
  } = useAppStore();
  
  const [showCreateGoal, setShowCreateGoal] = useState(false);
  const [goalName, setGoalName] = useState('');
  const [goalPrice, setGoalPrice] = useState('');
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [errors, setErrors] = useState<{ name?: string; price?: string }>({});
  
  const projection = generateFutureProjection(
    selectedGoal.targetAmount,
    monthlyContribution,
    expectedReturn,
    user?.age || 22
  );
  
  const projectedValue = projection.yearlyBalances[10]?.balance || 0;
  const level = getLevel(user?.xp || 0);
  const tierColors = TIER_COLORS[user?.tier || 'bronze'];
  const timeToGoal = formatYearsMonths(projection.yearsToGoal);
  
  const validateGoal = () => {
    const newErrors: { name?: string; price?: string } = {};
    if (!goalName.trim()) {
      newErrors.name = 'Goal name is required';
    }
    const price = parseFloat(goalPrice);
    if (!goalPrice || isNaN(price) || price <= 0) {
      newErrors.price = 'Enter a valid positive amount';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleCreateGoal = () => {
    if (!validateGoal()) return;
    
    const newGoal: Goal = {
      id: `custom-${Date.now()}`,
      name: goalName.trim(),
      targetAmount: parseFloat(goalPrice),
      icon: '🎯',
      category: 'lifestyle',
    };
    
    if (editingGoal) {
      updateCustomGoal(editingGoal.id, { name: newGoal.name, targetAmount: newGoal.targetAmount });
    } else {
      addCustomGoal(newGoal);
      setSelectedGoal(newGoal);
    }
    
    setShowCreateGoal(false);
    setGoalName('');
    setGoalPrice('');
    setEditingGoal(null);
    setErrors({});
  };
  
  const handleEditGoal = (goal: Goal) => {
    setEditingGoal(goal);
    setGoalName(goal.name);
    setGoalPrice(goal.targetAmount.toString());
    setShowCreateGoal(true);
  };
  
  return (
    <motion.div 
      className="px-4 pt-6 pb-4"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-center justify-between mb-6">
        <div>
          <p className="text-muted-foreground text-sm font-medium">Welcome back,</p>
          <h1 className="text-2xl font-bold tracking-tight">{user?.name || 'Investor'}</h1>
        </div>
        <button className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
          <User className="w-5 h-5 text-muted-foreground" />
        </button>
      </motion.div>
      
      {/* Hero Card */}
      <motion.div variants={itemVariants}>
        <Card className="p-6 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent border-primary/20 mb-6 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
          <div className="relative">
            <p className="text-muted-foreground text-sm font-medium mb-1">Your future wealth starts now</p>
            <h2 className="text-4xl font-bold tracking-tight mb-1">{formatCompactNumber(projectedValue)}</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Projected in 10 years at {(expectedReturn * 100).toFixed(0)}% return
            </p>
            <Button 
              className="font-semibold" 
              size="sm"
              onClick={() => setActiveTab('future')}
            >
              See your future <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </Card>
      </motion.div>
      
      {/* Current Goal Card */}
      <motion.div variants={itemVariants} className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wide">Your Goal</h3>
        </div>
        <Card className="p-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center text-2xl">
              {selectedGoal.icon}
            </div>
            <div className="flex-1">
              <p className="font-bold text-lg">{selectedGoal.name}</p>
              <p className="text-muted-foreground text-sm">{formatCompactNumber(selectedGoal.targetAmount)}</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-primary">{timeToGoal.text}</p>
              <p className="text-xs text-muted-foreground">to reach</p>
            </div>
          </div>
        </Card>
      </motion.div>
      
      {/* Custom Goals Section */}
      <motion.div variants={itemVariants} className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wide">My Goals</h3>
          <button 
            onClick={() => setShowCreateGoal(true)}
            className="text-xs text-primary font-semibold flex items-center gap-1"
          >
            <Plus className="w-3 h-3" /> Create Goal
          </button>
        </div>
        
        {/* Custom Goals List */}
        {customGoals.length > 0 && (
          <div className="space-y-2 mb-3">
            {customGoals.map((goal) => {
              const goalProjection = generateFutureProjection(
                goal.targetAmount,
                monthlyContribution,
                expectedReturn,
                user?.age || 22
              );
              const goalTime = formatYearsMonths(goalProjection.yearsToGoal);
              
              return (
                <Card 
                  key={goal.id} 
                  className={`p-3 cursor-pointer transition-all hover:border-primary/50 ${
                    selectedGoal.id === goal.id ? 'border-primary bg-primary/5' : ''
                  }`}
                  onClick={() => setSelectedGoal(goal)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-lg">
                      {goal.icon}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{goal.name}</p>
                      <p className="text-xs text-muted-foreground">{formatCompactNumber(goal.targetAmount)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-primary">{goalTime.text}</p>
                    </div>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditGoal(goal);
                      }}
                      className="p-1.5 rounded-lg hover:bg-secondary"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-muted-foreground" />
                    </button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
        
        {/* Create Goal Card (compact) */}
        {!showCreateGoal && customGoals.length === 0 && (
          <Card 
            className="p-4 border-dashed cursor-pointer hover:border-primary/50 transition-colors"
            onClick={() => setShowCreateGoal(true)}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                <Plus className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <p className="font-semibold text-sm">Create Your Own Goal</p>
                <p className="text-xs text-muted-foreground">Set a custom target amount</p>
              </div>
            </div>
          </Card>
        )}
      </motion.div>
      
      {/* Create Goal Modal */}
      <AnimatePresence>
        {showCreateGoal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => {
              setShowCreateGoal(false);
              setEditingGoal(null);
              setGoalName('');
              setGoalPrice('');
              setErrors({});
            }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm"
            >
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold">{editingGoal ? 'Edit Goal' : 'Create Your Goal'}</h3>
                  <button 
                    onClick={() => {
                      setShowCreateGoal(false);
                      setEditingGoal(null);
                      setGoalName('');
                      setGoalPrice('');
                      setErrors({});
                    }}
                    className="p-1 rounded-lg hover:bg-secondary"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground mb-1.5 block">
                      Goal Name
                    </label>
                    <Input 
                      placeholder="e.g., New MacBook, Dream Vacation"
                      value={goalName}
                      onChange={(e) => {
                        setGoalName(e.target.value);
                        if (errors.name) setErrors({ ...errors, name: undefined });
                      }}
                      className={errors.name ? 'border-destructive' : ''}
                    />
                    {errors.name && (
                      <p className="text-xs text-destructive mt-1">{errors.name}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-muted-foreground mb-1.5 block">
                      Target Amount
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">€</span>
                      <Input 
                        type="number"
                        placeholder="10000"
                        value={goalPrice}
                        onChange={(e) => {
                          setGoalPrice(e.target.value);
                          if (errors.price) setErrors({ ...errors, price: undefined });
                        }}
                        className={`pl-7 ${errors.price ? 'border-destructive' : ''}`}
                      />
                    </div>
                    {errors.price && (
                      <p className="text-xs text-destructive mt-1">{errors.price}</p>
                    )}
                  </div>
                  
                  {goalPrice && parseFloat(goalPrice) > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="p-3 rounded-lg bg-primary/10 border border-primary/20"
                    >
                      <p className="text-sm">
                        With your current plan, you could reach{' '}
                        <span className="font-bold text-primary">
                          {formatCompactNumber(parseFloat(goalPrice))}
                        </span>{' '}
                        in approximately{' '}
                        <span className="font-bold text-primary">
                          {formatYearsMonths(
                            generateFutureProjection(
                              parseFloat(goalPrice),
                              monthlyContribution,
                              expectedReturn,
                              user?.age || 22
                            ).yearsToGoal
                          ).text}
                        </span>
                      </p>
                    </motion.div>
                  )}
                  
                  <Button 
                    className="w-full font-semibold" 
                    onClick={handleCreateGoal}
                  >
                    <Check className="w-4 h-4 mr-2" />
                    {editingGoal ? 'Save Changes' : 'Create Goal'}
                  </Button>
                </div>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Quick Stats */}
      <motion.div variants={itemVariants} className="grid grid-cols-4 gap-3 mb-6">
        <StatCard 
          icon={TrendingUp} 
          label="Projected" 
          value={formatCompactNumber(projectedValue)}
          color="text-primary" 
        />
        <StatCard 
          icon={Target} 
          label="Monthly" 
          value={`€${monthlyContribution}`} 
          color="text-blue-400"
        />
        <StatCard 
          icon={Flame} 
          label="Streak" 
          value={`${user?.currentStreak || 0}d`} 
          color="text-orange-400"
        />
        <StatCard 
          icon={Trophy} 
          label="Rank" 
          value={`#${user?.rank || '-'}`} 
          color="text-yellow-400"
        />
      </motion.div>
      
      {/* Mode CTAs */}
      <motion.div variants={itemVariants} className="mb-6">
        <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wide mb-3">Explore</h3>
        <div className="grid gap-3">
          <ModeCard 
            icon={TrendingUp}
            title="Future Engine"
            description="Calculate your path to any goal"
            gradient="from-emerald-500/20 to-emerald-500/5"
            onClick={() => setActiveTab('future')}
          />
          <ModeCard 
            icon={Gamepad2}
            title="Solo Simulation"
            description="Experience decades of market history"
            gradient="from-blue-500/20 to-blue-500/5"
            onClick={() => setActiveTab('solo')}
          />
          <ModeCard 
            icon={Swords}
            title="Arena Mode"
            description="Compete against other investors"
            gradient="from-amber-500/20 to-amber-500/5"
            onClick={() => setActiveTab('arena')}
          />
        </div>
      </motion.div>
      
      {/* Progress & Level */}
      <motion.div variants={itemVariants}>
        <Card className="p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded text-xs font-bold ${tierColors.bg} ${tierColors.text}`}>
                {user?.tier?.toUpperCase() || 'BRONZE'}
              </span>
              <span className="text-sm font-semibold">Level {level.level}</span>
            </div>
            <span className="text-sm text-muted-foreground">{user?.xp || 0} / {level.nextLevelXP} XP</span>
          </div>
          <Progress value={level.progress} className="h-2" />
          <p className="text-xs text-muted-foreground mt-2 font-medium">{level.title}</p>
        </Card>
      </motion.div>
      
      {/* Today's Insight */}
      <motion.div variants={itemVariants}>
        <Card className="p-4 mb-6 border-primary/20 bg-primary/5">
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
              <Lightbulb className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-primary font-bold uppercase tracking-wide mb-1">Today's Insight</p>
              <p className="text-sm text-foreground leading-relaxed">{getDailyInsight()}</p>
            </div>
          </div>
        </Card>
      </motion.div>
      
      {/* Future Self Message */}
      <motion.div variants={itemVariants}>
        <Card className="p-4 mb-6 bg-gradient-to-r from-secondary to-secondary/50">
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-xl bg-foreground/10 flex items-center justify-center flex-shrink-0">
              <MessageCircle className="w-5 h-5 text-foreground" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-bold uppercase tracking-wide mb-1">Your Future Self Says...</p>
              <p className="text-sm text-foreground leading-relaxed">
                "Keep going. The small decisions you make today are building my financial freedom. 
                I'm grateful you started early."
              </p>
            </div>
          </div>
        </Card>
      </motion.div>
      
      {/* Mini Leaderboard */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wide">Top Investors</h3>
          <button 
            className="text-xs text-primary font-semibold"
            onClick={() => setActiveTab('arena')}
          >
            View all
          </button>
        </div>
        <Card className="divide-y divide-border">
          {MOCK_LEADERBOARD.slice(0, 3).map((entry, i) => (
            <div key={entry.player.id} className="flex items-center gap-3 p-3">
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                i === 0 ? 'bg-yellow-500/20 text-yellow-500' :
                i === 1 ? 'bg-slate-400/20 text-slate-400' :
                'bg-amber-600/20 text-amber-600'
              }`}>
                {entry.rank}
              </span>
              <span className="text-xl">{entry.player.avatar}</span>
              <div className="flex-1">
                <p className="text-sm font-semibold">{entry.player.name}</p>
                <p className="text-xs text-muted-foreground">{entry.wins}W / {entry.losses}L</p>
              </div>
              <span className="text-sm text-primary font-bold">+{entry.avgReturn}%</span>
            </div>
          ))}
        </Card>
      </motion.div>
      
      {/* Recent Activity */}
      <motion.div variants={itemVariants} className="mt-6">
        <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wide mb-3">Recent Activity</h3>
        <div className="space-y-3">
          {RECENT_ACTIVITY.slice(0, 4).map((activity, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="text-xl">{activity.icon}</span>
              <div className="flex-1">
                <p className="text-sm">{activity.text}</p>
                <p className="text-xs text-muted-foreground">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
      
      {/* Achievements Preview */}
      <motion.div variants={itemVariants} className="mt-6 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wide">Achievements</h3>
          <span className="text-xs text-muted-foreground">{user?.achievements?.length || 0} unlocked</span>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {user?.achievements?.slice(0, 5).map((achievement) => (
            <div 
              key={achievement.id}
              className="flex-shrink-0 w-16 h-16 rounded-xl bg-primary/10 flex flex-col items-center justify-center"
            >
              <span className="text-2xl">{achievement.icon}</span>
              <span className="text-[10px] text-muted-foreground mt-1 truncate w-full text-center px-1 font-medium">
                {achievement.name.split(' ')[0]}
              </span>
            </div>
          ))}
          <div className="flex-shrink-0 w-16 h-16 rounded-xl bg-secondary flex flex-col items-center justify-center border-2 border-dashed border-border">
            <Sparkles className="w-5 h-5 text-muted-foreground" />
            <span className="text-[10px] text-muted-foreground mt-1 font-medium">More</span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function StatCard({ 
  icon: Icon, 
  label, 
  value, 
  color 
}: { 
  icon: typeof TrendingUp; 
  label: string; 
  value: string; 
  color: string;
}) {
  return (
    <Card className="p-3 flex flex-col items-center">
      <Icon className={`w-4 h-4 ${color} mb-1`} />
      <span className="text-sm font-bold">{value}</span>
      <span className="text-[10px] text-muted-foreground font-medium">{label}</span>
    </Card>
  );
}

function ModeCard({ 
  icon: Icon, 
  title, 
  description, 
  gradient,
  onClick 
}: { 
  icon: typeof TrendingUp; 
  title: string; 
  description: string;
  gradient: string;
  onClick: () => void;
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`w-full p-4 rounded-xl bg-gradient-to-r ${gradient} border border-border/50 text-left`}
    >
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-background/50 flex items-center justify-center">
          <Icon className="w-6 h-6 text-foreground" />
        </div>
        <div className="flex-1">
          <p className="font-bold">{title}</p>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <ChevronRight className="w-5 h-5 text-muted-foreground" />
      </div>
    </motion.button>
  );
}
