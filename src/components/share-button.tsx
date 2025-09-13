'use client';

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { Share2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useState } from 'react';

export function ShareButton({ surveyId }: { surveyId: string }) {
  const [shareUrl, setShareUrl] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    setShareUrl(`${window.location.origin}/surveys/${surveyId}/take`);
  }, [surveyId]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    toast({
      title: 'Copied to clipboard!',
      description: 'The survey link has been copied.',
    });
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline" onClick={copyToClipboard}>
            <Share2 className="mr-2 h-4 w-4" /> Share Survey
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Copy survey link to clipboard</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
