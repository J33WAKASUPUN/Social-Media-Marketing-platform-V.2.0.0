import { Moon, Sun, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="relative border">
          <Sun className={cn(
            "h-5 w-5 transition-all",
            resolvedTheme === 'dark' ? "scale-0 rotate-90" : "scale-100 rotate-0"
          )} />
          <Moon className={cn(
            "absolute h-5 w-5 transition-all",
            resolvedTheme === 'dark' ? "scale-100 rotate-0" : "scale-0 -rotate-90"
          )} />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem 
          onClick={() => setTheme('light')}
          className={cn(theme === 'light' && "bg-accent")}
        >
          <Sun className="mr-2 h-4 w-4" />
          Light
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={() => setTheme('dark')}
          className={cn(theme === 'dark' && "bg-accent")}
        >
          <Moon className="mr-2 h-4 w-4" />
          Dark
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={() => setTheme('system')}
          className={cn(theme === 'system' && "bg-accent")}
        >
          <Monitor className="mr-2 h-4 w-4" />
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}