"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useUserProfile } from "@/hooks/useUserProfile";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowLeft, User as UserIcon, ChevronLeft, ChevronRight } from "lucide-react";

type CheckinMap = Map<string, { foto_url: string; id: string }>;

const toISODateString = (date: Date) => {
  return date.toISOString().split("T")[0];
};

const monthNames = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

const dayNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

interface CalendarProps {
  currentDate: Date;
  checkins: CheckinMap;
  onDateClick: (date: Date, checkin: { foto_url: string; id: string } | undefined) => void;
}

function Calendar({ currentDate, checkins, onDateClick }: CalendarProps) {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  
  const firstDayOfWeek = firstDay.getDay();
  
  const daysInMonth = lastDay.getDate();
  
  const calendarDays = [];
  
  for (let i = 0; i < firstDayOfWeek; i++) {
    const emptyDate = new Date(year, month, -firstDayOfWeek + i + 1);
    calendarDays.push({ date: emptyDate, isCurrentMonth: false });
  }
  
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    calendarDays.push({ date, isCurrentMonth: true });
  }

  const totalCells = Math.ceil(calendarDays.length / 7) * 7;
  let nextMonthDay = 1;
  for (let i = calendarDays.length; i < totalCells; i++) {
    const nextDate = new Date(year, month + 1, nextMonthDay);
    calendarDays.push({ date: nextDate, isCurrentMonth: false });
    nextMonthDay++;
  }

  return (
    <div className="w-full">
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map((day) => (
          <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
            {day}
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map(({ date, isCurrentMonth }, index) => {
          const dayKey = toISODateString(date);
          const checkin = checkins.get(dayKey);
          const isToday = toISODateString(new Date()) === dayKey;
          
          return (
            <motion.div
              key={index}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`
                aspect-square relative rounded-lg overflow-hidden cursor-pointer
                ${!isCurrentMonth ? 'opacity-30' : ''}
                ${isToday ? 'ring-2 ring-primary' : ''}
                ${checkin ? 'ring-2 ring-primary/50' : 'glass hover:bg-white/10'}
              `}
              onClick={() => onDateClick(date, checkin)}
            >
              {checkin ? (
                <>
                  <img
                    src={checkin.foto_url}
                    alt={`Check-in em ${dayKey}`}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <span className="text-white font-bold text-sm drop-shadow-lg">
                      {date.getDate()}
                    </span>
                  </div>
                </>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className={`text-sm font-medium ${isCurrentMonth ? '' : 'text-muted-foreground'}`}>
                    {date.getDate()}
                  </span>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

export function UserProfileContent({ userId }: { userId: string }) {
  const router = useRouter();
  const { profile, loading, error } = useUserProfile(userId);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedPhoto, setSelectedPhoto] = useState<{
    url: string;
    date: string;
  } | null>(null);

  const checkinsByDay = useMemo(() => {
    if (!profile?.checkins || profile.checkins.length === 0) {
      return new Map();
    }

    const checkinMap = new Map<string, { foto_url: string; id: string }>();
    profile.checkins.forEach((checkin) => {
      const dayKey = toISODateString(new Date(checkin.data_checkin));
      if (!checkinMap.has(dayKey)) {
        checkinMap.set(dayKey, { foto_url: checkin.foto_url, id: checkin.id });
      }
    });

    return checkinMap;
  }, [profile?.checkins]);

  const handleDateClick = (date: Date, checkin: { foto_url: string; id: string } | undefined) => {
    if (checkin) {
      setSelectedPhoto({
        url: checkin.foto_url,
        date: date.toLocaleDateString('pt-BR', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      });
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="sticky top-0 z-40 glass-card border-b p-4">
          <div className="flex items-center space-x-3">
            <Skeleton className="h-9 w-9 rounded-lg" />
            <Skeleton className="h-8 w-32" />
          </div>
        </div>
        <div className="p-4 space-y-6">
          <div className="flex items-center space-x-4">
            <Skeleton className="h-20 w-20 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Skeleton className="h-20 w-full rounded-lg" />
            <Skeleton className="h-20 w-full rounded-lg" />
            <Skeleton className="h-20 w-full rounded-lg" />
          </div>
          <Skeleton className="h-96 w-full rounded-lg" />
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <UserIcon className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">Usuário não encontrado</h2>
        <p className="text-muted-foreground mb-4 text-center">{error}</p>
        <Button onClick={() => router.back()} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-40 glass-card border-b p-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center space-x-3"
        >
          <Button onClick={() => router.back()} variant="ghost" size="sm" className="glass hover:bg-white/10">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-lg font-bold truncate">{profile.nome}</h1>
        </motion.div>
      </div>

      {/* Content */}
      <div className="p-4 pb-20 space-y-6">
        {/* Profile Header */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} 
          animate={{ opacity: 1, scale: 1 }} 
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center space-x-4">
            <Avatar className="h-20 w-20 ring-4 ring-primary/20">
              <AvatarImage src={profile.avatar_url || ""} />
              <AvatarFallback className="text-2xl">
                {profile.nome.split(" ").map((n) => n[0]).join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-2xl font-bold">{profile.nome}</h2>
              <p className="text-muted-foreground">
                Membro desde{" "}
                {new Date(profile.data_cadastro).toLocaleDateString("pt-BR", {
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.2 }}
        >
          <div className="grid grid-cols-3 gap-3">
            <Card className="glass-card p-4 text-center">
              <CardContent className="p-0">
                <p className="text-2xl font-bold text-primary">{profile.checkins_totais}</p>
                <p className="text-xs text-muted-foreground">Check-ins</p>
              </CardContent>
            </Card>
            
            <Card className="glass-card p-4 text-center">
              <CardContent className="p-0">
                <p className="text-2xl font-bold text-purple-500">{profile.dias_ativos || 0}</p>
                <p className="text-xs text-muted-foreground">Dias ativos</p>
              </CardContent>
            </Card>
            
            <Card className="glass-card p-4 text-center">
              <CardContent className="p-0">
                <p className="text-2xl font-bold text-green-500">{profile.melhor_streak}</p>
                <p className="text-xs text-muted-foreground">Melhor Streak</p>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Calendar */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.3 }}
        >
          <Card className="glass-card p-4">
            <CardContent className="p-0 space-y-4">
              {/* Calendar Header */}
              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigateMonth('prev')}
                  className="glass hover:bg-white/10"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                <h3 className="text-lg font-semibold">
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h3>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigateMonth('next')}
                  className="glass hover:bg-white/10"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              {/* Calendar Grid */}
              <Calendar
                currentDate={currentDate}
                checkins={checkinsByDay}
                onDateClick={handleDateClick}
              />
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Photo Modal */}
      <Dialog open={!!selectedPhoto} onOpenChange={() => setSelectedPhoto(null)}>
        <DialogContent className="glass-card max-w-md mx-4 p-4">
          <DialogHeader>
            <DialogTitle className="text-center">
              Check-in de {selectedPhoto?.date}
            </DialogTitle>
          </DialogHeader>
          
          {selectedPhoto && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-4"
            >
              <div className="aspect-square rounded-lg overflow-hidden">
                <img
                  src={selectedPhoto.url}
                  alt={`Check-in de ${selectedPhoto.date}`}
                  className="w-full h-full object-cover"
                />
              </div>
            </motion.div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}