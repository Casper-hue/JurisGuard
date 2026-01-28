import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function SettingsPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center bg-background">
      <div className="max-w-md mx-auto">
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-yellow-500/20 flex items-center justify-center">
              <span className="text-2xl">⚙️</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-yellow-500 absolute -top-2 -right-2 flex items-center justify-center">
              <span className="text-xs text-white font-bold">!</span>
            </div>
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-foreground mb-4">Settings</h1>
        
        <div className="space-y-4 mb-6">
          <p className="text-muted-foreground">
            Manage your JurisGuard settings and data.
          </p>
        </div>
        
        <div className="space-y-4 mb-6">
          <Link href="/admin/data-management" className="block">
            <Button variant="default" className="w-full">
              Data Management
            </Button>
          </Link>
          <p className="text-sm text-muted-foreground">
            Manually update legal regulations and cases data
          </p>
        </div>
        
        <div className="bg-secondary/50 border border-border rounded-lg p-4 mb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-sm font-medium text-yellow-600">More Features</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Additional settings coming in future updates
          </p>
        </div>
      </div>
    </div>
  )
}