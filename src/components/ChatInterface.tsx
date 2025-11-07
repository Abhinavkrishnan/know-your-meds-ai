import { useState } from "react";
import { Search, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Alert, AlertDescription } from "./ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Message {
  type: 'user' | 'assistant' | 'safety';
  content: string;
  kb_match?: string;
}

const ChatInterface = () => {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) return;
    
    const userMessage = query.trim();
    setQuery("");
    setMessages(prev => [...prev, { type: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('medical-chat', {
        body: { query: userMessage }
      });

      if (error) throw error;

      if (data.error) {
        toast({
          title: "Error",
          description: data.error,
          variant: "destructive"
        });
        return;
      }

      const messageType = data.safe ? 'assistant' : 'safety';
      setMessages(prev => [...prev, { 
        type: messageType, 
        content: data.response,
        kb_match: data.kb_match 
      }]);

    } catch (error) {
      console.error('Error calling medical-chat:', error);
      toast({
        title: "Error",
        description: "Failed to get response. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="py-16 px-6">
      <div className="container mx-auto max-w-4xl">
        <div className="space-y-8">
          {/* Input Section */}
          <div className="bg-card rounded-2xl shadow-card p-8 border border-border">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <Textarea
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Ask about any disease or health condition... (e.g., 'What is diabetes?' or 'Tell me about hypertension')"
                  className="min-h-[120px] text-lg resize-none pr-12 bg-background border-input focus:ring-2 focus:ring-primary"
                  disabled={isLoading}
                />
                <Search className="absolute right-4 top-4 w-5 h-5 text-muted-foreground" />
              </div>
              
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Educational information only. Not medical advice.
                </p>
                <Button 
                  type="submit" 
                  size="lg" 
                  disabled={isLoading || !query.trim()}
                  className="px-8"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing
                    </>
                  ) : (
                    'Get Information'
                  )}
                </Button>
              </div>
            </form>
          </div>

          {/* Messages Section */}
          {messages.length > 0 && (
            <div className="space-y-6">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`rounded-2xl p-6 ${
                    message.type === 'user'
                      ? 'bg-primary/5 border border-primary/20 ml-8'
                      : message.type === 'safety'
                      ? 'bg-destructive/5 border border-destructive/20 mr-8'
                      : 'bg-gradient-card border border-border shadow-soft mr-8'
                  }`}
                >
                  {message.type === 'user' ? (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-primary">Your Question</p>
                      <p className="text-foreground leading-relaxed">{message.content}</p>
                    </div>
                  ) : message.type === 'safety' ? (
                    <Alert variant="destructive" className="border-0 bg-transparent p-0">
                      <AlertCircle className="h-5 w-5" />
                      <AlertDescription className="text-base leading-relaxed">
                        {message.content}
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <div className="space-y-4">
                      {message.kb_match && (
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-medical-sage-light text-medical-sage text-xs font-medium">
                          Knowledge Base: {message.kb_match.charAt(0).toUpperCase() + message.kb_match.slice(1)}
                        </div>
                      )}
                      <div className="prose prose-lg max-w-none">
                        <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                          {message.content}
                        </p>
                      </div>
                      <div className="pt-4 border-t border-border">
                        <Alert className="bg-medical-warm border-accent">
                          <AlertCircle className="h-4 w-4 text-medical-neutral" />
                          <AlertDescription className="text-sm text-medical-neutral">
                            <strong>Medical Disclaimer:</strong> This information is for educational purposes only. 
                            Always consult qualified healthcare professionals for medical advice, diagnosis, or treatment.
                          </AlertDescription>
                        </Alert>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Example Queries */}
          {messages.length === 0 && (
            <div className="bg-medical-warm rounded-2xl p-8 border border-accent">
              <h3 className="text-lg font-semibold text-foreground mb-4">Example Questions:</h3>
              <div className="grid gap-3">
                {[
                  "What is diabetes and what are its symptoms?",
                  "Tell me about hypertension prevention",
                  "What causes asthma and how common is it?"
                ].map((example, index) => (
                  <button
                    key={index}
                    onClick={() => setQuery(example)}
                    className="text-left px-4 py-3 rounded-lg bg-card hover:bg-secondary transition-colors border border-border text-sm text-foreground hover:border-primary"
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ChatInterface;
