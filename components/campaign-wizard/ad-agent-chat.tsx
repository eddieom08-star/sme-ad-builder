'use client';

import { useState, useRef, useEffect } from 'react';
import { useWizardStore } from '@/lib/stores/wizard-store';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Sparkles,
  Send,
  Loader2,
  User,
  Lightbulb,
  TrendingUp,
  Target,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  suggestions?: string[];
}

const SUGGESTED_PROMPTS = [
  {
    icon: Lightbulb,
    text: 'Help me write compelling ad copy for a B2B SaaS product',
    category: 'Creative',
  },
  {
    icon: Target,
    text: 'What targeting options would work best for my campaign?',
    category: 'Targeting',
  },
  {
    icon: TrendingUp,
    text: 'Suggest budget allocation across platforms',
    category: 'Budget',
  },
  {
    icon: Zap,
    text: 'Generate 3 ad headline variations',
    category: 'Creative',
  },
];

export function AdAgentChat({ className }: { className?: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const {
    campaignName,
    objective,
    platforms,
    targeting,
    budgetAmount,
    budgetType,
    ads,
  } = useWizardStore();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (content: string = input) => {
    if (!content.trim() || isLoading) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Simulate AI response with context awareness
    setTimeout(() => {
      const response = generateAIResponse(content, {
        campaignName,
        objective,
        platforms,
        targeting,
        budgetAmount,
        budgetType,
        ads,
      });

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: response.content,
        timestamp: new Date(),
        suggestions: response.suggestions,
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1500);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className={cn('flex flex-col h-full bg-card', className)}>
      {/* Header */}
      <div className="border-b px-4 py-3 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              AI Ad Agent
              <Badge variant="secondary" className="text-xs">Beta</Badge>
            </h3>
            <p className="text-xs text-muted-foreground">
              Your intelligent campaign assistant
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center">
            <div className="max-w-md space-y-6">
              {/* Welcome Message */}
              <div className="text-center space-y-2">
                <div className="h-16 w-16 mx-auto rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                  <Sparkles className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-semibold text-lg">Welcome to AI Ad Agent</h3>
                <p className="text-sm text-muted-foreground">
                  I can help you create compelling campaigns, optimize targeting, suggest
                  copy improvements, and more. Try asking me something!
                </p>
              </div>

              {/* Suggested Prompts */}
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground text-center">
                  Suggested prompts:
                </p>
                <div className="grid gap-2">
                  {SUGGESTED_PROMPTS.map((prompt, index) => {
                    const Icon = prompt.icon;
                    return (
                      <Button
                        key={index}
                        variant="outline"
                        className="justify-start h-auto py-3 px-4 text-left"
                        onClick={() => handleSendMessage(prompt.text)}
                      >
                        <Icon className="h-4 w-4 mr-3 shrink-0 text-primary" />
                        <div className="flex-1">
                          <div className="text-sm">{prompt.text}</div>
                          <Badge variant="secondary" className="text-xs mt-1">
                            {prompt.category}
                          </Badge>
                        </div>
                      </Button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              'flex gap-3',
              message.role === 'user' ? 'justify-end' : 'justify-start'
            )}
          >
            {message.role === 'assistant' && (
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500">
                  <Sparkles className="h-4 w-4 text-white" />
                </AvatarFallback>
              </Avatar>
            )}

            <div className={cn(
              'max-w-[80%] space-y-2',
              message.role === 'user' && 'flex flex-col items-end'
            )}>
              <Card className={cn(
                message.role === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted'
              )}>
                <CardContent className="p-3">
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </CardContent>
              </Card>

              {/* Suggestions */}
              {message.suggestions && message.suggestions.length > 0 && (
                <div className="space-y-2 w-full">
                  <p className="text-xs text-muted-foreground">Quick actions:</p>
                  <div className="flex flex-wrap gap-2">
                    {message.suggestions.map((suggestion, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        className="text-xs h-7"
                        onClick={() => handleSendMessage(suggestion)}
                      >
                        {suggestion}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              <p className="text-xs text-muted-foreground">
                {message.timestamp.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>

            {message.role === 'user' && (
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarFallback className="bg-primary">
                  <User className="h-4 w-4 text-primary-foreground" />
                </AvatarFallback>
              </Avatar>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3 justify-start">
            <Avatar className="h-8 w-8 shrink-0">
              <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500">
                <Sparkles className="h-4 w-4 text-white" />
              </AvatarFallback>
            </Avatar>
            <Card className="bg-muted">
              <CardContent className="p-3 flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <p className="text-sm text-muted-foreground">Thinking...</p>
              </CardContent>
            </Card>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t p-4 bg-muted/30">
        <div className="flex gap-2">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask me anything about your campaign..."
            className="min-h-[80px] resize-none"
            disabled={isLoading}
          />
          <Button
            onClick={() => handleSendMessage()}
            disabled={!input.trim() || isLoading}
            size="icon"
            className="h-20 w-12 shrink-0"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}

// AI Response Generator (Mock - replace with actual API call)
function generateAIResponse(
  userMessage: string,
  context: any
): { content: string; suggestions?: string[] } {
  const message = userMessage.toLowerCase();

  // Context-aware responses
  if (message.includes('headline') || message.includes('copy')) {
    return {
      content: `Based on your ${context.objective} objective and targeting ${context.platforms.join(', ')}, here are some compelling headline options:

1. "${context.campaignName || 'Transform Your Business'} - Start Your Free Trial Today"
2. "Join ${context.budgetType === 'daily' ? 'Thousands' : 'Industry Leaders'} Already Using ${context.campaignName || 'Our Solution'}"
3. "Get Results in 30 Days or Your Money Back"

These headlines are optimized for ${context.platforms[0] || 'your selected platform'} and align with your conversion-focused objective.`,
      suggestions: ['Refine first headline', 'Generate more variations', 'Optimize for mobile'],
    };
  }

  if (message.includes('targeting') || message.includes('audience')) {
    return {
      content: `Based on your campaign setup, I recommend the following targeting strategy:

**Current Setup:**
- Age Range: ${context.targeting.ageMin}-${context.targeting.ageMax}
- Locations: ${context.targeting.locations.length} selected
- Platforms: ${context.platforms.join(', ')}

**Recommendations:**
1. Consider adding interest-based targeting for better precision
2. Use lookalike audiences if you have existing customer data
3. Test A/B split campaigns with different age segments

Your current budget of $${context.budgetAmount}/${context.budgetType} should be sufficient for this targeting scope.`,
      suggestions: ['Add interests', 'Review budget allocation', 'Suggest lookalike audiences'],
    };
  }

  if (message.includes('budget')) {
    return {
      content: `For your ${context.budgetType} budget of $${context.budgetAmount}, here's my recommendation:

**Allocation across platforms:**
${context.platforms.map((p: string, i: number) => `- ${p.charAt(0).toUpperCase() + p.slice(1)}: ${Math.round((100 / context.platforms.length))}%`).join('\n')}

**Optimization tips:**
- Start with even distribution to gather data
- After 3-7 days, shift budget to top-performing platforms
- Set bid caps to avoid overspending on expensive clicks
- Monitor ROAS daily for the first week

Would you like me to suggest specific bid strategies?`,
      suggestions: ['Optimize bid strategy', 'Review platform performance', 'Increase budget'],
    };
  }

  // Default helpful response
  return {
    content: `I'm here to help with your ${context.campaignName || 'campaign'}! I can assist with:

- Creating compelling ad copy and headlines
- Optimizing your targeting strategy
- Budgetallocation recommendations
- Platform-specific best practices
- A/B testing suggestions

What would you like to focus on?`,
    suggestions: ['Write ad copy', 'Optimize targeting', 'Review budget'],
  };
}
