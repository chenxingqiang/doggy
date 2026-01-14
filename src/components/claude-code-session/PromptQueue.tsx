import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, Sparkles, Zap, Bot, Cloud, Brain, Gem, Rocket, Cpu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export interface QueuedPrompt {
  id: string;
  prompt: string;
  model: string; // Now supports gateway models like "openai:gpt-4" etc.
}

interface PromptQueueProps {
  queuedPrompts: QueuedPrompt[];
  onRemove: (id: string) => void;
  className?: string;
}

// Helper to get model display info
const getModelInfo = (model: string) => {
  // Check if it's a gateway model (format: "provider:model")
  if (model.includes(':')) {
    const [provider, modelId] = model.split(':');
    const providerIcons: Record<string, React.ReactNode> = {
      openai: <Bot className="h-3.5 w-3.5 text-green-500" />,
      gemini: <Gem className="h-3.5 w-3.5 text-blue-400" />,
      deepseek: <Cloud className="h-3.5 w-3.5 text-blue-500" />,
      moonshot: <Sparkles className="h-3.5 w-3.5 text-purple-500" />,
      qwen: <Cloud className="h-3.5 w-3.5 text-orange-500" />,
      zhipu: <Brain className="h-3.5 w-3.5 text-cyan-500" />,
      groq: <Rocket className="h-3.5 w-3.5 text-red-500" />,
      ollama: <Cpu className="h-3.5 w-3.5 text-green-400" />,
    };
    return {
      icon: providerIcons[provider] || <Bot className="h-3.5 w-3.5 text-gray-500" />,
      name: `${provider}/${modelId}`,
      isGateway: true
    };
  }
  
  // Default Claude models
  if (model === 'opus') {
    return {
      icon: <Sparkles className="h-3.5 w-3.5 text-purple-500" />,
      name: 'Opus',
      isGateway: false
    };
  }
  
  return {
    icon: <Zap className="h-3.5 w-3.5 text-amber-500" />,
    name: 'Sonnet',
    isGateway: false
  };
};

export const PromptQueue: React.FC<PromptQueueProps> = React.memo(({
  queuedPrompts,
  onRemove,
  className
}) => {
  if (queuedPrompts.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className={cn("border-t bg-muted/20", className)}
    >
      <div className="px-4 py-3">
        <div className="flex items-center gap-2 mb-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Queued Prompts</span>
          <Badge variant="secondary" className="text-xs">
            {queuedPrompts.length}
          </Badge>
        </div>
        
        <div className="space-y-2 max-h-32 overflow-y-auto">
          <AnimatePresence mode="popLayout">
            {queuedPrompts.map((queuedPrompt, index) => {
              const modelInfo = getModelInfo(queuedPrompt.model);
              
              return (
                <motion.div
                  key={queuedPrompt.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-start gap-2 p-2 rounded-md bg-background/50"
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {modelInfo.icon}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">{queuedPrompt.prompt}</p>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      {modelInfo.name}
                      {modelInfo.isGateway && (
                        <span className="text-[9px] px-1 py-0.5 rounded bg-secondary/30 text-secondary">
                          Gateway
                        </span>
                      )}
                    </span>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 flex-shrink-0"
                    onClick={() => onRemove(queuedPrompt.id)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
});
