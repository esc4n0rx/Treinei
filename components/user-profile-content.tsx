// components/user-profile-content.tsx
"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useUserProfile } from "@/hooks/useUserProfile";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, User as UserIcon } from "lucide-react";
import { DayPicker, DayProps } from "react-day-picker";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

type CheckinMap = Map<string, { foto_url: string }>;

const toISODateString = (date: Date) => {
  return date.toISOString().split("T")[0];
};

function CustomDay(props: DayProps & { checkins: CheckinMap }) {
  const { date, checkins } = props;
  const dayKey = toISODateString(date);
  const checkin = checkins.get(dayKey);

  if (checkin) {
    return (
      <div className="relative w-full h-full rounded-md overflow-hidden ring-2 ring-primary/50">
        <img
          src={checkin.foto_url}
          alt={`Check-in em ${dayKey}`}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="relative flex items-center justify-center h-full text-white font-bold text-sm bg-black/30">
          {date.getDate()}
        </div>
      </div>
    );
  }

  // O componente DayPicker espera que retornemos seus filhos para renderização padrão
  return <div {...props.children?.props} />;
}

export function UserProfileContent({ userId }: { userId: string }) {
  const router = useRouter();
  const { profile, loading, error } = useUserProfile(userId);

  const { months, checkinsByDay } = useMemo(() => {
    if (!profile?.checkins || profile.checkins.length === 0) {
      return { months: [new Date()], checkinsByDay: new Map() };
    }

    const checkinsByDay = new Map<string, { foto_url: string }>();
    profile.checkins.forEach((c) => {
      const dayKey = toISODateString(new Date(c.data_checkin));
      if (!checkinsByDay.has(dayKey)) {
        checkinsByDay.set(dayKey, { foto_url: c.foto_url });
      }
    });

    const dates = profile.checkins.map((c) => new Date(c.data_checkin));
    const firstCheckin = dates.reduce((a, b) => (a < b ? a : b));
    const lastCheckin = new Date();

    const monthList: Date[] = [];
    let currentMonth = new Date(lastCheckin.getFullYear(), lastCheckin.getMonth(), 1);
    const firstMonth = new Date(firstCheckin.getFullYear(), firstCheckin.getMonth(), 1);

    while (currentMonth >= firstMonth) {
      monthList.push(new Date(currentMonth));
      currentMonth.setMonth(currentMonth.getMonth() - 1);
    }
    
    return { months: monthList, checkinsByDay };
  }, [profile?.checkins]);

  if (loading) {
    return (
      <div className="p-4 space-y-4">
        <div className="flex items-center space-x-4">
          <Skeleton className="h-9 w-9" />
          <Skeleton className="h-8 w-32" />
        </div>
        <div className="flex items-center space-x-4">
          <Skeleton className="h-20 w-20 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
        <Skeleton className="h-80 w-full" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="p-4 flex flex-col items-center justify-center h-[80vh]">
        <UserIcon className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold">Usuário não encontrado</h2>
        <p className="text-muted-foreground mb-4">{error}</p>
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
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}>
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
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="grid grid-cols-3 gap-2 text-center">
            <Card className="glass-card p-3">
              <p className="text-2xl font-bold text-primary">{profile.checkins_totais}</p>
              <p className="text-xs text-muted-foreground">Check-ins</p>
            </Card>
            <Card className="glass-card p-3">
              <p className="text-2xl font-bold text-green-500">{profile.dias_ativos}</p>
              <p className="text-xs text-muted-foreground">Dias ativos</p>
            </Card>
            <Card className="glass-card p-3">
              <p className="text-2xl font-bold text-purple-500">{profile.melhor_streak}</p>
              <p className="text-xs text-muted-foreground">Melhor Streak</p>
            </Card>
          </div>
        </motion.div>

        {/* Calendar */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="glass-card">
            <CardContent className="p-2 sm:p-4">
              <Carousel
                opts={{
                  align: "start",
                }}
                className="w-full"
              >
                <CarouselContent>
                  {months.map((month) => (
                    <CarouselItem key={month.toISOString()}>
                      <Calendar
                        month={month}
                        components={{
                          Day: (dayProps:any) => (
                            <CustomDay {...dayProps} checkins={checkinsByDay} />
                          ),
                        }}
                        className="p-0"
                        classNames={{
                          head_cell: "w-10 sm:w-12",
                          cell: "w-10 h-10 sm:w-12 sm:h-12",
                        }}
                      />
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="ml-8" />
                <CarouselNext className="mr-8" />
              </Carousel>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}