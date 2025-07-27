"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CalendarIcon, Loader2, ArrowRight, ArrowLeft, Trophy, Users, Clock, Upload, X } from "lucide-react";
import { GroupMember } from "@/types/group";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useGroups } from "@/hooks/useGroups"; // Importando o hook

interface GyncanaCreationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groupMembers: GroupMember[];
  groupId: string;
}

export function GyncanaCreationModal({ open, onOpenChange, groupMembers, groupId }: GyncanaCreationModalProps) {
  const { createGyncana } = useGroups(); // Usando o hook
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isCreating, setIsCreating] = useState(false);

  // Step 1 state
  const [prizeDescription, setPrizeDescription] = useState("");
  const [prizeImage, setPrizeImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Step 2 state
  const [participantIds, setParticipantIds] = useState<string[]>([]);

  // Step 3 state
  const [startDate, setStartDate] = useState<Date | undefined>(new Date());
  const [endDate, setEndDate] = useState<Date | undefined>();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Imagem muito grande. Máximo 5MB.");
        return;
      }
      if (!file.type.startsWith("image/")) {
        toast.error("Por favor, selecione uma imagem.");
        return;
      }
      setPrizeImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };
  
  const handleNextStep = () => {
    if (step === 1 && !prizeDescription.trim()) {
      toast.error("A descrição do prêmio é obrigatória.");
      return;
    }
    if (step === 2 && participantIds.length < 2) {
      toast.error("Selecione pelo menos 2 participantes.");
      return;
    }
    setStep(s => s + 1);
  };

  const handlePrevStep = () => setStep(s => s - 1);

  const handleCreateGyncana = async () => {
    if (!startDate || !endDate) {
      toast.error("As datas de início e fim são obrigatórias.");
      return;
    }
    if (endDate <= startDate) {
      toast.error("A data de término deve ser posterior à data de início.");
      return;
    }

    setIsCreating(true);
    // Correção: Usando a função do hook
    const result = await createGyncana({
      groupId,
      prizeDescription,
      prizeImage: prizeImage || undefined,
      participantIds,
      startDate,
      endDate,
    });

    if (result.success) {
      toast.success("Gincana criada com sucesso!");
      onOpenChange(false);
      // router.refresh() não é mais necessário aqui, o hook cuida da atualização do estado.
    } else {
      toast.error(result.error || "Falha ao criar gincana.");
    }
    setIsCreating(false);
  };

  const toggleParticipant = (userId: string) => {
    setParticipantIds(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const selectAllParticipants = () => {
    if (participantIds.length === groupMembers.length) {
      setParticipantIds([]);
    } else {
      setParticipantIds(groupMembers.map(m => m.usuario_id));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-card max-w-md mx-4 max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Criar Nova Gincana</DialogTitle>
          <DialogDescription>
            Configure uma competição para seu grupo. Passo {step} de 3.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-1">
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="prize">Prêmio da Gincana*</Label>
                <Textarea id="prize" placeholder="Ex: 1 Pote de Whey Protein" value={prizeDescription} onChange={e => setPrizeDescription(e.target.value)} className="glass" />
              </div>
              <div className="space-y-2">
                <Label>Imagem do Prêmio (Opcional)</Label>
                <div className="flex items-center space-x-4">
                    <Avatar className="h-20 w-20 rounded-md">
                        <AvatarImage src={previewUrl || "/placeholder-logo.png"} className="object-cover" />
                        <AvatarFallback><Trophy/></AvatarFallback>
                    </Avatar>
                    <div className="space-y-2">
                        <Button type="button" variant="outline" size="sm" className="glass" onClick={() => document.getElementById('prize-image-upload')?.click()}>
                            <Upload className="h-4 w-4 mr-2" /> Carregar
                        </Button>
                        {prizeImage && <Button type="button" variant="ghost" size="sm" onClick={() => {setPrizeImage(null); setPreviewUrl(null)}}><X className="h-4 w-4 mr-2"/>Remover</Button>}
                        <input type="file" id="prize-image-upload" className="hidden" accept="image/*" onChange={handleFileChange} />
                    </div>
                </div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
               <div>
                <div className="flex items-center justify-between mb-2">
                    <Label>Participantes</Label>
                    <Button variant="link" size="sm" onClick={selectAllParticipants}>
                        {participantIds.length === groupMembers.length ? 'Desmarcar Todos' : 'Marcar Todos'}
                    </Button>
                </div>
                 <ScrollArea className="h-64 border rounded-md p-2 glass">
                    <div className="space-y-2">
                        {groupMembers.map(member => (
                            <div key={member.usuario_id} className="flex items-center space-x-3 p-2 rounded-md hover:bg-white/10" onClick={() => toggleParticipant(member.usuario_id)}>
                                <Checkbox checked={participantIds.includes(member.usuario_id)} id={`member-${member.usuario_id}`}/>
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={member.usuario?.avatar_url || ""} />
                                    <AvatarFallback>{member.usuario?.nome.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <label htmlFor={`member-${member.usuario_id}`} className="font-medium text-sm">{member.usuario?.nome}</label>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
                <p className="text-xs text-muted-foreground mt-2">{participantIds.length} selecionado(s)</p>
               </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Data de Início</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" className="w-full justify-start text-left font-normal glass">
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {startDate ? format(startDate, "dd/MM/yyyy") : <span>Escolha uma data</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0 glass-card">
                                <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus locale={ptBR}/>
                            </PopoverContent>
                        </Popover>
                    </div>
                    <div className="space-y-2">
                        <Label>Data de Término</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" className="w-full justify-start text-left font-normal glass">
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {endDate ? format(endDate, "dd/MM/yyyy") : <span>Escolha uma data</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0 glass-card">
                                <Calendar mode="single" selected={endDate} onSelect={setEndDate} disabled={{ before: startDate || new Date() }} initialFocus locale={ptBR}/>
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>
            </motion.div>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row sm:space-x-2">
          {step > 1 && <Button variant="ghost" onClick={handlePrevStep} className="glass"><ArrowLeft className="h-4 w-4 mr-2"/> Voltar</Button>}
          {step < 3 && <Button onClick={handleNextStep} className="glass w-full sm:w-auto ml-auto">Próximo <ArrowRight className="h-4 w-4 ml-2"/></Button>}
          {step === 3 && <Button onClick={handleCreateGyncana} disabled={isCreating} className="w-full sm:w-auto glass">{isCreating ? <Loader2 className="h-4 w-4 mr-2 animate-spin"/> : <Trophy className="h-4 w-4 mr-2"/>} Criar Gincana</Button>}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}