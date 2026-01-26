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
            This feature is currently under development.
          </p>
          <p className="text-sm text-muted-foreground">
            Settings management functionality will be available in a future update.
          </p>
        </div>
        
        <div className="bg-secondary/50 border border-border rounded-lg p-4 mb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-sm font-medium text-yellow-600">Coming Soon</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Expected release: Q2 2024
          </p>
        </div>
      </div>
    </div>
  )
}