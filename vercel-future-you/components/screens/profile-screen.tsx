"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  User,
  Trophy,
  Target,
  Flame,
  Medal,
  Star,
  Shield,
  TrendingUp,
  Zap,
  Settings,
  ChevronRight,
  Award,
  Calendar,
  DollarSign,
  BarChart3,
  Info,
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import { ACHIEVEMENTS, RISK_PROFILES } from "@/data/mock-data";
import { formatCurrency } from "@/lib/calculations";

export function ProfileScreen() {
  const { user } = useAppStore();

  const riskProfileData = RISK_PROFILES.find((p) => p.id === user.riskProfile);
  const unlockedAchievements = ACHIEVEMENTS.filter((a) =>
    user.achievements.includes(a.id)
  );
  const lockedAchievements = ACHIEVEMENTS.filter(
    (a) => !user.achievements.includes(a.id)
  );

  const xpForNextLevel = 1000;
  const currentXp = user.xp % xpForNextLevel;
  const currentLevel = Math.floor(user.xp / xpForNextLevel) + 1;

  return (
    <div className="flex flex-col gap-4 pb-4">
      {/* Profile Header */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/10 to-transparent">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/20">
              <User className="h-10 w-10 text-primary" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold">{user.name}</h2>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="border-primary/50 text-primary">
                  <Trophy className="mr-1 h-3 w-3" />
                  Rank #{user.rank}
                </Badge>
                <Badge variant="outline">
                  <Star className="mr-1 h-3 w-3" />
                  {user.tier}
                </Badge>
              </div>
              <div className="mt-3">
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Level {currentLevel}</span>
                  <span className="text-primary">
                    {currentXp}/{xpForNextLevel} XP
                  </span>
                </div>
                <Progress value={(currentXp / xpForNextLevel) * 100} className="h-2" />
              </div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-3">
            <div className="rounded-xl bg-background/50 p-3 text-center">
              <Flame className="mx-auto h-5 w-5 text-chart-5" />
              <p className="mt-1 text-xl font-bold">{user.streak}</p>
              <p className="text-xs text-muted-foreground">Day Streak</p>
            </div>
            <div className="rounded-xl bg-background/50 p-3 text-center">
              <Medal className="mx-auto h-5 w-5 text-chart-3" />
              <p className="mt-1 text-xl font-bold">{user.achievements.length}</p>
              <p className="text-xs text-muted-foreground">Achievements</p>
            </div>
            <div className="rounded-xl bg-background/50 p-3 text-center">
              <Zap className="mx-auto h-5 w-5 text-primary" />
              <p className="mt-1 text-xl font-bold">{user.eloScore}</p>
              <p className="text-xs text-muted-foreground">ELO Score</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Investment Profile */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <BarChart3 className="h-5 w-5 text-primary" />
            Investment Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Age</p>
                <p className="text-xs text-muted-foreground">Years old</p>
              </div>
            </div>
            <p className="text-lg font-bold">{user.age}</p>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <DollarSign className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Monthly Contribution</p>
                <p className="text-xs text-muted-foreground">Investment amount</p>
              </div>
            </div>
            <p className="text-lg font-bold text-primary">
              {formatCurrency(user.monthlyContribution)}
            </p>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Target className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Current Goal</p>
                <p className="text-xs text-muted-foreground">
                  {formatCurrency(user.currentGoal?.targetAmount || 0)}
                </p>
              </div>
            </div>
            <Badge variant="secondary">{user.currentGoal?.name || "Not set"}</Badge>
          </div>

          <Separator />

          {riskProfileData && (
            <div className="rounded-xl bg-secondary/50 p-4">
              <div className="flex items-center gap-3">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-xl"
                  style={{ backgroundColor: `${riskProfileData.color}20` }}
                >
                  <Shield className="h-5 w-5" style={{ color: riskProfileData.color }} />
                </div>
                <div className="flex-1">
                  <p className="font-medium">{riskProfileData.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {riskProfileData.description}
                  </p>
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                {riskProfileData.allocation.map((alloc) => (
                  <Badge key={alloc.asset} variant="outline" className="text-xs">
                    {alloc.asset}: {alloc.percentage}%
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Award className="h-5 w-5 text-chart-3" />
              Achievements
            </CardTitle>
            <Badge variant="secondary">
              {unlockedAchievements.length}/{ACHIEVEMENTS.length}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Unlocked */}
          {unlockedAchievements.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Unlocked</p>
              <div className="grid grid-cols-2 gap-2">
                {unlockedAchievements.map((achievement, index) => (
                  <motion.div
                    key={achievement.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center gap-3 rounded-xl bg-primary/10 p-3"
                  >
                    <span className="text-2xl">{achievement.icon}</span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{achievement.name}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        +{achievement.xp} XP
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Locked */}
          {lockedAchievements.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Locked</p>
              <div className="grid grid-cols-2 gap-2">
                {lockedAchievements.slice(0, 4).map((achievement) => (
                  <div
                    key={achievement.id}
                    className="flex items-center gap-3 rounded-xl bg-secondary/50 p-3 opacity-60"
                  >
                    <span className="text-2xl grayscale">{achievement.icon}</span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{achievement.name}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {achievement.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Results */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="h-5 w-5 text-primary" />
            Recent Simulations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {user.simulationHistory.length > 0 ? (
            user.simulationHistory.slice(0, 3).map((sim, index) => (
              <div
                key={index}
                className="flex items-center justify-between rounded-xl bg-secondary/50 p-3"
              >
                <div>
                  <p className="font-medium">{sim.type} Simulation</p>
                  <p className="text-xs text-muted-foreground">
                    {sim.duration} years | {new Date(sim.date).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-primary">
                    {formatCurrency(sim.finalValue)}
                  </p>
                  <Badge
                    variant={sim.return >= 0 ? "default" : "destructive"}
                    className="text-xs"
                  >
                    {sim.return >= 0 ? "+" : ""}
                    {sim.return.toFixed(1)}%
                  </Badge>
                </div>
              </div>
            ))
          ) : (
            <div className="py-6 text-center">
              <BarChart3 className="mx-auto h-10 w-10 text-muted-foreground/50" />
              <p className="mt-2 text-muted-foreground">No simulations yet</p>
              <p className="text-sm text-muted-foreground">
                Run your first simulation to see results here
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Settings & Info */}
      <Card>
        <CardContent className="p-2">
          <Button variant="ghost" className="w-full justify-between">
            <div className="flex items-center gap-3">
              <Settings className="h-5 w-5" />
              <span>Settings</span>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </Button>
          <Button variant="ghost" className="w-full justify-between">
            <div className="flex items-center gap-3">
              <Info className="h-5 w-5" />
              <span>About Future You Simulator</span>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </Button>
        </CardContent>
      </Card>

      {/* Educational Disclaimer */}
      <p className="text-center text-xs text-muted-foreground">
        For educational purposes only. Not financial advice.
      </p>
    </div>
  );
}
